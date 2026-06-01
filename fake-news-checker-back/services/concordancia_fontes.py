# ==============================================================================
# CheckAI API — Concordância entre afirmação e fontes web
# ==============================================================================
# O modelo TF-IDF foi treinado em notícias (verdadeiras) vs. claims checadas
# (falsas), não em perguntas factuais curtas do usuário. Este módulo usa as
# fontes da Serper para ajustar o veredito quando há evidência clara na web.
# ==============================================================================

import logging
import re
import unicodedata


logger = logging.getLogger(__name__)

# Confiança máxima quando há fontes mas sem confirmação explícita da afirmação
CONFIANCA_ALINHAMENTO_FRACO = 0.55
_MIN_FONTES_CONFIRMACAO_EXPLICITA = 2
_LIMIAR_ML_CONFIAVEL = 0.65

_STOPWORDS_AFIRMACAO = frozenset({
    "vai", "para", "presidente", "republica", "congo", "candidatar", "candidato",
    "candidatura", "brasil", "federal", "nacional", "estado", "uniao", "uniao",
    "se", "da", "do", "de", "dos", "das", "uma", "um", "the", "and", "com",
    "por", "que", "sera", "será", "acontecera", "acontecerá", "amanha", "amanhã",
})

_DOMINIOS_OFICIAIS = (
    "gov.br",
    "planalto",
    "senado.leg",
    "camara.leg",
    "presidentes.an.gov",
    "camara.leg.br",
)

_CAMINHOS_FACT_CHECK = (
    "fact-check",
    "/confere/",
    "estadao-verifica",
    "aosfatos",
    "lupa.uol",
    "boatos.org",
)

_MARCAS_DESMENTIDO = (
    "é falso",
    "e falso",
    "fake news",
    "informação falsa",
    "informacao falsa",
    "notícia falsa",
    "noticia falsa",
    "sem evidências",
    "sem evidencias",
    "não há evidências",
    "nao ha evidencias",
    "é enganoso",
    "e enganoso",
    "desinformação",
    "desinformacao",
    "boato",
    "mentira",
    "checamos: falso",
    "verificamos: falso",
    "é fake",
    "e fake",
)

# Confirmação de fatos (condutas, investigações, confissões) em fontes jornalísticas
_MARCAS_CORROBORACAO_FACTUAL = (
    "confessou",
    "admitiu",
    "admitiu a",
    "pratica da rachadinha",
    "prática da rachadinha",
    "rachadinha no gabinete",
    "rachadinha em seu gabinete",
    "rachadinha em seu",
    "praticou a rachadinha",
    "praticou rachadinha",
    "confessa rachadinha",
    "investigado por rachadinha",
    "acordo com a pgr",
    "acordo de nao persecucao",
    "acordo de não persecução",
    "homologa acordo",
    "condenado",
    "foi condenado",
    "foi preso",
    "foi detido",
    "bolsa de colostomia",
    "retirada da bolsa de colostomia",
    "retirada de bolsa de colostomia",
)

# Verbos e construções que indicam que a matéria confirma o fato alegado
_VERBOS_CORROBORACAO = (
    "confessou",
    "admitiu",
    "praticou",
    "confirmou",
    "investigado",
    "acordo",
    "condenado",
    "devolver",
    "usou",
    "usa",
    "usava",
    "utilizou",
    "utiliza",
    "portou",
    "precisou usar",
    "passou por",
    "foi submetido",
    "submetido a",
    "retirada da bolsa",
    "retirada de bolsa",
    "operado",
    "cirurgia para retirada",
)

_RE_NEGACAO_FATO = re.compile(
    r"(?:e falso|é falso|fake news|mentira|boato|nao fez|não fez|nunca fez|"
    r"sem provas|sem evidencias|sem evidências|inverdade)",
)

