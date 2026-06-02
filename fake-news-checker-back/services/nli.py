# ==============================================================================
# CheckAI API — Serviço NLI (Natural Language Inference)
# ==============================================================================
# Compara uma alegação do usuário com um texto de evidência e classifica o
# par em uma das três categorias:
#
#   SUPPORTS  — a evidência confirma / implica a alegação
#   REFUTES   — a evidência contradiz / nega a alegação
#   NEUTRAL   — a evidência fala do tema mas não confirma nem refuta
#
# Modelo padrão: MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7
#   → DeBERTa-v3-base multilíngue treinado em XNLI + MultiNLI (2 mi+ exemplos)
#   → Suporte nativo a Português (entre 100+ idiomas)
#   → Saída 3-classes: ENTAILMENT / NEUTRAL / CONTRADICTION → mapeamento direto
#   → Tamanho: ~550 MB
#
# Alternativa leve (inglês, 180 MB, 3-classes):
#   cross-encoder/nli-deberta-v3-small
#
# Nota: o modelo recogna-nlp/bertabert-portuguese-cased-nli-assin-2 (original
# do relatório) não está disponível publicamente no Hugging Face Hub.
#
# Para integrar no fluxo de verificação futuramente:
#   from services.nli import classificar_pares_nli, agregar_resultado_nli
# ==============================================================================

import logging

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configurações
# ---------------------------------------------------------------------------

MODELO_NLI_PADRAO = "MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7"

# Limite de caracteres da evidência antes de enviar ao modelo.
# ~1 500 chars ≈ 300-400 tokens para BERT — conserva margem antes do limite de 512.
MAX_CHARS_EVIDENCIA = 1500

# Score mínimo para aceitar SUPPORTS ou REFUTES como resultado final.
# Abaixo desses limiares retorna NEUTRAL (mais conservador).
THRESHOLD_SUPORTE = 0.65
THRESHOLD_REFUTA = 0.60

# ---------------------------------------------------------------------------
# Estado global do modelo
# ---------------------------------------------------------------------------
# O modelo é carregado uma única vez no startup (via carregar_modelo_nli) e
# reutilizado em todas as chamadas — carregamento por chamada seria inviável.

_nli_pipeline = None
_nli_carregado = False

# True quando o modelo produz label de contradição explícita (3 classes).
# False para modelos binários ASSIN-2 (usa lógica de hipótese negada).
_modelo_3classes = False


# ==============================================================================
# Carregamento do modelo
# ==============================================================================

def carregar_modelo_nli(nome_modelo: str = MODELO_NLI_PADRAO) -> bool:
    """
    Carrega o modelo NLI na memória.

    Deve ser chamado no startup do servidor FastAPI (bloco lifespan de main.py).
    O modelo baixa automaticamente do Hugging Face Hub na primeira execução.

    Parâmetros:
        nome_modelo: ID do modelo no Hugging Face Hub.

    Retorna:
        True se carregado com sucesso, False em qualquer falha.
    """
    global _nli_pipeline, _nli_carregado, _modelo_3classes

    try:
        from transformers import pipeline as hf_pipeline

        logger.info("Carregando modelo NLI: %s", nome_modelo)

        _nli_pipeline = hf_pipeline(
            "text-classification",
            model=nome_modelo,
            top_k=None,       # retorna scores de todas as classes
            truncation=True,  # trunca automaticamente no limite de tokens
            max_length=512,   # limite BERT padrão
        )

        # Sonda para detectar quais labels o modelo produz.
        # Usa _scores_normalizados para desembrulhar qualquer formato de saída
        # (dict, list[dict] ou list[list[dict]]) de forma uniforme.
        sonda = _nli_pipeline({
            "text": "O sol nasce no leste.",
            "text_pair": "Existe uma estrela chamada sol.",
        })
        labels_disponiveis = set(_scores_normalizados(sonda).keys())

        # Modelos 3-classes têm label de contradição direta (ex.: xlm-roberta-xnli)
        _modelo_3classes = any("CONTRADICT" in lab for lab in labels_disponiveis)

        logger.info(
            "Modelo NLI pronto. labels=%s 3-classes=%s",
            labels_disponiveis,
            _modelo_3classes,
        )
        _nli_carregado = True
        return True

    except Exception as exc:
        logger.error("Falha ao carregar modelo NLI '%s': %s", nome_modelo, exc)
        _nli_pipeline = None
        _nli_carregado = False
        return False


# ==============================================================================
# Funções internas de suporte
# ==============================================================================

def _resultado_neutro() -> dict:
    """Retorna resultado padrão quando o modelo não está disponível ou falha."""
    return {"label": "NEUTRAL", "score": 0.0}


def _scores_normalizados(saida_pipeline) -> dict[str, float]:
    """
    Converte a saída do pipeline em {LABEL_MAIUSCULO: score}.

    Aceita três formatos possíveis retornados pelo transformers:
      - dict único            → top_k=1 ou fallback de versão antiga
      - list[dict]            → top_k=None com entrada simples (mais comum)
      - list[list[dict]]      → top_k=None em modo batch para entrada simples;
                                acontece em algumas versões do transformers quando
                                o input é um dict em vez de string
    """
    if isinstance(saida_pipeline, dict):
        return {saida_pipeline["label"].upper(): saida_pipeline["score"]}
    # Desembrulha lista aninhada: [[{...}, ...]] → [{...}, ...]
    if saida_pipeline and isinstance(saida_pipeline[0], list):
        saida_pipeline = saida_pipeline[0]
    return {item["label"].upper(): item["score"] for item in saida_pipeline}


