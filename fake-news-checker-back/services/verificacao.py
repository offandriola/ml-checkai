# ==============================================================================
# CheckAI API — Service: Verificações
# ==============================================================================
# Lógica de negócio do histórico de verificações:
#   - Executa a classificação (via service do classificador)
#   - Aplica a regra de "INCONCLUSIVO" para baixa confiança
#   - Persiste a verificação ligada ao usuário
#   - Lista o histórico e calcula o resumo estatístico
# ==============================================================================

import json
import logging
from concurrent.futures import ThreadPoolExecutor

from sqlalchemy.orm import Session
from sqlalchemy import or_
from config import EXTRAIR_ARTIGOS_MAX
from db_models.verificacao import Verificacao
from models.schemas import VerificacaoResponse
from services.classificador import classificar_texto
from services.busca_web import buscar_fontes
from services.concordancia_fontes import CONFIANCA_ALINHAMENTO_FRACO, reconciliar_com_fontes
from services.extrator_artigos import extrair_conteudo, extrair_conteudo_multiplos
from services.analisador_imagem import extrair_texto_imagem, extrair_texto_imagem_bytes
from services.nli import agregar_resultado_nli, classificar_pares_nli
from services.ranking_fontes import ranquear_fontes
from services.decisor_veredito import decidir_veredito_final


logger = logging.getLogger(__name__)


# Abaixo deste nível de confiança, o resultado é tratado como INCONCLUSIVO.
LIMIAR_INCONCLUSIVO = 0.60


def _mapear_resultado(classificacao: str, confianca: float) -> str:
    """
    Converte a saída do classificador (VERDADEIRO/FALSO) no rótulo de
    histórico (REAL/FALSO/INCONCLUSIVO), aplicando o limiar de confiança.
    """
    if confianca < LIMIAR_INCONCLUSIVO:
        return "INCONCLUSIVO"
    if classificacao == "VERDADEIRO":
        return "REAL"
    if classificacao == "FALSO":
        return "FALSO"
    return "INCONCLUSIVO"  # cobre o caso "ERRO" do classificador


def _enriquecer_fontes_com_artigos(fontes: list[dict]) -> None:
    """Opcional: baixa páginas completas (lento). Snippets da Serper bastam no fluxo rápido."""
    if EXTRAIR_ARTIGOS_MAX <= 0 or not fontes:
        return
    urls = [f["url"] for f in fontes if f.get("url")]
    artigos_extraidos = extrair_conteudo_multiplos(
        urls, max_fontes=min(EXTRAIR_ARTIGOS_MAX, 3)
    )
    artigos_por_url = {a["url"]: a for a in artigos_extraidos}
    for fonte in fontes:
        artigo = artigos_por_url.get(fonte.get("url", ""))
        if artigo:
            fonte["texto_extraido"] = artigo.get("resumo", "")


_NLI_VOTOS_VAZIO: dict = {"SUPPORTS": 0, "REFUTES": 0, "NEUTRAL": 0}


def _enriquecer_fontes_com_nli(texto: str, fontes: list[dict]) -> tuple[str, float, dict]:
    """
    Classifica cada fonte com NLI e retorna o resultado agregado.

    Fail-safe: qualquer exceção retorna veredito neutro e deixa as fontes
    sem campos NLI, mantendo o fluxo principal intacto.

    Retorna:
        (nli_resultado_agregado, nli_score_agregado, nli_votos)
    """
    try:
        nli_resultados = classificar_pares_nli(texto, fontes)
        for fonte, nli in zip(fontes, nli_resultados):
            fonte["nli_label"] = nli.get("label")
            fonte["nli_score"] = nli.get("score")
        agregado = agregar_resultado_nli(nli_resultados)
        return (
            agregado.get("label", "NEUTRAL"),
            float(agregado.get("score", 0.0)),
            agregado.get("votos", dict(_NLI_VOTOS_VAZIO)),
        )
    except Exception as exc:
        logger.warning("NLI falhou durante verificação, seguindo sem NLI: %s", exc)
        return "NEUTRAL", 0.0, dict(_NLI_VOTOS_VAZIO)