_MARCAS_CONFIRMACAO = (
    "eleito presidente",
    "foi eleito",
    "presidente da república",
    "presidente da republica",
    "ex-presidente",
    "ex presidente",
    "biografia do presidente",
    "assumiu o",
    "terceiro mandato",
    "mandato à frente",
    "mandato a frente",
    "foi presidente",
    "já foi presidente",
    "ja foi presidente",
)

# Pares para os quais "X é vice de Y" é factualmente impossível no contexto político BR
_PARES_VICE_IMPOSSIVEL: frozenset[tuple[str, str]] = frozenset(
    {
        ("lula", "bolsonaro"),
        ("bolsonaro", "lula"),
    }
)

_ALIASES_NOMES: dict[str, tuple[str, ...]] = {
    "lula": ("lula", "luiz inacio", "inacio lula", "luiz inacio lula"),
    "bolsonaro": ("bolsonaro", "jair bolsonaro", "jair"),
    "mourao": ("mourao", "hamilton mourao", "mourão"),
    "alckmin": ("alckmin", "geraldo alckmin"),
    "janones": ("janones", "andre janones", "andré janones"),
}

_RE_RELACAO_VICE = re.compile(
    r"(?P<sujeito>.+?)\s+(?:é|e|foi|era|sera|será)\s+vice\s+(?:do|da|de)\s+(?P<referente>.+?)(?:\s*$|[\.,;!])",
    re.IGNORECASE,
)

_RE_QUER_REDUZIR_IMPOSTO = re.compile(
    r"\b(abaixar|abaixo|reduzir|reducao|menos imposto|cortar imposto|isentar|isencao)\b"
)

_RE_DATA_DMY = re.compile(
    r"\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\b"
)

_RE_PRESIDENTE_NA_FONTE = re.compile(
    r"president\w*\s+of\s+the|presidente\s+d[ao]|president\s+de\s+la|"
    r"was\s+president|foi\s+presidente|ja\s+foi\s+presidente|"
    r"served\s+as\s+president|former\s+president|ex[- ]president",
    re.IGNORECASE,
)

_TERMOS_CARGO_PRESIDENCIA = (
    "presidente",
    "president",
    "presidencia",
    "presidency",
    "chef de l'etat",
    "chef de etat",
    "head of state",
)

_INDICADORES_CARGO_PASSADO = (
    "foi presidente",
    "ja foi presidente",
    "já foi presidente",
    "era presidente",
    "was president",
    "was the president",
    "served as president",
    "former president",
    "ex-president",
    "ex president",
    "president of the republic",
    "president of the congo",
    "presidente da republica",
    "presidente do congo",
    "presidente de la",
    "president de la republique",
    "puis de president",
)

_MESES_NOMES: dict[int, tuple[str, ...]] = {
    1: ("janeiro", "january", "jan"),
    2: ("fevereiro", "february", "feb"),
    3: ("marco", "march", "mar"),
    4: ("abril", "april", "apr"),
    5: ("maio", "may"),
    6: ("junho", "june", "jun"),
    7: ("julho", "july", "jul"),
    8: ("agosto", "august", "aug"),
    9: ("setembro", "september", "sep"),
    10: ("outubro", "october", "oct"),
    11: ("novembro", "november", "nov"),
    12: ("dezembro", "december", "dec"),
}


def _normalizar(texto: str) -> str:
    texto = texto.lower().strip()
    texto = unicodedata.normalize("NFD", texto)
    return "".join(c for c in texto if unicodedata.category(c) != "Mn")


def _conteudo_fonte(fonte: dict) -> str:
    partes = [
        fonte.get("titulo", ""),
        fonte.get("snippet", ""),
        fonte.get("texto_extraido") or "",
        fonte.get("url", ""),
        fonte.get("fonte", ""),
    ]
    return _normalizar(" ".join(partes))


def _token_principal(nome: str) -> str:
    nome = _normalizar(nome).strip()
    for token in ("lula", "bolsonaro", "mourao", "alckmin"):
        if token in nome:
            return token
    tokens = [t for t in re.findall(r"\w+", nome) if len(t) > 2]
    return tokens[0] if tokens else nome