def _score_entailment(scores: dict[str, float]) -> float:
    """
    Extrai o score de entailment independente do nome exato do label.

    Cobre variações: "ENTAILMENT", "ENTAIL", "LABEL_1", "1".
    """
    for label, score in scores.items():
        if "ENTAIL" in label or label in ("1", "LABEL_1"):
            return score
    return 0.0


def _score_contradicao(scores: dict[str, float]) -> float:
    """
    Extrai o score de contradiction para modelos 3-classes.

    Cobre variações: "CONTRADICTION", "CONTRADICT".
    """
    for label, score in scores.items():
        if "CONTRADICT" in label:
            return score
    return 0.0


def _negacao_alegacao(texto: str) -> str:
    """
    Cria uma versão negada simples da alegação em português.

    Usado na detecção de REFUTES com modelos binários (ASSIN-2):
    se a evidência "entails" que a alegação é falsa → REFUTES.

    Exemplos:
        "Lula é presidente" → "Não é verdade que lula é presidente"
    """
    texto_limpo = texto.strip().rstrip(".")
    primeiro_char = texto_limpo[0].lower() if texto_limpo else ""
    resto = texto_limpo[1:] if len(texto_limpo) > 1 else ""
    return f"Não é verdade que {primeiro_char}{resto}"


# ==============================================================================
# Classificação de par individual
# ==============================================================================

def classificar_par_nli(alegacao: str, evidencia: str) -> dict:
    """
    Classifica o par (alegacao, evidencia) retornando SUPPORTS, REFUTES ou NEUTRAL.

    Estratégia para modelos binários (ASSIN-2 — ENTAILMENT / NONE):
        1. Forward: evidencia entails alegacao?  → alto score → SUPPORTS
        2. Negação: evidencia entails NOT-alegacao? → alto score → REFUTES
        3. Caso contrário → NEUTRAL

    Estratégia para modelos 3-classes (ex.: xlm-roberta-xnli):
        → Mapeamento direto ENTAILMENT/CONTRADICTION/NEUTRAL

    Parâmetros:
        alegacao  — afirmação enviada pelo usuário
        evidencia — texto da fonte (snippet ou artigo extraído)

    Retorna:
        {
            "label": "SUPPORTS" | "REFUTES" | "NEUTRAL",
            "score": float  (0.0 a 1.0),
        }
    """
    if not _nli_carregado or _nli_pipeline is None:
        logger.debug("Modelo NLI não disponível — retornando NEUTRAL por padrão")
        return _resultado_neutro()

    evidencia_limpa = (evidencia or "").strip()
    if not evidencia_limpa:
        logger.debug("Evidência vazia — retornando NEUTRAL")
        return _resultado_neutro()

    # Truncagem profilática de caracteres (o pipeline já trunca tokens,
    # mas evita enviar strings absurdamente longas ao tokenizador)
    if len(evidencia_limpa) > MAX_CHARS_EVIDENCIA:
        evidencia_limpa = evidencia_limpa[:MAX_CHARS_EVIDENCIA]

    try:
        # ------------------------------------------------------------------
        # Passo 1 — Forward pass: a evidência implica a alegação?
        # ------------------------------------------------------------------
        saida_fwd = _nli_pipeline({"text": evidencia_limpa, "text_pair": alegacao})
        scores_fwd = _scores_normalizados(saida_fwd)
        score_ent_fwd = _score_entailment(scores_fwd)

        logger.debug("NLI forward scores=%s", scores_fwd)

        # ------------------------------------------------------------------
        # Modelos 3-classes: mapeamento direto (mais confiável)
        # ------------------------------------------------------------------
        if _modelo_3classes:
            score_con = _score_contradicao(scores_fwd)
            if score_ent_fwd >= THRESHOLD_SUPORTE and score_ent_fwd >= score_con:
                return {"label": "SUPPORTS", "score": round(score_ent_fwd, 4)}
            if score_con >= THRESHOLD_REFUTA and score_con >= score_ent_fwd:
                return {"label": "REFUTES", "score": round(score_con, 4)}
            score_max = max(scores_fwd.values()) if scores_fwd else 0.0
            return {"label": "NEUTRAL", "score": round(score_max, 4)}

        # ------------------------------------------------------------------
        # Modelos binários (ASSIN-2): ENTAILMENT / NONE
        # ------------------------------------------------------------------

        # SUPPORTS: entailment direto forte
        if score_ent_fwd >= THRESHOLD_SUPORTE:
            return {"label": "SUPPORTS", "score": round(score_ent_fwd, 4)}

        # ------------------------------------------------------------------
        # Passo 2 — Hipótese negada: a evidência implica que a alegação é falsa?
        # Técnica zero-shot para detectar REFUTES em modelos sem label de contradição.
        # ------------------------------------------------------------------
        hipotese_neg = _negacao_alegacao(alegacao)
        saida_neg = _nli_pipeline({"text": evidencia_limpa, "text_pair": hipotese_neg})
        scores_neg = _scores_normalizados(saida_neg)
        score_ent_neg = _score_entailment(scores_neg)

        logger.debug("NLI negação scores=%s (hipotese='%s')", scores_neg, hipotese_neg)

        if score_ent_neg >= THRESHOLD_REFUTA:
            return {"label": "REFUTES", "score": round(score_ent_neg, 4)}

        # NEUTRAL: nenhum sinal forte em nenhuma direção
        score_base = max(scores_fwd.values()) if scores_fwd else 0.0
        return {"label": "NEUTRAL", "score": round(score_base, 4)}

    except Exception as exc:
        logger.error("Erro na inferência NLI: %s", exc)
        return _resultado_neutro()


