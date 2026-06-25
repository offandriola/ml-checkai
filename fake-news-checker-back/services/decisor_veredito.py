# ==============================================================================
# CheckAI API — Decisor de Veredito Final
# ==============================================================================
# Camada de decisão conservadora que combina o resultado do fluxo atual
# (ML + heurísticas) com o sinal NLI para produzir o veredito definitivo.
#
# Regras (conservadoras por design para TCC):
#   1a. Sem fontes NLI ou NLI ausente           → mantém fluxo atual
#   E.  Fact-checking alta confiab. conflita    → INCONCLUSIVO (regra especial)
#   1b. NLI neutro                              → mantém fluxo atual
#   2.  NLI e ML concordam (forte)              → mantém resultado + pequeno boost
#   3.  ML=REAL   + NLI=REFUTES forte           → INCONCLUSIVO (conflito)
#   4.  ML=FALSO  + NLI=SUPPORTS forte          → INCONCLUSIVO (conflito)
#   5.  ML=INCONCLUSIVO + NLI=SUPPORTS forte    → REAL  (NLI resolve)
#   6.  ML=INCONCLUSIVO + NLI=REFUTES forte     → FALSO (NLI resolve)
#   7.  NLI fraco (score ou votos insuficientes) → mantém fluxo atual
#
# "NLI forte" exige:
#   - score_agregado >= _SCORE_NLI_FORTE (0.75)
#   - quando ranking_fontes foi aplicado (fontes têm tipo_fonte):
#       pelo menos _MIN_VOTOS_CONFIAVEIS (2) fontes de tipo independente
#       (oficial, jornalistica, fact_checking) e alta confiabilidade.
#   - quando ranking_fontes NÃO foi aplicado:
#       fallback por contagem de nli_votos.
#
# Fontes que NÃO influenciam o veredito (quando ranking foi aplicado):
#   contextual_politica, enciclopedia, desconhecida, social.
# ==============================================================================

import logging

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Limiares
# ---------------------------------------------------------------------------

_SCORE_NLI_FORTE: float = 0.75       # score mínimo para o NLI influenciar
_SCORE_FACTCHECK_ESPECIAL: float = 0.60  # score mínimo para regra especial de fact-checking
_MIN_VOTOS_CONFIAVEIS: int = 2       # fontes de alta confiabilidade necessárias
_BOOST_CONCORDANCIA: float = 0.05   # acréscimo de confiança quando ML ≡ NLI
_CONFIANCA_CONFLITO: float = 0.55   # confiança adotada ao entrar em conflito
_MAX_CONFIANCA: float = 0.99        # teto absoluto de confiança

# Tipos de fonte que podem influenciar o veredito final (quando ranking foi aplicado)
_TIPOS_DECIDEM: frozenset[str] = frozenset({"oficial", "jornalistica", "fact_checking"})


# ---------------------------------------------------------------------------
# Funções auxiliares
# ---------------------------------------------------------------------------

def _tem_fontes(nli_votos: dict | None) -> bool:
    """Retorna True se pelo menos uma fonte foi avaliada pelo NLI."""
    if not nli_votos:
        return False
    return sum(nli_votos.values()) > 0


def _contar_votos_confiaveis(fontes: list[dict], label: str) -> int:
    """
    Conta fontes independentes de alta confiabilidade com o label NLI indicado.

    Exige que ranking_fontes tenha sido aplicado (campo tipo_fonte presente).
    Fontes contextual_politica, enciclopedia, desconhecida e social não contam,
    mesmo que tenham confiabilidade "alta" por algum motivo externo.
    """
    return sum(
        1
        for f in fontes
        if (
            f.get("confiabilidade_fonte") == "alta"
            and f.get("nli_label") == label
            and f.get("tipo_fonte", "") in _TIPOS_DECIDEM
        )
    )


def _nli_e_forte(
    nli_score: float | None,
    nli_votos: dict | None,
    fontes: list[dict],
    label: str,
) -> bool:
    """
    Verifica se o NLI tem sinal forte o suficiente para alterar o veredito.

    Quando ranking_fontes foi aplicado (alguma fonte tem tipo_fonte), prioriza
    fontes de tipo independente (oficial, jornalistica, fact_checking) de alta
    confiabilidade. Se não houver fontes independentes suficientes (ex.: query
    factual retorna só Wikipedia/enciclopédia), usa votos NLI totais como
    fallback — evita silenciar o NLI em afirmações factuais simples.
    """
    if not nli_score or nli_score < _SCORE_NLI_FORTE:
        return False
    ranking_aplicado = any("tipo_fonte" in f for f in fontes)
    if ranking_aplicado:
        votos_confiaveis = _contar_votos_confiaveis(fontes, label)
        if votos_confiaveis >= _MIN_VOTOS_CONFIAVEIS:
            return True
        # Fallback: sem fontes independentes em número suficiente, usa votos totais
        return (nli_votos or {}).get(label, 0) >= _MIN_VOTOS_CONFIAVEIS
    return (nli_votos or {}).get(label, 0) >= _MIN_VOTOS_CONFIAVEIS