def executar_verificacao(texto: str, tipo: str = "texto") -> dict:
    """
    Executa busca web, classificação ML e mapeamento de resultado.

    Usado pela verificação pública (landing) e pelo histórico autenticado.
    Para tipo="link", extrai o conteúdo da URL antes de classificar.
    """
    texto_para_analisar = texto
    if tipo == "link":
        artigo = extrair_conteudo(texto)
        if artigo and artigo.get("texto"):
            texto_para_analisar = artigo["texto"]
            logger.info("Link: extraídos %d chars de %s", len(texto_para_analisar), texto)
        else:
            logger.warning("Link: falha ao extrair conteúdo de %s — usando URL como texto", texto)
    elif tipo == "imagem":
        texto_ocr = extrair_texto_imagem(texto)
        if texto_ocr:
            texto_para_analisar = texto_ocr
            logger.info("Imagem: OCR extraiu %d chars", len(texto_para_analisar))
        else:
            logger.warning("Imagem: OCR falhou — sem texto extraível na imagem")
            texto_para_analisar = ""

    # Label legível para salvar no histórico (evita gravar base64 no banco)
    texto_legivel = (
        "[Imagem enviada para análise]"
        if tipo == "imagem" and texto.startswith("data:")
        else texto
    )

    with ThreadPoolExecutor(max_workers=2) as pool:
        fut_fontes = pool.submit(buscar_fontes, texto_para_analisar)
        fut_ml = pool.submit(classificar_texto, texto_para_analisar)
        fontes = fut_fontes.result()
        resultado_ml = fut_ml.result()

    # Filtra fontes sociais/inúteis e prioriza oficiais/jornalísticas
    fontes = ranquear_fontes(fontes, max_fontes=5)

    _enriquecer_fontes_com_artigos(fontes)

    # Enriquece cada fonte com NLI (não altera o veredito final)
    nli_resultado_agregado, nli_score_agregado, nli_votos = _enriquecer_fontes_com_nli(
        texto, fontes
    )

    classificacao, confianca, _ = reconciliar_com_fontes(
        texto_para_analisar,
        resultado_ml["classificacao"],
        resultado_ml["confianca"],
        fontes,
    )

    resultado = _mapear_resultado(classificacao, confianca)
    if resultado == "INCONCLUSIVO" and confianca < CONFIANCA_ALINHAMENTO_FRACO:
        confianca = CONFIANCA_ALINHAMENTO_FRACO

    # Decisor final: combina fluxo atual + NLI de forma conservadora
    veredito = decidir_veredito_final(
        resultado_atual=resultado,
        confianca_atual=confianca,
        nli_resultado_agregado=nli_resultado_agregado,
        nli_score_agregado=nli_score_agregado,
        nli_votos=nli_votos,
        fontes=fontes,
    )
    resultado = veredito["resultado"]
    confianca = veredito["confianca"]

    return {
        "texto_verificado": texto_legivel,
        "tipo": tipo,
        "resultado": resultado,
        "confianca": confianca,
        "modelo_ativo": "sim" if resultado_ml["modelo_ativo"] else "nao",
        "fontes": fontes,
        "nli_resultado_agregado": nli_resultado_agregado,
        "nli_score_agregado": nli_score_agregado,
        "nli_votos": nli_votos,
        "decisao_origem": veredito["decisao_origem"],
        "justificativa_decisao": veredito["justificativa_decisao"],
    }


def executar_verificacao_imagem(conteudo: bytes) -> dict:
    """
    Recebe bytes de uma imagem, extrai texto via OCR e classifica.
    Usado pelo endpoint multipart /verificacoes/imagem.
    """
    texto_ocr = extrair_texto_imagem_bytes(conteudo)
    if not texto_ocr:
        return {
            "texto_verificado": "[Imagem enviada para análise]",
            "tipo": "imagem",
            "resultado": "INCONCLUSIVO",
            "confianca": CONFIANCA_ALINHAMENTO_FRACO,
            "modelo_ativo": "nao",
            "fontes": [],
        }

    with ThreadPoolExecutor(max_workers=2) as pool:
        fut_fontes = pool.submit(buscar_fontes, texto_ocr)
        fut_ml = pool.submit(classificar_texto, texto_ocr)
        fontes = fut_fontes.result()
        resultado_ml = fut_ml.result()

    _enriquecer_fontes_com_artigos(fontes)

    classificacao, confianca, _ = reconciliar_com_fontes(
        texto_ocr,
        resultado_ml["classificacao"],
        resultado_ml["confianca"],
        fontes,
    )

    resultado = _mapear_resultado(classificacao, confianca)
    if resultado == "INCONCLUSIVO" and confianca < CONFIANCA_ALINHAMENTO_FRACO:
        confianca = CONFIANCA_ALINHAMENTO_FRACO

    return {
        "texto_verificado": "[Imagem enviada para análise]",
        "tipo": "imagem",
        "resultado": resultado,
        "confianca": confianca,
        "modelo_ativo": "sim" if resultado_ml["modelo_ativo"] else "nao",
        "fontes": fontes,
    }


def criar_verificacao_por_imagem(
    db: Session, usuario_id: int, conteudo: bytes
) -> Verificacao:
    """Processa imagem via OCR, classifica e salva no histórico."""
    dados = executar_verificacao_imagem(conteudo)

    verificacao = Verificacao(
        usuario_id=usuario_id,
        texto_verificado=dados["texto_verificado"],
        tipo=dados["tipo"],
        resultado=dados["resultado"],
        confianca=dados["confianca"],
        modelo_ativo=dados["modelo_ativo"],
        fontes_json=json.dumps(dados["fontes"], ensure_ascii=False)
        if dados["fontes"]
        else None,
    )
    db.add(verificacao)
    db.commit()
    db.refresh(verificacao)
    return verificacao


