# ==============================================================================
# CheckAI API — Serviço de Coleta: Feeds RSS de Notícias Reais
# ==============================================================================
# Módulo convertido do notebook: src/coleta_rss_noticias_reais.ipynb
#
# Responsável por:
#   - Consultar feeds RSS de portais jornalísticos brasileiros
#   - Extrair metadados das notícias (título, link, resumo, data)
#   - Estruturar os dados em DataFrame padronizado
#   - Salvar CSV na camada raw do pipeline
#
# O objetivo deste pipeline NÃO é classificar as notícias como verdadeiras
# ou falsas, mas sim capturar linguagem jornalística política real para
# enriquecer o dataset de treino do modelo de ML.
# ==============================================================================

import logging
from datetime import datetime

import feedparser
import pandas as pd

from api.config import PIPELINE_NOTICIAS_REAIS
from api.utils.csv_handler import salvar_csv_raw


# Configuração do logger para este módulo
logger = logging.getLogger(__name__)


# ------------------------------------------------------------------------------
# Configuração dos Feeds RSS
# ------------------------------------------------------------------------------
# Cada feed é definido por portal, categoria e URL.
# Para adicionar um novo portal, basta inserir um novo dicionário na lista.
#
# Notas:
#   - CNN foi removida pois não trouxe resultados
#   - BBC busca como "GERAL" pois o XML não tem campo de categoria
#   - UOL busca como "GERAL" — filtragem por política será na curadoria
# ------------------------------------------------------------------------------

FEEDS_RSS_PADRAO: list[dict] = [
    {
        "portal": "AGENCIA_BRASIL",
        "categoria": "POLITICA",
        "url_feed": "https://agenciabrasil.ebc.com.br/rss/politica/feed.xml",
    },
    {
        "portal": "BBC_BRASIL",
        "categoria": "GERAL",
        "url_feed": "https://feeds.bbci.co.uk/portuguese/rss.xml",
    },
    {
        "portal": "G1_POLITICA",
        "categoria": "POLITICA",
        "url_feed": "https://g1.globo.com/rss/g1/politica/",
    },
    {
        "portal": "UOL_NOTICIAS",
        "categoria": "GERAL",
        "url_feed": "https://rss.uol.com.br/feed/noticias.xml",
    },
    {
        "portal": "PODER360",
        "categoria": "POLITICA",
        "url_feed": "https://www.poder360.com.br/feed/",
    },
]


def _coletar_feed_individual(feed_info: dict) -> list[dict]:
    """
    Coleta notícias de um único feed RSS.

    Função interna utilizada por coletar_rss_noticias() para processar
    cada portal individualmente. Trata erros de parsing silenciosamente
    para que a falha de um feed não interrompa os demais.

    Parâmetros:
        feed_info: Dicionário com 'portal', 'categoria' e 'url_feed'.

    Retorna:
        Lista de dicionários, um por notícia encontrada.
    """
    portal = feed_info["portal"]
    categoria = feed_info["categoria"]
    url_feed = feed_info["url_feed"]

    logger.info("Consultando portal: %s", portal)

    # feedparser já trata a maioria dos erros de parsing internamente
    feed = feedparser.parse(url_feed)

    # Verifica se houve problema no parsing (bozo = True indica anomalia)
    if feed.bozo:
        logger.warning(
            "Possível problema ao ler o feed de %s: %s",
            portal, str(feed.bozo_exception),
        )

    logger.info(
        "Portal %s: %d notícias encontradas", portal, len(feed.entries)
    )

    registros = []
    for noticia in feed.entries:
        registros.append({
            "portal": portal,
            "categoria": categoria,
            "titulo": noticia.get("title", ""),
            "link": noticia.get("link", ""),
            "resumo": noticia.get("summary", ""),
            "data_publicacao": noticia.get("published", ""),
            "url_feed": url_feed,
            "data_coleta": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
        })

    return registros


def coletar_rss_noticias(
    feeds: list[dict] | None = None,
) -> dict:
    """
    Executa a coleta de notícias de todos os feeds RSS configurados.

    Itera sobre cada portal, coleta as notícias disponíveis no feed e
    consolida tudo em um único DataFrame salvo como CSV.

    Parâmetros:
        feeds: Lista de feeds a consultar. Se None, usa FEEDS_RSS_PADRAO.

    Retorna:
        Dicionário com:
            - 'sucesso': bool
            - 'total_registros': int
            - 'arquivo_salvo': str
            - 'mensagem': str
            - 'detalhes_por_portal': dict (contagem por portal)
    """
    feeds_a_consultar = feeds if feeds is not None else FEEDS_RSS_PADRAO

    logger.info(
        "Iniciando coleta RSS de %d portais", len(feeds_a_consultar)
    )

    # Coleta de todos os feeds
    todos_registros: list[dict] = []
    contagem_por_portal: dict[str, int] = {}

    for feed_info in feeds_a_consultar:
        try:
            registros_feed = _coletar_feed_individual(feed_info)
            todos_registros.extend(registros_feed)
            contagem_por_portal[feed_info["portal"]] = len(registros_feed)
        except Exception as erro:
            # Captura qualquer erro inesperado para não interromper a coleta
            logger.error(
                "Erro inesperado ao coletar feed %s: %s",
                feed_info.get("portal", "desconhecido"), str(erro),
            )
            contagem_por_portal[feed_info.get("portal", "erro")] = 0

    # Verifica se algum registro foi coletado
    if not todos_registros:
        logger.warning("Nenhuma notícia coletada dos feeds RSS")
        return {
            "sucesso": True,
            "total_registros": 0,
            "arquivo_salvo": "",
            "mensagem": "Nenhuma notícia encontrada nos feeds configurados",
            "detalhes_por_portal": contagem_por_portal,
        }

    # Monta o DataFrame e salva
    df_raw = pd.DataFrame(todos_registros)

    caminho = salvar_csv_raw(
        df=df_raw,
        nome_pipeline=PIPELINE_NOTICIAS_REAIS,
        nome_base="rss_noticias_reais",
    )

    logger.info(
        "Coleta RSS concluída: %d notícias de %d portais salvas em %s",
        len(df_raw), len(feeds_a_consultar), caminho,
    )

    return {
        "sucesso": True,
        "total_registros": len(df_raw),
        "arquivo_salvo": str(caminho),
        "mensagem": f"Coleta RSS finalizada — {len(df_raw)} notícias",
        "detalhes_por_portal": contagem_por_portal,
    }
