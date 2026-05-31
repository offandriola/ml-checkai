# ==============================================================================
# CheckAI API — Rota: Coleta de Dados
# ==============================================================================
# Endpoints para disparar os pipelines de coleta de dados.
# Cada pipeline pode ser executado individualmente ou todos de uma vez.
#
# ATENÇÃO: Os endpoints de coleta fazem requisições externas a APIs e
# feeds RSS, portanto o tempo de resposta pode variar. Em produção,
# considere mover essas operações para uma fila de tarefas (Celery).
# ==============================================================================

import logging
from datetime import datetime

from fastapi import APIRouter, HTTPException

from config import (
    PIPELINE_GOOGLE_FACTCHECK,
    PIPELINE_FONTES_OFICIAIS,
    PIPELINE_NOTICIAS_REAIS,
)
from models.schemas import (
    ColetaGoogleRequest,
    ColetaFontesOficiaisRequest,
    ColetaResponse,
    ColetaTodasResponse,
)
from services.google_factcheck import coletar_google_factcheck
from services.fontes_oficiais import coletar_todas_fontes_oficiais
from services.rss_noticias import coletar_rss_noticias


logger = logging.getLogger(__name__)

# Cria o router com prefixo e tag para organização no Swagger
router = APIRouter(
    prefix="/api/v1/coleta",
    tags=["Coleta de Dados"],
)


@router.post(
    "/google-factcheck",
    response_model=ColetaResponse,
    summary="Coletar dados do Google Fact Check",
    description=(
        "Dispara a coleta de afirmações checadas via Google Fact Check Tools API. "
        "Requer a chave GOOGLE_FACTCHECK_API_KEY configurada no .env."
    ),
)
async def coleta_google_factcheck(
    params: ColetaGoogleRequest | None = None,
) -> ColetaResponse:
    """
    Executa o pipeline de coleta do Google Fact Check.

    Aceita parâmetros opcionais para personalizar os termos de busca
    e o limite de páginas. Se nenhum parâmetro for enviado, utiliza
    as configurações padrão do serviço.
    """
    # Usa valores padrão se nenhum body foi enviado
    if params is None:
        params = ColetaGoogleRequest()

    try:
        resultado = coletar_google_factcheck(
            termos=params.termos,
            max_paginas_por_termo=params.max_paginas_por_termo,
        )
    except RuntimeError as erro:
        # SEGURANÇA (OWASP A09): Loga detalhes internamente, retorna msg segura
        logger.error("API key não configurada: %s", str(erro))
        raise HTTPException(
            status_code=503,
            detail="Serviço indisponível: chave da API não configurada.",
        )
    except Exception as erro:
        # SEGURANÇA (OWASP A09): Nunca vaza str(erro) ao cliente
        logger.error("Erro inesperado na coleta Google: %s", str(erro), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Erro interno na coleta. Consulte os logs do servidor.",
        )

    return ColetaResponse(
        sucesso=resultado["sucesso"],
        pipeline=PIPELINE_GOOGLE_FACTCHECK,
        total_registros=resultado["total_registros"],
        arquivo_salvo=resultado["arquivo_salvo"],
        timestamp=datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
        mensagem=resultado["mensagem"],
    )


@router.post(
    "/fontes-oficiais",
    response_model=ColetaResponse,
    summary="Coletar dados de fontes oficiais",
    description=(
        "Dispara a coleta de proposições da Câmara dos Deputados e "
        "matérias do Senado Federal. Não requer chave de API."
    ),
)
async def coleta_fontes_oficiais(
    params: ColetaFontesOficiaisRequest | None = None,
) -> ColetaResponse:
    """
    Executa o pipeline de coleta de fontes oficiais (Câmara + Senado).

    Cada fonte gera um CSV separado. O total de registros informado
    é a soma de ambas as fontes.
    """
    if params is None:
        params = ColetaFontesOficiaisRequest()

    try:
        resultado = coletar_todas_fontes_oficiais(
            ano=params.ano,
            itens_camara=params.itens_camara,
        )
    except Exception as erro:
        logger.error("Erro inesperado na coleta fontes oficiais: %s", str(erro), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Erro interno na coleta. Consulte os logs do servidor.",
        )

    # Para fontes oficiais, o campo arquivo_salvo concatena os caminhos
    arquivos = []
    if resultado.get("detalhes", {}).get("camara", {}).get("arquivo_salvo"):
        arquivos.append(resultado["detalhes"]["camara"]["arquivo_salvo"])
    if resultado.get("detalhes", {}).get("senado", {}).get("arquivo_salvo"):
        arquivos.append(resultado["detalhes"]["senado"]["arquivo_salvo"])

    return ColetaResponse(
        sucesso=resultado["sucesso"],
        pipeline=PIPELINE_FONTES_OFICIAIS,
        total_registros=resultado["total_registros"],
        arquivo_salvo=" | ".join(arquivos),
        timestamp=datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
        mensagem=resultado["mensagem"],
    )