def _tem_factcheck_forte(fontes: list[dict], label: str) -> bool:
    """
    Retorna True se existe ao menos uma fonte fact_checking de alta
    confiabilidade com o nli_label indicado e score >= _SCORE_FACTCHECK_ESPECIAL.

    Uma única fonte de fact-checking qualificada é suficiente para acionar
    a regra especial — reflete a natureza especializada dessas agências.
    """
    return any(
        f.get("tipo_fonte") == "fact_checking"
        and f.get("confiabilidade_fonte") == "alta"
        and f.get("nli_label") == label
        and (f.get("nli_score") or 0.0) >= _SCORE_FACTCHECK_ESPECIAL
        for f in fontes
    )


# ---------------------------------------------------------------------------
# Função principal
# ---------------------------------------------------------------------------

def decidir_veredito_final(
    resultado_atual: str,
    confianca_atual: float,
    nli_resultado_agregado: str | None,
    nli_score_agregado: float | None,
    nli_votos: dict | None,
    fontes: list[dict],
) -> dict:
    """
    Combina o resultado do fluxo atual com o sinal NLI de forma conservadora.

    Parâmetros:
        resultado_atual        — "REAL" | "FALSO" | "INCONCLUSIVO"
        confianca_atual        — confiança do resultado atual (0.0–1.0)
        nli_resultado_agregado — "SUPPORTS" | "REFUTES" | "NEUTRAL" | None
        nli_score_agregado     — score médio do veredito NLI (0.0–1.0)
        nli_votos              — {"SUPPORTS": int, "REFUTES": int, "NEUTRAL": int}
        fontes                 — lista com campos nli_label e confiabilidade_fonte

    Retorna:
        {
            "resultado"             : "REAL" | "FALSO" | "INCONCLUSIVO",
            "confianca"             : float,
            "decisao_origem"        : "fluxo_atual" | "nli_reforcou"
                                      | "nli_decidiu_inconclusivo",
            "justificativa_decisao" : str,
        }
    """

    # ------------------------------------------------------------------
    # Regra 1a — NLI completamente ausente ou sem fontes avaliadas
    # ------------------------------------------------------------------
    if not _tem_fontes(nli_votos) or not nli_resultado_agregado:
        logger.debug(
            "Decisor: NLI ausente/sem fontes — fluxo_atual (%s conf=%.2f)",
            resultado_atual, confianca_atual,
        )
        return {
            "resultado": resultado_atual,
            "confianca": confianca_atual,
            "decisao_origem": "fluxo_atual",
            "justificativa_decisao": (
                "Não foi possível verificar a alegação com fontes externas suficientes. "
                "O resultado baseia-se na análise de padrões do texto."
            ),
        }

    # ------------------------------------------------------------------
    # Regra especial — fact-checking de alta confiabilidade em conflito
    # ------------------------------------------------------------------
    if resultado_atual == "REAL" and _tem_factcheck_forte(fontes, "REFUTES"):
        logger.info(
            "Decisor: ML=REAL + fact_checking REFUTES forte → INCONCLUSIVO (regra especial)"
        )
        return {
            "resultado": "INCONCLUSIVO",
            "confianca": _CONFIANCA_CONFLITO,
            "decisao_origem": "nli_decidiu_inconclusivo",
            "justificativa_decisao": (
                "Uma agência especializada em verificação de fatos encontrou evidências "
                "que contradizem a alegação. Por cautela, o resultado foi marcado como inconclusivo."
            ),
        }

    if resultado_atual == "FALSO" and _tem_factcheck_forte(fontes, "SUPPORTS"):
        logger.info(
            "Decisor: ML=FALSO + fact_checking SUPPORTS forte → INCONCLUSIVO (regra especial)"
        )
        return {
            "resultado": "INCONCLUSIVO",
            "confianca": _CONFIANCA_CONFLITO,
            "decisao_origem": "nli_decidiu_inconclusivo",
            "justificativa_decisao": (
                "Uma agência especializada em verificação de fatos encontrou evidências "
                "favoráveis à alegação, enquanto a análise de texto apontou o oposto. "
                "Por cautela, o resultado foi marcado como inconclusivo."
            ),
        }

    # ------------------------------------------------------------------
    # Regra 1b — NLI neutro: mantém fluxo atual
    # ------------------------------------------------------------------
    if nli_resultado_agregado == "NEUTRAL":
        logger.debug(
            "Decisor: NLI neutro — fluxo_atual (%s conf=%.2f)",
            resultado_atual, confianca_atual,
        )
        return {
            "resultado": resultado_atual,
            "confianca": confianca_atual,
            "decisao_origem": "fluxo_atual",
            "justificativa_decisao": (
                "As fontes consultadas não apresentaram evidências claras a favor "
                "ou contra a alegação. O resultado baseia-se na análise do texto."
            ),
        }

    # ------------------------------------------------------------------
    # Regras 2, 4, 5 — NLI = SUPPORTS
    # ------------------------------------------------------------------
    if nli_resultado_agregado == "SUPPORTS":
        forte = _nli_e_forte(nli_score_agregado, nli_votos, fontes, "SUPPORTS")

        if resultado_atual == "REAL" and forte:
            nova = round(min(_MAX_CONFIANCA, confianca_atual + _BOOST_CONCORDANCIA), 4)
            logger.info("Decisor: ML=REAL + NLI=SUPPORTS → REAL (%.2f→%.2f)", confianca_atual, nova)
            return {
                "resultado": "REAL",
                "confianca": nova,
                "decisao_origem": "nli_reforcou",
                "justificativa_decisao": (
                    "Fontes confiáveis corroboram a alegação e a análise do texto "
                    "aponta na mesma direção. A confiança foi reforçada pelas evidências encontradas."
                ),
            }

        if resultado_atual == "FALSO" and forte:
            logger.info("Decisor: ML=FALSO + NLI=SUPPORTS → INCONCLUSIVO (conflito)")
            return {
                "resultado": "INCONCLUSIVO",
                "confianca": _CONFIANCA_CONFLITO,
                "decisao_origem": "nli_decidiu_inconclusivo",
                "justificativa_decisao": (
                    "As fontes consultadas apoiam a alegação, mas a análise do texto "
                    "indica o contrário. Não foi possível chegar a uma conclusão definitiva."
                ),
            }

        if resultado_atual == "INCONCLUSIVO" and forte:
            conf_nli = round(min(_MAX_CONFIANCA, nli_score_agregado), 4)
            logger.info("Decisor: INCONCLUSIVO + NLI=SUPPORTS → REAL (score=%.2f)", nli_score_agregado)
            return {
                "resultado": "REAL",
                "confianca": conf_nli,
                "decisao_origem": "nli_reforcou",
                "justificativa_decisao": (
                    "A análise inicial era inconclusiva, mas as fontes consultadas "
                    "confirmam a alegação com evidências suficientes."
                ),
            }

    # ------------------------------------------------------------------
    # Regras 2, 3, 6 — NLI = REFUTES
    # ------------------------------------------------------------------
    if nli_resultado_agregado == "REFUTES":
        forte = _nli_e_forte(nli_score_agregado, nli_votos, fontes, "REFUTES")

        if resultado_atual == "FALSO" and forte:
            nova = round(min(_MAX_CONFIANCA, confianca_atual + _BOOST_CONCORDANCIA), 4)
            logger.info("Decisor: ML=FALSO + NLI=REFUTES → FALSO (%.2f→%.2f)", confianca_atual, nova)
            return {
                "resultado": "FALSO",
                "confianca": nova,
                "decisao_origem": "nli_reforcou",
                "justificativa_decisao": (
                    "A análise do texto e as fontes consultadas concordam que "
                    "a alegação não corresponde aos fatos. A confiança foi reforçada "
                    "pelas evidências encontradas."
                ),
            }

        if resultado_atual == "REAL" and forte:
            logger.info("Decisor: ML=REAL + NLI=REFUTES → INCONCLUSIVO (conflito)")
            return {
                "resultado": "INCONCLUSIVO",
                "confianca": _CONFIANCA_CONFLITO,
                "decisao_origem": "nli_decidiu_inconclusivo",
                "justificativa_decisao": (
                    "As fontes consultadas contradizem a alegação, mas a análise "
                    "do texto discordou. Não foi possível chegar a uma conclusão definitiva."
                ),
            }

        if resultado_atual == "INCONCLUSIVO" and forte:
            conf_nli = round(min(_MAX_CONFIANCA, nli_score_agregado), 4)
            logger.info("Decisor: INCONCLUSIVO + NLI=REFUTES → FALSO (score=%.2f)", nli_score_agregado)
            return {
                "resultado": "FALSO",
                "confianca": conf_nli,
                "decisao_origem": "nli_reforcou",
                "justificativa_decisao": (
                    "A análise inicial era inconclusiva, mas as fontes consultadas "
                    "refutam a alegação com evidências suficientes."
                ),
            }

    # ------------------------------------------------------------------
    # Fallback — NLI presente mas sinal fraco
    # ------------------------------------------------------------------
    logger.debug(
        "Decisor: NLI=%s score=%.2f sinal fraco — fluxo_atual",
        nli_resultado_agregado, nli_score_agregado or 0.0,
    )
    return {
        "resultado": resultado_atual,
        "confianca": confianca_atual,
        "decisao_origem": "fluxo_atual",
        "justificativa_decisao": (
            "As fontes encontradas não apresentaram evidências conclusivas "
            "suficientes para confirmar ou refutar a alegação. "
            "O resultado baseia-se principalmente na análise do texto."
        ),
    }
