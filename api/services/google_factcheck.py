# ==============================================================================
# CheckAI API — Serviço de Coleta: Google Fact Check Tools API
# ==============================================================================
# Módulo convertido do notebook: src/coleta_google_check.ipynb
#
# Responsável por:
#   - Consultar a Google Fact Check Tools API com termos políticos
#   - Navegar pelas páginas de resultados (paginação automática)
#   - Estruturar os dados em DataFrame padronizado
#   - Salvar CSV na camada raw do pipeline
#
# Referência da API:
#   https://developers.google.com/fact-check/tools/api
# ==============================================================================

import time
import logging
from datetime import datetime

import requests
import pandas as pd

from api.config import (
    GOOGLE_FACTCHECK_API_KEY,
    PIPELINE_GOOGLE_FACTCHECK,
)
from api.utils.csv_handler import salvar_csv_raw


# Configuração do logger para este módulo
logger = logging.getLogger(__name__)


# ------------------------------------------------------------------------------
# Constantes do Pipeline
# ------------------------------------------------------------------------------

# URL base da API do Google Fact Check
URL_API_GOOGLE = "https://factchecktools.googleapis.com/v1alpha1/claims:search"

# Termos de busca padrão para conteúdos políticos brasileiros
TERMOS_BUSCA_PADRAO: list[str] = [
    "urnas eletrônicas",
    "fraude nas urnas",
    "TSE",
    "eleições 2022",
    "eleições 2026",
    "voto impresso",
    "urna auditável",
    "Lula",
    "Bolsonaro",
    "Alexandre de Moraes",
    "Moraes",
    "Renan Santos",
    "MBL",
    "INSS",
    "fraude INSS",
    "Pix imposto",
    "taxação do Pix",
    "anistia Bolsonaro",
    "PL da anistia",
    "STF redes sociais",
    "Congresso Nacional",
]

# Configurações de coleta
TAMANHO_PAGINA = 50
MAX_IDADE_DIAS = 730
PAUSA_ENTRE_PAGINAS = 0.5  # segundos — respeita rate limit da API


def coletar_google_factcheck(
    termos: list[str] | None = None,
    max_paginas_por_termo: int = 3,
) -> dict:
    """
    Executa a coleta de afirmações checadas via Google Fact Check Tools API.

    Percorre cada termo de busca, navega pelas páginas de resultados e
    estrutura todas as claims encontradas em um DataFrame padronizado.

    Parâmetros:
        termos: Lista de termos de busca. Se None, usa TERMOS_BUSCA_PADRAO.
        max_paginas_por_termo: Limite de páginas a consultar por termo.

    Retorna:
        Dicionário com:
            - 'sucesso': bool
            - 'total_registros': int
            - 'arquivo_salvo': str (caminho do CSV)
            - 'mensagem': str

    Raises:
        RuntimeError: Se a chave da API não estiver configurada.
    """

    # ------------------------------------------------------------------
    # Validação da chave da API
    # ------------------------------------------------------------------
    if not GOOGLE_FACTCHECK_API_KEY:
        logger.error("Chave da API do Google Fact Check não configurada")
        raise RuntimeError(
            "Chave da API não encontrada. Configure a variável "
            "GOOGLE_FACTCHECK_API_KEY no arquivo .env ou "
            "google-factcheck-api-key.env"
        )

    # Usa termos padrão se nenhum foi informado
    termos_busca = termos if termos is not None else TERMOS_BUSCA_PADRAO

    logger.info(
        "Iniciando coleta Google Fact Check com %d termos", len(termos_busca)
    )

    # ------------------------------------------------------------------
    # Coleta principal — itera sobre termos e páginas
    # ------------------------------------------------------------------
    registros: list[dict] = []

    for termo in termos_busca:
        logger.info("Consultando termo: %s", termo)

        page_token = None
        pagina_atual = 1

        while pagina_atual <= max_paginas_por_termo:
            # Monta os parâmetros da requisição
            params = {
                "query": termo,
                "languageCode": "pt",
                "pageSize": TAMANHO_PAGINA,
                "maxAgeDays": MAX_IDADE_DIAS,
                "key": GOOGLE_FACTCHECK_API_KEY,
            }

            if page_token:
                params["pageToken"] = page_token

            # Faz a requisição à API
            try:
                resposta = requests.get(URL_API_GOOGLE, params=params, timeout=30)
            except requests.RequestException as erro:
                logger.warning(
                    "Erro de rede ao buscar '%s': %s", termo, str(erro)
                )
                break

            # Verifica se a resposta foi bem-sucedida
            if resposta.status_code != 200:
                logger.warning(
                    "Erro HTTP %d ao buscar '%s': %s",
                    resposta.status_code,
                    termo,
                    resposta.text[:300],
                )
                break

            dados = resposta.json()
            claims = dados.get("claims", [])

            logger.debug(
                "Termo '%s' — Página %d — %d claims encontradas",
                termo, pagina_atual, len(claims),
            )

            # Extrai dados de cada claim e seus reviews
            for claim in claims:
                texto_claim = claim.get("text", "")
                data_claim = claim.get("claimDate", "")

                for review in claim.get("claimReview", []):
                    registros.append({
                        "termo_busca": termo,
                        "texto_afirmacao": texto_claim,
                        "data_claim": data_claim,
                        "fonte_verificacao": review.get("publisher", {}).get("name", ""),
                        "url_checagem": review.get("url", ""),
                        "avaliacao_original": review.get("textualRating", ""),
                        "data_publicacao": review.get("reviewDate", ""),
                        "url_consulta": resposta.url,
                        "data_coleta": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
                        "origem_pipeline": "GOOGLE_FACTCHECK",
                    })

            # Verifica se há próxima página
            page_token = dados.get("nextPageToken")
            if not page_token:
                break

            pagina_atual += 1
            time.sleep(PAUSA_ENTRE_PAGINAS)

    # ------------------------------------------------------------------
    # Construção do DataFrame e salvamento
    # ------------------------------------------------------------------
    if not registros:
        logger.warning("Nenhum registro coletado do Google Fact Check")
        return {
            "sucesso": True,
            "total_registros": 0,
            "arquivo_salvo": "",
            "mensagem": "Nenhum registro encontrado para os termos informados",
        }

    df_raw = pd.DataFrame(registros)

    caminho_arquivo = salvar_csv_raw(
        df=df_raw,
        nome_pipeline=PIPELINE_GOOGLE_FACTCHECK,
        nome_base="google_factcheck",
    )

    logger.info(
        "Coleta Google Fact Check concluída: %d registros salvos em %s",
        len(df_raw), caminho_arquivo,
    )

    return {
        "sucesso": True,
        "total_registros": len(df_raw),
        "arquivo_salvo": str(caminho_arquivo),
        "mensagem": f"Coleta finalizada com sucesso — {len(df_raw)} registros",
    }
