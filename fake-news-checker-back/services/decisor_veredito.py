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

    Quando ranking_fontes foi aplicado (alguma fonte tem tipo_fonte), usa apenas
    fontes de tipo independente (oficial, jornalistica, fact_checking) de alta
    confiabilidade. Quando não foi aplicado, cai no fallback por nli_votos.
    """
    if not nli_score or nli_score < _SCORE_NLI_FORTE:
        return False
    ranking_aplicado = any("tipo_fonte" in f for f in fontes)
    if ranking_aplicado:
        return _contar_votos_confiaveis(fontes, label) >= _MIN_VOTOS_CONFIAVEIS
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
                "NLI sem fontes avaliadas; mantém o resultado do fluxo atual."
            ),
        }

    # ------------------------------------------------------------------
    # Regra especial — fact-checking de alta confiabilidade em conflito
    # ------------------------------------------------------------------
    # Uma única agência de fact-checking qualificada (score >= 0.60) é
    # suficiente para tornar o resultado INCONCLUSIVO quando contradiz o ML,
    # independentemente do label agregado das demais fontes.
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
                "Fonte de fact-checking de alta confiabilidade refuta a alegação. "
                "Resultado conservador: INCONCLUSIVO."
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
                "Fonte de fact-checking de alta confiabilidade confirma a alegação "
                "contradizendo o ML. Resultado conservador: INCONCLUSIVO."
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
                "NLI com resultado neutro; mantém o resultado do fluxo atual."
            ),
        }

    # ------------------------------------------------------------------
    # Regras 2, 4, 5 — NLI = SUPPORTS
    # ------------------------------------------------------------------
    if nli_resultado_agregado == "SUPPORTS":
        forte = _nli_e_forte(nli_score_agregado, nli_votos, fontes, "SUPPORTS")

        if resultado_atual == "REAL" and forte:
            # Concordância: boost de confiança
            nova = round(min(_MAX_CONFIANCA, confianca_atual + _BOOST_CONCORDANCIA), 4)
            logger.info("Decisor: ML=REAL + NLI=SUPPORTS → REAL (%.2f→%.2f)", confianca_atual, nova)
            return {
                "resultado": "REAL",
                "confianca": nova,
                "decisao_origem": "nli_reforcou",
                "justificativa_decisao": (
                    f"ML e NLI concordam (REAL/SUPPORTS, score={nli_score_agregado:.2f}); "
                    f"confiança de {confianca_atual:.2f} → {nova:.2f}."
                ),
            }

        if resultado_atual == "FALSO" and forte:
            # Conflito: INCONCLUSIVO conservador
            logger.info("Decisor: ML=FALSO + NLI=SUPPORTS → INCONCLUSIVO (conflito)")
            return {
                "resultado": "INCONCLUSIVO",
                "confianca": _CONFIANCA_CONFLITO,
                "decisao_origem": "nli_decidiu_inconclusivo",
                "justificativa_decisao": (
                    f"Conflito: ML=FALSO mas fontes NLI indicam SUPPORTS "
                    f"(score={nli_score_agregado:.2f}). "
                    "Resultado conservador: INCONCLUSIVO."
                ),
            }

        if resultado_atual == "INCONCLUSIVO" and forte:
            # NLI resolve a ambiguidade
            conf_nli = round(min(_MAX_CONFIANCA, nli_score_agregado), 4)
            logger.info("Decisor: INCONCLUSIVO + NLI=SUPPORTS → REAL (score=%.2f)", nli_score_agregado)
            return {
                "resultado": "REAL",
                "confianca": conf_nli,
                "decisao_origem": "nli_reforcou",
                "justificativa_decisao": (
                    f"Resultado era inconclusivo; NLI forte SUPPORTS "
                    f"(score={nli_score_agregado:.2f}) resolve para REAL."
                ),
            }

    # ------------------------------------------------------------------
    # Regras 2, 3, 6 — NLI = REFUTES
    # ------------------------------------------------------------------
    if nli_resultado_agregado == "REFUTES":
        forte = _nli_e_forte(nli_score_agregado, nli_votos, fontes, "REFUTES")

        if resultado_atual == "FALSO" and forte:
            # Concordância: boost de confiança
            nova = round(min(_MAX_CONFIANCA, confianca_atual + _BOOST_CONCORDANCIA), 4)
            logger.info("Decisor: ML=FALSO + NLI=REFUTES → FALSO (%.2f→%.2f)", confianca_atual, nova)
            return {
                "resultado": "FALSO",
                "confianca": nova,
                "decisao_origem": "nli_reforcou",
                "justificativa_decisao": (
                    f"ML e NLI concordam (FALSO/REFUTES, score={nli_score_agregado:.2f}); "
                    f"confiança de {confianca_atual:.2f} → {nova:.2f}."
                ),
            }

        if resultado_atual == "REAL" and forte:
            # Conflito: INCONCLUSIVO conservador
            logger.info("Decisor: ML=REAL + NLI=REFUTES → INCONCLUSIVO (conflito)")
            return {
                "resultado": "INCONCLUSIVO",
                "confianca": _CONFIANCA_CONFLITO,
                "decisao_origem": "nli_decidiu_inconclusivo",
                "justificativa_decisao": (
                    f"Conflito: ML=REAL mas fontes NLI indicam REFUTES "
                    f"(score={nli_score_agregado:.2f}). "
                    "Resultado conservador: INCONCLUSIVO."
                ),
            }

        if resultado_atual == "INCONCLUSIVO" and forte:
            # NLI resolve a ambiguidade
            conf_nli = round(min(_MAX_CONFIANCA, nli_score_agregado), 4)
            logger.info("Decisor: INCONCLUSIVO + NLI=REFUTES → FALSO (score=%.2f)", nli_score_agregado)
            return {
                "resultado": "FALSO",
                "confianca": conf_nli,
                "decisao_origem": "nli_reforcou",
                "justificativa_decisao": (
                    f"Resultado era inconclusivo; NLI forte REFUTES "
                    f"(score={nli_score_agregado:.2f}) resolve para FALSO."
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
            f"NLI={nli_resultado_agregado} (score={nli_score_agregado:.2f}) "
            "presente mas sem sinal forte suficiente para alterar o resultado."
        ),
    }