def _menciona(nome: str, texto: str) -> bool:
    chave = _token_principal(nome)
    aliases = _ALIASES_NOMES.get(chave, (chave,))
    return any(alias in texto for alias in aliases)


def _extrair_relacao_vice(texto: str) -> dict | None:
    texto_norm = _normalizar(texto)
    match = _RE_RELACAO_VICE.search(texto_norm)
    if not match:
        return None
    sujeito = _token_principal(match.group("sujeito"))
    referente = _token_principal(match.group("referente"))
    if not sujeito or not referente or sujeito == referente:
        return None
    return {"sujeito": sujeito, "referente": referente}


def _eh_afirmacao_relacional(texto: str) -> bool:
    return _extrair_relacao_vice(texto) is not None


def _pontuar_relacao_vice(texto: str, conteudo: str) -> tuple[int, int]:
    """
    Pontua fontes para afirmações do tipo "X é vice de Y".

    Diferencia "vice DE Lula" (quem foi vice na chapa de Lula) de
    "Lula é vice DE Bolsonaro" (afirmação do usuário).
    """
    rel = _extrair_relacao_vice(texto)
    if not rel:
        return 0, 0

    sujeito = rel["sujeito"]
    referente = rel["referente"]
    apoio = 0
    desmentido = 0

    par = (sujeito, referente)

    # "vice de {sujeito}" → fala do vice NA CHAPA do sujeito, não sujeito como vice
    if re.search(rf"vice\s+(?:do|da|de)\s+{re.escape(sujeito)}\b", conteudo):
        desmentido += 3

    # "vice de Lula" em inglês: "Lula's vice"
    if _menciona(sujeito, conteudo) and re.search(
        rf"{re.escape(sujeito)}'?s\s+vice|vice\s+of\s+{re.escape(sujeito)}", conteudo
    ):
        desmentido += 3

    # "lançou/fez vice de {sujeito}"
    if re.search(
        rf"(lancou|lança|lanca|fez|indicou)\s+.{0,20}vice\s+(?:do|de|da)\s+{re.escape(sujeito)}",
        conteudo,
    ):
        desmentido += 2

    # "vice do {referente}" sem o sujeito na mesma relação → outra pessoa foi vice
    for match in re.finditer(rf"vice\s+(?:do|da|de)\s+{re.escape(referente)}\b", conteudo):
        janela = conteudo[max(0, match.start() - 50) : match.end() + 50]
        if not _menciona(sujeito, janela):
            desmentido += 2
            break

    # Par politicamente impossível + menção conjunta → desmentido
    if par in _PARES_VICE_IMPOSSIVEL:
        if _menciona(sujeito, conteudo) and _menciona(referente, conteudo):
            if "vice" in conteudo:
                desmentido += 2
            elif any(
                m in conteudo
                for m in ("rival", "oponente", "disputa", "eleicao", "eleição")
            ):
                desmentido += 1

    # Apoio só com proximidade explícita: sujeito ... vice ... referente
    if _menciona(sujeito, conteudo) and _menciona(referente, conteudo):
        for match in re.finditer(r"vice", conteudo):
            janela = conteudo[max(0, match.start() - 55) : match.end() + 55]
            if not (_menciona(sujeito, janela) and _menciona(referente, janela)):
                continue
            pos_s = min(
                (janela.find(a) for a in _ALIASES_NOMES.get(sujeito, (sujeito,)) if a in janela),
                default=-1,
            )
            pos_v = janela.find("vice")
            pos_r = min(
                (
                    janela.find(a)
                    for a in _ALIASES_NOMES.get(referente, (referente,))
                    if a in janela
                ),
                default=-1,
            )
            if pos_s >= 0 and pos_v >= 0 and pos_r >= 0 and pos_s < pos_v < pos_r:
                if re.search(
                    rf"vice\s+(?:do|da|de)\s+{re.escape(referente)}", janela
                ):
                    apoio += 3

    return apoio, desmentido


