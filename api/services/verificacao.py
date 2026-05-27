# ==============================================================================
# CheckAI API — Service: Verificações
# ==============================================================================
# Lógica de negócio do histórico de verificações:
#   - Executa a classificação (via service do classificador)
#   - Aplica a regra de "INCONCLUSIVO" para baixa confiança
#   - Persiste a verificação ligada ao usuário
#   - Lista o histórico e calcula o resumo estatístico
# ==============================================================================

from sqlalchemy.orm import Session

from api.db_models.verificacao import Verificacao
from api.services.classificador import classificar_texto


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


def criar_verificacao(
    db: Session, usuario_id: int, texto: str, tipo: str = "texto"
) -> Verificacao:
    """Classifica o texto, aplica a regra de confiança e salva no histórico."""
    resultado_ml = classificar_texto(texto)

    resultado = _mapear_resultado(
        resultado_ml["classificacao"], resultado_ml["confianca"]
    )

    verificacao = Verificacao(
        usuario_id=usuario_id,
        texto_verificado=texto,
        tipo=tipo,
        resultado=resultado,
        confianca=resultado_ml["confianca"],
        modelo_ativo="sim" if resultado_ml["modelo_ativo"] else "nao",
    )
    db.add(verificacao)
    db.commit()
    db.refresh(verificacao)
    return verificacao


def listar_verificacoes(
    db: Session, usuario_id: int, limite: int = 50
) -> list[Verificacao]:
    """Retorna o histórico do usuário, da mais recente para a mais antiga."""
    return (
        db.query(Verificacao)
        .filter(Verificacao.usuario_id == usuario_id)
        .order_by(Verificacao.criado_em.desc())
        .limit(limite)
        .all()
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