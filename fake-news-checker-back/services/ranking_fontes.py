# ==============================================================================
# CheckAI API — Serviço de Ranking e Filtragem de Fontes
# ==============================================================================
# Recebe a lista bruta de fontes da Serper.dev e:
#   1. Remove fontes sem dados mínimos úteis (título, URL, snippet curto).
#   2. Detecta o tipo de cada fonte pelo domínio.
#   3. Descarta fontes de redes sociais (baixíssimo valor textual para NLI).
#   4. Atribui peso de confiabilidade por tipo.
#   5. Ordena por peso decrescente (mais confiável primeiro).
#   6. Retorna no máximo max_fontes fontes.
#
# Cada fonte retornada recebe três campos extras:
#   tipo_fonte           — categoria detectada
#   confiabilidade_fonte — "alta", "media", "baixa" ou "muito_baixa"
#   peso_fonte           — float de 0.0 a 1.0
# ==============================================================================

import logging
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Listas de domínios por categoria
# ---------------------------------------------------------------------------

# Fontes primárias de governo, judiciário e legislativo
_DOMINIOS_OFICIAIS: tuple[str, ...] = (
    "gov.br",
    "tse.jus.br",
    "camara.leg.br",
    "senado.leg.br",
    "stf.jus.br",
    "stj.jus.br",
    "planalto.gov.br",
    "ibge.gov.br",
    "bcb.gov.br",
    "saude.gov.br",
    "mec.gov.br",
    "agenciabrasil.ebc.com.br",
    "ebc.com.br",
    "receita.fazenda.gov.br",
    "transparencia.gov.br",
)

# Agências e sites de verificação de fatos
_DOMINIOS_FACT_CHECK: tuple[str, ...] = (
    "aosfatos.org",
    "lupa.uol.com.br",
    "agencialupa.com.br",
    "boatos.org",
    "checamos.com.br",
    "politifact.com",
    "snopes.com",
    "fatosefalsos",
    "estadao-verifica",
    "confere",
    "verifica",
)

# Grandes veículos de imprensa nacionais e internacionais
_DOMINIOS_JORNALISTICOS: tuple[str, ...] = (
    "g1.globo.com",
    "oglobo.globo.com",
    "valor.globo.com",
    "extra.globo.com",
    "globo.com",
    "bbc.com",
    "bbc.co.uk",
    "cnnbrasil.com.br",
    "cnn.com",
    "folha.uol.com.br",
    "uol.com.br",
    "estadao.com.br",
    "veja.abril.com.br",
    "abril.com.br",
    "correiobraziliense.com.br",
    "gazetadopovo.com.br",
    "metropoles.com",
    "r7.com",
    "terra.com.br",
    "cartacapital.com.br",
    "brasildefato.com.br",
    "poder360.com.br",
    "exame.com",
    "infomoney.com.br",
    "reuters.com",
    "apnews.com",
    "theguardian.com",
    "noticias.uol.com.br",
    "band.uol.com.br",
    "jovempan.news",
    "record.r7.com",
)

# Enciclopédias e wikis — úteis mas não são verificação primária
_DOMINIOS_ENCICLOPEDIA: tuple[str, ...] = (
    "wikipedia.org",
    "wikimedia.org",
    "wikidata.org",
)

# Redes sociais e plataformas de vídeo — descartadas por padrão
# (snippets são inúteis para NLI e o conteúdo não é verificável)
_DOMINIOS_SOCIAIS: tuple[str, ...] = (
    "instagram.com",
    "facebook.com",
    "youtube.com",
    "youtu.be",
    "tiktok.com",
    "x.com",
    "twitter.com",
    "reddit.com",
    "threads.net",
    "whatsapp.com",
    "t.me",
    "telegram.me",
    "linkedin.com",
    "pinterest.com",
    "snapchat.com",
)

# ---------------------------------------------------------------------------
# Tabelas de peso e confiabilidade por tipo
# ---------------------------------------------------------------------------

_PESO_POR_TIPO: dict[str, float] = {
    "oficial":       1.00,
    "fact_checking": 0.95,
    "jornalistica":  0.80,
    "enciclopedia":  0.30,
    "social":        0.05,   # na prática são descartadas antes de chegar aqui
    "desconhecida":  0.45,
}

_CONFIABILIDADE_POR_TIPO: dict[str, str] = {
    "oficial":       "alta",
    "fact_checking": "alta",
    "jornalistica":  "alta",
    "enciclopedia":  "baixa",
    "social":        "muito_baixa",
    "desconhecida":  "media",
}

# Comprimento mínimo de snippet para que a fonte seja útil ao NLI
_MIN_SNIPPET_CHARS: int = 20

# Bônus aplicado quando o snippet tem texto suficientemente longo
# (mais contexto → NLI consegue inferir melhor)
_BONUS_SNIPPET_LONGO: float = 0.05
_THRESHOLD_SNIPPET_LONGO: int = 120


# ---------------------------------------------------------------------------
# Funções internas
# ---------------------------------------------------------------------------

