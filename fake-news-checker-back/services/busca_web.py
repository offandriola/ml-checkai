# ==============================================================================
# CheckAI API — Serviço de Busca Web em Tempo Real
# ==============================================================================
# Recupera fontes relevantes da web via Serper.dev para embasar o veredito
# de verificação. Operação fail-safe: qualquer falha retorna lista vazia,
# sem interromper o fluxo principal de classificação.
# ==============================================================================

import logging
from urllib.parse import urlparse

import requests

from config import SERPER_API_KEY


logger = logging.getLogger(__name__)

_URL_SERPER = "https://google.serper.dev/search"
_TIMEOUT_SEGUNDOS = 10


def buscar_fontes(query: str, n: int = 5) -> list[dict]:
    """
    Busca fontes relevantes na web para uma afirmação via Serper.dev.

    Parâmetros:
        query: Texto da afirmação a ser pesquisada.
        n: Número máximo de resultados a retornar.

    Retorna:
        Lista de dicts com: titulo, url, snippet, fonte.
        Retorna [] em caso de chave ausente ou qualquer erro de rede/API.
    """
    if not SERPER_API_KEY:
        logger.warning(
            "SERPER_API_KEY não configurada — busca web desabilitada. "
            "Configure a variável no .env para ativar."
        )
        return []

    try:
        resposta = requests.post(
            _URL_SERPER,
            headers={
                "X-API-KEY": SERPER_API_KEY,
                "Content-Type": "application/json",
            },
            json={"q": query, "gl": "br", "hl": "pt", "num": n},
            timeout=_TIMEOUT_SEGUNDOS,
        )
        resposta.raise_for_status()
    except requests.RequestException as erro:
        logger.error("Erro ao consultar Serper.dev: %s", str(erro))
        return []

    organicos = resposta.json().get("organic", [])

    fontes = []
    for item in organicos[:n]:
        url = item.get("link", "")
        display = item.get("displayLink") or urlparse(url).netloc
        fontes.append({
            "titulo": item.get("title", ""),
            "url": url,
            "snippet": item.get("snippet", ""),
            "fonte": display,
        })

    logger.info("Busca web retornou %d fontes para a query", len(fontes))
    return fontes
