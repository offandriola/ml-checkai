# ==============================================================================
# CheckAI API — Serviço de Busca Web em Tempo Real
# ==============================================================================
# Recupera fontes relevantes da web via Serper.dev para embasar o veredito
# de verificação. Operação fail-safe: qualquer falha retorna lista vazia,
# sem interromper o fluxo principal de classificação.
# ==============================================================================

import json
import logging
import re
import unicodedata
from functools import lru_cache
from urllib.parse import urlparse

import requests

from config import SERPER_API_KEY


logger = logging.getLogger(__name__)

_URL_SERPER = "https://google.serper.dev/search"
_TIMEOUT_SEGUNDOS = 10


def _normalizar_query(query: str) -> str:
    texto = query.lower().strip()
    texto = unicodedata.normalize("NFD", texto)
    texto = "".join(c for c in texto if unicodedata.category(c) != "Mn")
    texto = re.sub(r"\s+", " ", texto)
    return texto


def _consultar_serper(query: str, n: int) -> list[dict]:
    """Chamada HTTP à API Serper (sem cache)."""
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

    return fontes


@lru_cache(maxsize=512)
def _buscar_fontes_cache(chave: str, n: int) -> str:
    """
    Cache em memória por texto normalizado — mesma frase → mesmas fontes.
    Retorna JSON para permitir uso com lru_cache (lista não é hashable).
    """
    fontes = _consultar_serper(chave, n)
    logger.info("Busca web (cache miss) — %d fontes para chave=%.60s", len(fontes), chave)
    return json.dumps(fontes, ensure_ascii=False)


def buscar_fontes(query: str, n: int = 5) -> list[dict]:
    """
    Busca fontes relevantes na web para uma afirmação via Serper.dev.

    A mesma consulta (após normalização) reutiliza o resultado em cache,
    evitando vereditos diferentes para textos idênticos.
    """
    chave = _normalizar_query(query)
    if not chave:
        return []

    payload = _buscar_fontes_cache(chave, n)
    fontes = json.loads(payload)
    logger.info("Busca web retornou %d fontes (chave normalizada)", len(fontes))
    return fontes


def limpar_cache_fontes() -> None:
    """Útil em testes ou após mudança de configuração."""
    _buscar_fontes_cache.cache_clear()
