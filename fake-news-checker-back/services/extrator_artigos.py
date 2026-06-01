import logging
from concurrent.futures import ThreadPoolExecutor, as_completed

import trafilatura

logger = logging.getLogger(__name__)

_TIMEOUT_SEGUNDOS = 8
_MAX_WORKERS = 3


def extrair_conteudo(url: str) -> dict | None:
    """
    Extrai texto principal e metadados de uma URL de notícia.
    Retorna None se a extração falhar (fail-safe).
    """
    try:
        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            logger.debug("Falha ao baixar %s", url)
            return None

        resultado = trafilatura.extract(
            downloaded,
            include_comments=False,
            include_tables=False,
            favor_precision=True,
            output_format="json",
        )

        if not resultado:
            return None

        import json
        dados = json.loads(resultado)

        texto = dados.get("text", "")
        if not texto or len(texto.strip()) < 50:
            return None

        return {
            "titulo": dados.get("title", ""),
            "texto": texto,
            "resumo": texto[:500],
            "data_publicacao": dados.get("date"),
            "autor": dados.get("author"),
        }
    except Exception as erro:
        logger.debug("Erro ao extrair conteúdo de %s: %s", url, str(erro))
        return None


def extrair_conteudo_multiplos(urls: list[str], max_fontes: int = 3) -> list[dict]:
    """
    Extrai conteúdo de múltiplas URLs em paralelo.
    Retorna lista de dicts com conteúdo extraído (pode ser menor que a entrada).
    """
    urls_limitadas = urls[:max_fontes]
    resultados = []

    with ThreadPoolExecutor(max_workers=_MAX_WORKERS) as executor:
        futures = {executor.submit(extrair_conteudo, url): url for url in urls_limitadas}
        for future in as_completed(futures):
            resultado = future.result()
            if resultado:
                resultado["url"] = futures[future]
                resultados.append(resultado)

    logger.info(
        "Extração de artigos: %d/%d URLs com conteúdo",
        len(resultados), len(urls_limitadas),
    )
    return resultados