# ==============================================================================
# Classificação de múltiplas fontes
# ==============================================================================

def classificar_pares_nli(alegacao: str, fontes: list[dict]) -> list[dict]:
    """
    Classifica todos os pares (alegacao, evidencia) para uma lista de fontes.

    Prioridade de campo de evidência por fonte:
        texto_extraido (artigo completo) > snippet (trecho Serper) > titulo

    Parâmetros:
        alegacao — alegação do usuário
        fontes   — lista de dicts com campos: titulo, url, snippet, texto_extraido

    Retorna:
        Lista de dicts com:
            "label"  : "SUPPORTS" | "REFUTES" | "NEUTRAL"
            "score"  : float
            "url"    : URL da fonte (para rastreabilidade)
    """
    resultados = []
    for fonte in fontes:
        evidencia = (
            fonte.get("texto_extraido")
            or fonte.get("snippet")
            or fonte.get("titulo")
            or ""
        )
        nli = classificar_par_nli(alegacao, evidencia)
        resultados.append({
            "label": nli["label"],
            "score": nli["score"],
            "url": fonte.get("url", ""),
        })

    distribuicao = {
        lab: sum(1 for r in resultados if r["label"] == lab)
        for lab in ("SUPPORTS", "REFUTES", "NEUTRAL")
    }
    logger.info("NLI — %d fontes avaliadas: %s", len(resultados), distribuicao)
    return resultados


# ==============================================================================
# Agregação de resultados
# ==============================================================================

def agregar_resultado_nli(resultados: list[dict]) -> dict:
    """
    Agrega os resultados NLI de múltiplas fontes em um único veredito.

    Regras de votação:
        - >= 50% REFUTES  → REFUTES  (prioridade por conservadorismo anti-fake)
        - >= 50% SUPPORTS → SUPPORTS
        - Caso contrário  → NEUTRAL

    Score final: média dos scores do label vencedor.

    Parâmetros:
        resultados — lista de dicts com "label" e "score" (saída de classificar_pares_nli)

    Retorna:
        {
            "label" : "SUPPORTS" | "REFUTES" | "NEUTRAL",
            "score" : float,
            "votos" : {"SUPPORTS": int, "REFUTES": int, "NEUTRAL": int},
        }
    """
    votos_vazios = {"SUPPORTS": 0, "REFUTES": 0, "NEUTRAL": 0}

    if not resultados:
        return {"label": "NEUTRAL", "score": 0.0, "votos": votos_vazios}

    acumulado: dict[str, list[float]] = {"SUPPORTS": [], "REFUTES": [], "NEUTRAL": []}
    for r in resultados:
        label = r.get("label", "NEUTRAL")
        score = float(r.get("score", 0.0))
        acumulado.setdefault(label, []).append(score)

    total = len(resultados)
    contagem = {lab: len(scores) for lab, scores in acumulado.items()}

    def media_score(lab: str) -> float:
        lst = acumulado.get(lab, [])
        return round(sum(lst) / len(lst), 4) if lst else 0.0

    # REFUTES tem prioridade: qualquer evidência de falsidade pesa mais
    if contagem.get("REFUTES", 0) / total >= 0.5:
        return {"label": "REFUTES", "score": media_score("REFUTES"), "votos": contagem}

    if contagem.get("SUPPORTS", 0) / total >= 0.5:
        return {"label": "SUPPORTS", "score": media_score("SUPPORTS"), "votos": contagem}

    return {"label": "NEUTRAL", "score": media_score("NEUTRAL"), "votos": contagem}


# ==============================================================================
# Status / diagnóstico
# ==============================================================================

def status_modelo_nli() -> dict:
    """
    Retorna o status atual do serviço NLI.

    Útil para o endpoint /health e para diagnóstico em produção.
    """
    return {
        "nli_carregado": _nli_carregado,
        "nli_modelo": MODELO_NLI_PADRAO,
        "nli_3classes": _modelo_3classes,
        "mensagem": (
            "Modelo NLI ativo e pronto para inferência"
            if _nli_carregado
            else (
                "Modelo NLI não carregado. "
                "Verifique se transformers, torch e sentencepiece estão instalados."
            )
        ),
    }