def _palavras_relevantes(texto: str) -> list[str]:
    return [p for p in re.findall(r"\w+", _normalizar(texto)) if len(p) > 3]


def _palavras_chave_afirmacao(texto: str) -> list[str]:
    """Termos da afirmação usados para checar presença nas fontes."""
    norm = _normalizar(texto)
    chaves = []
    for palavra in re.findall(r"\w+", norm):
        if len(palavra) >= 4 or palavra in ("lula", "fez", "foi", "era"):
            chaves.append(palavra)
    return chaves


def _pontuar_corroboracao_factual(texto: str, conteudo: str) -> tuple[int, int]:
    """
    Pontua fontes para afirmações factuais (ex.: "X fez rachadinha").

    Busca admissão/confirmação em reportagens, não só cargos políticos.
    """
    if _eh_afirmacao_relacional(texto):
        return 0, 0

    chaves = _palavras_chave_afirmacao(texto)
    if not chaves:
        return 0, 0

    encontradas = sum(1 for c in chaves if c in conteudo)
    if encontradas < min(2, len(chaves)):
        return 0, 0

    texto_norm = _normalizar(texto)
    apoio = 0
    desmentido = 0

    # Negação explícita do fato citado na afirmação
    if _RE_NEGACAO_FATO.search(conteudo):
        termo_central = next(
            (c for c in chaves if len(c) >= 5),
            chaves[0],
        )
        if termo_central in conteudo:
            desmentido += 3

    for marca in _MARCAS_CORROBORACAO_FACTUAL:
        if marca in conteudo:
            apoio += 2
            break

    # Fato central + verbo de confirmação (exige 2+ termos centrais, não só tema genérico)
    termos_central = [c for c in chaves if len(c) >= 5]
    if len(termos_central) >= 2:
        principais_presentes = sum(1 for t in termos_central if t in conteudo)
        if principais_presentes >= 2 and any(v in conteudo for v in _VERBOS_CORROBORACAO):
            apoio += 2

    if any(v in texto_norm for v in ("usou", "usa", "usava", "utilizou", "utiliza")):
        if any(v in conteudo for v in ("usou", "usa", "usava", "utilizou", "utiliza", "retirada")):
            if len(termos_central) >= 2 and all(
                t in conteudo for t in termos_central[:2]
            ):
                apoio += 2

    return apoio, desmentido


def _extrair_datas_claim(texto: str) -> list[tuple[int, int, int]]:
    """Extrai datas dd/mm/yyyy da afirmação."""
    norm = _normalizar(texto)
    datas = []
    for dia_s, mes_s, ano_s in _RE_DATA_DMY.findall(norm):
        dia, mes = int(dia_s), int(mes_s)
        ano = int(ano_s)
        if ano < 100:
            ano += 2000
        if 1 <= dia <= 31 and 1 <= mes <= 12:
            datas.append((dia, mes, ano))
    return datas


def _data_aparece_no_conteudo(dia: int, mes: int, ano: int, conteudo: str) -> bool:
    """Verifica se dia/mês/ano da afirmação aparecem na fonte (formatos BR e EN)."""
    if str(ano) not in conteudo and str(ano)[-2:] not in conteudo:
        return False

    padroes_numericos = (
        f"{dia}/{mes}",
        f"{dia:02d}/{mes:02d}",
        f"{dia}/{mes:02d}",
        f"{dia:02d}/{mes}",
        f"{dia}-{mes}",
    )
    if any(p in conteudo for p in padroes_numericos):
        return True

    nomes_mes = _MESES_NOMES.get(mes, ())
    for nome in nomes_mes:
        if re.search(rf"\b{re.escape(nome)}\w*\s+{dia}\b", conteudo):
            return True
        if re.search(rf"\b{re.escape(nome)}\w*\s+{dia:02d}\b", conteudo):
            return True
        if re.search(rf"\b{dia}\s+de\s+{re.escape(nome)}", conteudo):
            return True
        if re.search(rf"\b{dia:02d}\s+de\s+{re.escape(nome)}", conteudo):
            return True

    return str(dia) in conteudo and any(n in conteudo for n in nomes_mes)