def _extrair_dominio(url: str) -> str:
    """
    Extrai o domínio raiz de uma URL ou string de display domain.

    Exemplos:
        "https://www.g1.globo.com/politica"  → "g1.globo.com"
        "g1.globo.com"                        → "g1.globo.com"
    """
    texto = url.lower().strip()
    try:
        parsed = urlparse(texto if "://" in texto else f"https://{texto}")
        dominio = parsed.netloc or parsed.path.split("/")[0]
    except Exception:
        dominio = texto.split("/")[0]
    return dominio.removeprefix("www.")


def _detectar_tipo(url: str, campo_fonte: str) -> str:
    """
    Classifica a fonte em uma das categorias conhecidas.

    Combina o domínio extraído da URL com o campo 'fonte' (display domain
    retornado pela Serper) para maximizar a cobertura.

    Verifica sociais PRIMEIRO para evitar falsos positivos em domínios
    que contenham substrings compartilhadas com outras categorias.
    """
    dominio_url = _extrair_dominio(url)
    referencia = f"{dominio_url} {campo_fonte.lower()}"

    if any(d in referencia for d in _DOMINIOS_SOCIAIS):
        return "social"
    if any(d in referencia for d in _DOMINIOS_FACT_CHECK):
        return "fact_checking"
    if any(d in referencia for d in _DOMINIOS_OFICIAIS):
        return "oficial"
    if any(d in referencia for d in _DOMINIOS_JORNALISTICOS):
        return "jornalistica"
    if any(d in referencia for d in _DOMINIOS_ENCICLOPEDIA):
        return "enciclopedia"
    return "desconhecida"


def _calcular_peso(tipo: str, snippet: str) -> float:
    """
    Calcula o peso final de confiabilidade da fonte.

    Parte do peso base do tipo e adiciona bônus se o snippet for longo
    o suficiente para fornecer contexto adequado ao NLI.
    """
    peso_base = _PESO_POR_TIPO.get(tipo, 0.45)
    bonus = _BONUS_SNIPPET_LONGO if len(snippet) >= _THRESHOLD_SNIPPET_LONGO else 0.0
    return round(min(1.0, peso_base + bonus), 4)


def _fonte_valida(fonte: dict) -> bool:
    """
    Retorna False para fontes que não têm dados mínimos para análise.

    Critérios de descarte:
    - Título ausente ou com menos de 3 caracteres
    - Snippet ausente ou com menos de _MIN_SNIPPET_CHARS caracteres
    - URL ausente
    """
    titulo = (fonte.get("titulo") or "").strip()
    snippet = (fonte.get("snippet") or "").strip()
    url = (fonte.get("url") or "").strip()
    return len(titulo) >= 3 and len(snippet) >= _MIN_SNIPPET_CHARS and len(url) > 0


# ---------------------------------------------------------------------------
# Função principal
# ---------------------------------------------------------------------------

def ranquear_fontes(fontes: list[dict], max_fontes: int = 5) -> list[dict]:
    """
    Filtra, classifica e ranqueia as fontes recebidas da Serper.dev.

    Fluxo interno:
        1. Descarta fontes com dados insuficientes.
        2. Descarta fontes de redes sociais.
        3. Calcula tipo, confiabilidade e peso para cada fonte restante.
        4. Ordena por peso decrescente (mais confiável primeiro).
        5. Retorna no máximo max_fontes fontes.

    Parâmetros:
        fontes     — lista de dicts com campos: titulo, url, snippet, fonte
        max_fontes — número máximo de fontes a retornar (default: 5)

    Retorna:
        Lista filtrada e ordenada. Cada item tem os campos originais mais:
            tipo_fonte           : str
            confiabilidade_fonte : str
            peso_fonte           : float
    """
    if not fontes:
        return []

    total_entrada = len(fontes)
    enriquecidas: list[dict] = []

    for f in fontes:
        if not _fonte_valida(f):
            logger.debug(
                "Fonte ignorada (dados insuficientes): url=%s titulo=%s snippet=%d chars",
                f.get("url", ""),
                (f.get("titulo") or "")[:40],
                len(f.get("snippet") or ""),
            )
            continue

        tipo = _detectar_tipo(f.get("url", ""), f.get("fonte", ""))

        if tipo == "social":
            logger.debug("Fonte social descartada: %s", f.get("url", ""))
            continue

        snippet = (f.get("snippet") or "").strip()
        peso = _calcular_peso(tipo, snippet)

        enriquecida = dict(f)  # cópia rasa — não muta a lista original
        enriquecida["tipo_fonte"] = tipo
        enriquecida["confiabilidade_fonte"] = _CONFIABILIDADE_POR_TIPO.get(tipo, "media")
        enriquecida["peso_fonte"] = peso
        enriquecidas.append(enriquecida)

    enriquecidas.sort(key=lambda x: x["peso_fonte"], reverse=True)
    resultado = enriquecidas[:max_fontes]

    logger.info(
        "Ranking fontes: %d entrada(s) → %d valida(s) → %d selecionada(s)",
        total_entrada,
        len(enriquecidas),
        len(resultado),
    )

    return resultado