def criar_verificacao(
    db: Session, usuario_id: int, texto: str, tipo: str = "texto"
) -> Verificacao:
    """Classifica o texto, aplica a regra de confiança e salva no histórico."""
    dados = executar_verificacao(texto, tipo)

    verificacao = Verificacao(
        usuario_id=usuario_id,
        texto_verificado=dados["texto_verificado"],
        tipo=dados["tipo"],
        resultado=dados["resultado"],
        confianca=dados["confianca"],
        modelo_ativo=dados["modelo_ativo"],
        fontes_json=json.dumps(dados["fontes"], ensure_ascii=False)
        if dados["fontes"]
        else None,
    )
    db.add(verificacao)
    db.commit()
    db.refresh(verificacao)
    return verificacao


def verificacao_para_response(verificacao: Verificacao) -> VerificacaoResponse:
    """Serializa o ORM com fontes_json → list[FonteInfo]."""
    return VerificacaoResponse.model_validate(verificacao)


def listar_verificacoes(
    db: Session,
    usuario_id: int,
    *,
    resultado: str | None = None,
    busca: str | None = None,
    pagina: int = 1,
    por_pagina: int = 10,
) -> dict:
    """
    Lista o histórico do usuário com filtros e paginação.

    Filtros aceitos:
        - resultado: 'REAL', 'FALSO' ou 'INCONCLUSIVO' (None = todos)
        - busca: substring buscada no texto_verificado (case-insensitive)

    Retorna um dicionário no formato do envelope paginado.
    """
    # Query base: só verificações deste usuário
    query = db.query(Verificacao).filter(Verificacao.usuario_id == usuario_id)

    # Filtro por resultado (Todas/Verdadeiras/Falsas/Inconclusivas da tela)
    if resultado:
        query = query.filter(Verificacao.resultado == resultado.upper())

    # Busca por palavra-chave no conteúdo verificado
    if busca:
        termo = f"%{busca}%"
        query = query.filter(Verificacao.texto_verificado.ilike(termo))

    # Total ANTES da paginação (para o rodapé "1-10 de 115 resultados")
    total = query.count()

    # Ordena da mais recente para a mais antiga e aplica a paginação
    offset = (pagina - 1) * por_pagina
    itens = (
        query.order_by(Verificacao.criado_em.desc())
        .offset(offset)
        .limit(por_pagina)
        .all()
    )

    # Calcula o total de páginas (arredondando para cima)
    total_paginas = (total + por_pagina - 1) // por_pagina if total > 0 else 0

    return {
        "total": total,
        "pagina": pagina,
        "por_pagina": por_pagina,
        "total_paginas": total_paginas,
        "itens": itens,
    }


def buscar_verificacao_por_id(
    db: Session, usuario_id: int, verificacao_id: int
) -> Verificacao | None:
    """
    Busca uma verificação específica, garantindo que pertença ao usuário.

    SEGURANÇA (OWASP A01 - Broken Access Control):
        O filtro por usuario_id evita que um usuário acesse verificações
        de outro só trocando o id na URL (IDOR).
    """
    return (
        db.query(Verificacao)
        .filter(
            Verificacao.id == verificacao_id,
            Verificacao.usuario_id == usuario_id,
        )
        .first()
    )


def calcular_resumo(db: Session, usuario_id: int) -> dict:
    """Calcula as estatísticas agregadas do usuário para o dashboard."""
    verificacoes = (
        db.query(Verificacao)
        .filter(Verificacao.usuario_id == usuario_id)
        .all()
    )

    total = len(verificacoes)
    reais = sum(1 for v in verificacoes if v.resultado == "REAL")
    falsas = sum(1 for v in verificacoes if v.resultado == "FALSO")
    inconclusivas = sum(1 for v in verificacoes if v.resultado == "INCONCLUSIVO")
    percentual = round((reais / total * 100), 1) if total > 0 else 0.0

    return {
        "total_verificacoes": total,
        "total_reais": reais,
        "total_falsas": falsas,
        "total_inconclusivas": inconclusivas,
        "percentual_reais": percentual,
    }


def limpar_historico(db: Session, usuario_id: int) -> int:
    """
    Apaga todas as verificações do usuário. Retorna o total apagado.

    Usado pelo botão 'Limpar histórico' da Zona de perigo das configurações.
    """
    total = (
        db.query(Verificacao)
        .filter(Verificacao.usuario_id == usuario_id)
        .delete(synchronize_session=False)
    )
    db.commit()
    return total