def _extrair_eventos_claim(texto: str) -> list[str]:
    norm = _normalizar(texto)
    eventos = []
    if "state of play" in norm:
        eventos.append("state of play")
    if "stateofplay" in norm.replace(" ", ""):
        eventos.append("state of play")
    return eventos


def _afirmacao_cargo_passado(texto: str) -> bool:
    """Afirmação do tipo 'X foi/era presidente (de Y)'."""
    claim = _normalizar(texto)
    if not any(c in claim for c in ("presidente", "president")):
        return False
    return any(
        p in claim
        for p in (
            "foi presidente",
            "ja foi presidente",
            "já foi presidente",
            "era presidente",
            "foi o presidente",
            "was president",
            "former president",
            "ex presidente",
            "ex-presidente",
        )
    )


def _ancoras_geograficas_claim(texto: str) -> list[str]:
    """Países/regiões citados na afirmação que devem aparecer na fonte."""
    claim = _normalizar(texto)
    candidatos = (
        "congo",
        "brasil",
        "brazil",
        "portugal",
        "angola",
        "mocambique",
        "moçambique",
        "argentina",
        "chile",
        "peru",
        "colombia",
        "venezuela",
        "eua",
        "estados unidos",
    )
    return [g for g in candidatos if g in claim]


def _fonte_confirma_cargo_historico(texto: str, conteudo: str) -> bool:
    """
    Confirma biografias e cargos passados (ex.: 'Alfred Raoul foi presidente do Congo').

    Aceita fontes em português, inglês ou francês — comum em Wikipedia e enciclopédias.
    """
    if not _afirmacao_cargo_passado(texto):
        return False
    if not _fonte_menciona_pessoa_claim(texto, conteudo):
        return False

    for geo in _ancoras_geograficas_claim(texto):
        if geo not in conteudo:
            return False

    if not any(t in conteudo for t in _TERMOS_CARGO_PRESIDENCIA):
        return False

    if any(p in conteudo for p in _INDICADORES_CARGO_PASSADO):
        return True

    if _RE_PRESIDENTE_NA_FONTE.search(conteudo):
        return True

    # Biografia com datas + menção a presidência (padrão Wikipedia)
    if re.search(r"\b(18|19|20)\d{2}\b", conteudo) and (
        "president of" in conteudo
        or "presidente da" in conteudo
        or "presidente do" in conteudo
    ):
        return True

    return False


def _fonte_confirma_evento_data(texto: str, conteudo: str) -> bool:
    """
    Confirma eventos agendados com data (ex.: State of Play em 02/06/2026).
    """
    claim = _normalizar(texto)
    datas = _extrair_datas_claim(texto)
    if not datas:
        return False

    eventos = _extrair_eventos_claim(texto)
    agendamento = any(
        v in claim
        for v in (
            "acontecera",
            "acontecerá",
            "sera",
            "será",
            "marcado",
            "agendado",
            "acontece",
            "broadcast",
            "ao vivo",
        )
    )

    if eventos and not any(e in conteudo for e in eventos):
        return False

    if not eventos and not agendamento:
        return False

    for dia, mes, ano in datas:
        if _data_aparece_no_conteudo(dia, mes, ano, conteudo):
            if eventos:
                return True
            if agendamento and any(
                v in conteudo
                for v in (
                    "acontecera",
                    "sera",
                    "scheduled",
                    "set for",
                    "will take place",
                    "broadcast",
                    "ao vivo",
                    "marcado",
                )
            ):
                return True
            # Fonte cita a mesma data + termos do evento implícitos no título
            return True

    return False


def _extrair_tokens_pessoa(texto: str) -> list[str]:
    """Partes do nome/pronome da pessoa citada na afirmação (exclui cargos e países)."""
    return [
        w
        for w in re.findall(r"\w+", _normalizar(texto))
        if len(w) >= 4 and w not in _STOPWORDS_AFIRMACAO
    ]