@router.post(
    "/rss-noticias",
    response_model=ColetaResponse,
    summary="Coletar notícias via feeds RSS",
    description=(
        "Dispara a coleta de notícias de portais jornalísticos brasileiros "
        "via feeds RSS. Não requer chave de API."
    ),
)
async def coleta_rss_noticias() -> ColetaResponse:
    """
    Executa o pipeline de coleta de notícias reais via RSS.

    Consulta todos os portais configurados (Agência Brasil, BBC, G1,
    UOL, Poder360) e consolida as notícias em um único CSV.
    """
    try:
        resultado = coletar_rss_noticias()
    except Exception as erro:
        logger.error("Erro inesperado na coleta RSS: %s", str(erro), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Erro interno na coleta. Consulte os logs do servidor.",
        )

    return ColetaResponse(
        sucesso=resultado["sucesso"],
        pipeline=PIPELINE_NOTICIAS_REAIS,
        total_registros=resultado["total_registros"],
        arquivo_salvo=resultado["arquivo_salvo"],
        timestamp=datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
        mensagem=resultado["mensagem"],
    )


@router.post(
    "/todas",
    response_model=ColetaTodasResponse,
    summary="Executar todos os pipelines de coleta",
    description=(
        "Dispara todos os pipelines de coleta sequencialmente: "
        "Google Fact Check → Fontes Oficiais → RSS Notícias. "
        "O tempo de resposta pode ser longo."
    ),
)
async def coleta_todas() -> ColetaTodasResponse:
    """
    Executa todos os 3 pipelines de coleta de dados em sequência.

    Cada pipeline é independente — a falha de um não impede os demais.
    """
    resultados: list[ColetaResponse] = []
    total_geral = 0

    # --- Pipeline 1: Google Fact Check ---
    try:
        res_google = coletar_google_factcheck()
        resposta_google = ColetaResponse(
            sucesso=res_google["sucesso"],
            pipeline=PIPELINE_GOOGLE_FACTCHECK,
            total_registros=res_google["total_registros"],
            arquivo_salvo=res_google["arquivo_salvo"],
            timestamp=datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
            mensagem=res_google["mensagem"],
        )
        resultados.append(resposta_google)
        total_geral += res_google["total_registros"]
    except Exception as erro:
        logger.error("Falha no pipeline Google: %s", str(erro))
        resultados.append(ColetaResponse(
            sucesso=False,
            pipeline=PIPELINE_GOOGLE_FACTCHECK,
            total_registros=0,
            arquivo_salvo="",
            timestamp=datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
            mensagem=f"Falha: {str(erro)}",
        ))

    # --- Pipeline 2: Fontes Oficiais ---
    try:
        res_oficiais = coletar_todas_fontes_oficiais()
        arquivos_oficiais = []
        if res_oficiais.get("detalhes", {}).get("camara", {}).get("arquivo_salvo"):
            arquivos_oficiais.append(res_oficiais["detalhes"]["camara"]["arquivo_salvo"])
        if res_oficiais.get("detalhes", {}).get("senado", {}).get("arquivo_salvo"):
            arquivos_oficiais.append(res_oficiais["detalhes"]["senado"]["arquivo_salvo"])

        resposta_oficiais = ColetaResponse(
            sucesso=res_oficiais["sucesso"],
            pipeline=PIPELINE_FONTES_OFICIAIS,
            total_registros=res_oficiais["total_registros"],
            arquivo_salvo=" | ".join(arquivos_oficiais),
            timestamp=datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
            mensagem=res_oficiais["mensagem"],
        )
        resultados.append(resposta_oficiais)
        total_geral += res_oficiais["total_registros"]
    except Exception as erro:
        logger.error("Falha no pipeline Fontes Oficiais: %s", str(erro))
        resultados.append(ColetaResponse(
            sucesso=False,
            pipeline=PIPELINE_FONTES_OFICIAIS,
            total_registros=0,
            arquivo_salvo="",
            timestamp=datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
            mensagem=f"Falha: {str(erro)}",
        ))

    # --- Pipeline 3: RSS Notícias ---
    try:
        res_rss = coletar_rss_noticias()
        resposta_rss = ColetaResponse(
            sucesso=res_rss["sucesso"],
            pipeline=PIPELINE_NOTICIAS_REAIS,
            total_registros=res_rss["total_registros"],
            arquivo_salvo=res_rss["arquivo_salvo"],
            timestamp=datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
            mensagem=res_rss["mensagem"],
        )
        resultados.append(resposta_rss)
        total_geral += res_rss["total_registros"]
    except Exception as erro:
        logger.error("Falha no pipeline RSS: %s", str(erro))
        resultados.append(ColetaResponse(
            sucesso=False,
            pipeline=PIPELINE_NOTICIAS_REAIS,
            total_registros=0,
            arquivo_salvo="",
            timestamp=datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
            mensagem=f"Falha: {str(erro)}",
        ))

    # Verifica se todas foram bem-sucedidas
    todas_ok = all(r.sucesso for r in resultados)

    return ColetaTodasResponse(
        sucesso=todas_ok,
        resultados=resultados,
        total_geral=total_geral,
        timestamp=datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
    )