def _afirmacao_cita_pessoa_especifica(texto: str) -> bool:
    return len(_extrair_tokens_pessoa(texto)) >= 2


def _fonte_menciona_pessoa_claim(texto: str, conteudo: str) -> bool:
    tokens = _extrair_tokens_pessoa(texto)
    if not tokens:
        return False
    if len(tokens) == 1:
        return tokens[0] in conteudo
    return sum(1 for t in tokens[:6] if t in conteudo) >= 2


def _contar_fontes_com_pessoa(texto: str, fontes: list[dict]) -> int:
    return sum(
        1 for f in fontes if _fonte_menciona_pessoa_claim(texto, _conteudo_fonte(f))
    )


def _pessoas_na_afirmacao(texto: str) -> list[str]:
    norm = _normalizar(texto)
    conhecidos = ("bolsonaro", "lula", "janones", "mourao", "alckmin")
    return [p for p in conhecidos if p in norm]


def _fonte_confirma_explicitamente(texto: str, conteudo: str) -> bool:
    """
    A fonte confirma a afirmação tal como formulada (não só o mesmo assunto).
    """
    claim = _normalizar(texto)

    if _fonte_confirma_evento_data(texto, conteudo):
        return True

    if _fonte_confirma_cargo_historico(texto, conteudo):
        return True

    if "candidatar" in claim or "candidatura" in claim:
        if not _fonte_menciona_pessoa_claim(texto, conteudo):
            return False
        if "presidente" in claim and "presidente" not in conteudo:
            return False
        if "congo" in claim and "congo" not in conteudo:
            return False
        return any(
            v in conteudo
            for v in ("candidat", "eleicao", "election", "corrida", "disputa")
        )

    if "matar" in claim or "matou" in claim:
        for pessoa in _pessoas_na_afirmacao(texto) or _palavras_chave_afirmacao(texto):
            if pessoa not in conteudo:
                continue
            padroes = (
                "tentaram matar",
                "tentando matar",
                "tentou matar",
                "tentar matar",
                "atentado",
                "facada",
                "esfaqueado",
                f"atacar {pessoa}",
                f"matar {pessoa}",
            )
            if any(p in conteudo for p in padroes):
                return True
        return False

    if "prometeu" in claim or "promete" in claim:
        if "imposto" not in claim:
            return False
        if "promete" not in conteudo or "imposto" not in conteudo:
            return False
        quer_reduzir = bool(_RE_QUER_REDUZIR_IMPOSTO.search(claim))
        if not quer_reduzir:
            return False
        return any(
            x in conteudo
            for x in (
                "abaixar",
                "abaixo",
                "reduzir",
                "reduz",
                "menos imposto",
                "isentar",
                "isencao",
            )
        )

    apoio, desm = _pontuar_corroboracao_factual(texto, conteudo)
    return apoio >= 3 and desm == 0


def _fonte_contradiz_afirmacao(texto: str, conteudo: str) -> bool:
    """Fonte desmente ou aponta direção oposta à afirmação."""
    for marca in _MARCAS_DESMENTIDO:
        if marca in conteudo:
            return True

    claim = _normalizar(texto)
    if ("prometeu" in claim or "promete" in claim) and "imposto" in claim:
        if any(x in claim for x in ("abaix", "reduz", "menos imposto")):
            if "mais imposto" in conteudo and "ricos" in conteudo:
                return True
    return False


def _resumir_alinhamento(texto: str, fontes: list[dict]) -> dict:
    explicitas = 0
    contradiz = 0
    tematicas = 0

    for fonte in fontes:
        conteudo = _conteudo_fonte(fonte)
        if _fonte_contradiz_afirmacao(texto, conteudo):
            contradiz += 1
        elif _fonte_confirma_explicitamente(texto, conteudo):
            explicitas += 1
        elif _termos_presentes_na_fonte(texto, conteudo):
            tematicas += 1

    return {
        "explicitas": explicitas,
        "contradiz": contradiz,
        "tematicas": tematicas,
        "total": len(fontes),
    }


def _termos_presentes_na_fonte(texto_afirmacao: str, conteudo_fonte: str) -> bool:
    termos = _palavras_relevantes(texto_afirmacao)
    if not termos:
        return False
    encontrados = sum(1 for t in termos if t in conteudo_fonte)
    minimo = min(2, len(termos))
    return encontrados >= minimo


def _pontuar_fonte(texto_afirmacao: str, fonte: dict) -> tuple[int, int]:
    conteudo = _conteudo_fonte(fonte)
    url = fonte.get("url", "").lower()
    apoio = 0
    desmentido = 0

    for marca in _MARCAS_DESMENTIDO:
        if marca in conteudo:
            desmentido += 2
            break

    if any(caminho in url for caminho in _CAMINHOS_FACT_CHECK) and desmentido > 0:
        desmentido += 1

    if desmentido > 0:
        return apoio, desmentido

    # Afirmações relacionais (ex.: "X é vice de Y") exigem correspondência explícita
    if _eh_afirmacao_relacional(texto_afirmacao):
        return _pontuar_relacao_vice(texto_afirmacao, conteudo)

    if _fonte_confirma_cargo_historico(texto_afirmacao, conteudo):
        apoio += 3

    apoio_factual, desm_factual = _pontuar_corroboracao_factual(
        texto_afirmacao, conteudo
    )
    apoio += apoio_factual
    desmentido += desm_factual
    if desmentido > 0:
        return apoio, desmentido

    for marca in _MARCAS_CONFIRMACAO:
        if marca in conteudo:
            apoio += 1

    if any(dom in url for dom in _DOMINIOS_OFICIAIS):
        if _termos_presentes_na_fonte(texto_afirmacao, conteudo):
            apoio += 2
        elif apoio > 0:
            apoio += 1

    if apoio == 0 and _termos_presentes_na_fonte(texto_afirmacao, conteudo):
        if any(
            m in conteudo
            for m in ("presidente", "president", "eleito", "mandato", "governo")
        ):
            if _afirmacao_cita_pessoa_especifica(texto_afirmacao):
                if _fonte_menciona_pessoa_claim(texto_afirmacao, conteudo):
                    apoio += 1
            else:
                apoio += 1

    return apoio, desmentido


def avaliar_concordancia_fontes(texto: str, fontes: list[dict]) -> dict | None:
    if not fontes:
        return None

    rel = _extrair_relacao_vice(texto)
    total_apoio = 0
    total_desmentido = 0

    for fonte in fontes:
        apoio, desmentido = _pontuar_fonte(texto, fonte)
        total_apoio += apoio
        total_desmentido += desmentido

    logger.info(
        "Concordância fontes — apoio=%d desmentido=%d (fontes=%d, relacional=%s)",
        total_apoio,
        total_desmentido,
        len(fontes),
        rel is not None,
    )

    # Afirmações relacionais impossíveis: exige confirmação explícita para REAL
    if rel and (rel["sujeito"], rel["referente"]) in _PARES_VICE_IMPOSSIVEL:
        if total_apoio < 3 and total_desmentido >= 2:
            confianca = min(0.95, 0.78 + total_desmentido * 0.04)
            return {"classificacao": "FALSO", "confianca": confianca}
        if total_apoio < 3:
            return {"classificacao": "FALSO", "confianca": 0.75}

    if total_desmentido >= 3 and total_desmentido > total_apoio:
        confianca = min(0.95, 0.72 + total_desmentido * 0.04)
        return {"classificacao": "FALSO", "confianca": confianca}

    if total_apoio >= 3 and total_apoio > total_desmentido:
        if _afirmacao_cita_pessoa_especifica(texto):
            if _contar_fontes_com_pessoa(texto, fontes) < _MIN_FONTES_CONFIRMACAO_EXPLICITA:
                return None
        confianca = min(0.95, 0.72 + total_apoio * 0.04)
        return {"classificacao": "VERDADEIRO", "confianca": confianca}

    return None


def reconciliar_com_fontes(
    texto: str,
    classificacao_ml: str,
    confianca_ml: float,
    fontes: list[dict],
) -> tuple[str, float, bool]:
    """
    Combina ML com fontes. Sem confirmação explícita nas matérias, não mantém
  100% do modelo — reduz confiança para INCONCLUSIVO na camada de verificação.
    """
    resumo = _resumir_alinhamento(texto, fontes)
    mencoes_pessoa = _contar_fontes_com_pessoa(texto, fontes)
    logger.info(
        "Alinhamento — explicitas=%d contradiz=%d tematicas=%d pessoa=%d total=%d | ML=%s %.2f",
        resumo["explicitas"],
        resumo["contradiz"],
        resumo["tematicas"],
        mencoes_pessoa,
        resumo["total"],
        classificacao_ml,
        confianca_ml,
    )

    if (
        _afirmacao_cita_pessoa_especifica(texto)
        and mencoes_pessoa == 0
        and len(fontes) >= 2
    ):
        conf = max(confianca_ml, 0.9) if classificacao_ml == "FALSO" else 0.9
        logger.info("Nenhuma fonte cita a pessoa da afirmação → FALSO")
        return "FALSO", conf, True

    if (
        classificacao_ml == "FALSO"
        and confianca_ml >= _LIMIAR_ML_CONFIAVEL
        and resumo["explicitas"] == 0
        and mencoes_pessoa < _MIN_FONTES_CONFIRMACAO_EXPLICITA
    ):
        logger.info("ML FALSO confiante sem corroboração nas fontes → mantém FALSO")
        return "FALSO", confianca_ml, True

    sinal = avaliar_concordancia_fontes(texto, fontes)
    if sinal:
        class_fontes = sinal["classificacao"]
        conf_fontes = sinal["confianca"]
        if (
            class_fontes == "VERDADEIRO"
            and classificacao_ml == "FALSO"
            and resumo["explicitas"] == 0
            and mencoes_pessoa < _MIN_FONTES_CONFIRMACAO_EXPLICITA
            and not _afirmacao_cargo_passado(texto)
        ):
            logger.info("Ignora VERDADEIRO genérico — mantém ML FALSO")
            return "FALSO", confianca_ml, True
        if class_fontes == classificacao_ml:
            return classificacao_ml, max(confianca_ml, conf_fontes), True
        logger.info(
            "Ajuste por fontes (pontuação): ML=%s → %s",
            classificacao_ml,
            class_fontes,
        )
        return class_fontes, conf_fontes, True

    if resumo["explicitas"] >= _MIN_FONTES_CONFIRMACAO_EXPLICITA:
        conf = min(0.92, 0.75 + resumo["explicitas"] * 0.05)
        if classificacao_ml != "VERDADEIRO":
            logger.info("Confirmação explícita nas fontes → VERDADEIRO")
        return "VERDADEIRO", conf, True

    if resumo["contradiz"] >= 2:
        return "FALSO", min(0.92, 0.78 + resumo["contradiz"] * 0.04), True

    if fontes and resumo["explicitas"] < _MIN_FONTES_CONFIRMACAO_EXPLICITA:
        if (
            classificacao_ml == "FALSO"
            and confianca_ml >= _LIMIAR_ML_CONFIAVEL
            and not (
                _afirmacao_cargo_passado(texto)
                and mencoes_pessoa >= _MIN_FONTES_CONFIRMACAO_EXPLICITA
            )
        ):
            return "FALSO", confianca_ml, True
        logger.info(
            "Fontes só tangenciam o tema — inconclusivo (confiança moderada)"
        )
        return classificacao_ml, min(confianca_ml, CONFIANCA_ALINHAMENTO_FRACO), True

    return classificacao_ml, confianca_ml, False
