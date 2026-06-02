# ==============================================================================
# CheckAI API — Decisor de Veredito Final
# ==============================================================================
# Camada de decisão conservadora que combina o resultado do fluxo atual
# (ML + heurísticas) com o sinal NLI para produzir o veredito definitivo.
#
# Regras (conservadoras por design para TCC):
#   1. Sem fontes NLI ou NLI neutro           → mantém fluxo atual
#   2. NLI e ML concordam (forte)             → mantém resultado + pequeno boost
#   3. ML=REAL   + NLI=REFUTES forte          → INCONCLUSIVO (conflito)
#   4. ML=FALSO  + NLI=SUPPORTS forte         → INCONCLUSIVO (conflito)
#   5. ML=INCONCLUSIVO + NLI=SUPPORTS forte   → REAL  (NLI resolve)
#   6. ML=INCONCLUSIVO + NLI=REFUTES forte    → FALSO (NLI resolve)
#   7. NLI fraco (score ou votos insuficientes) → mantém fluxo atual
#
# "NLI forte" exige:
#   - score_agregado >= _SCORE_NLI_FORTE (0.75)
#   - pelo menos _MIN_VOTOS_CONFIAVEIS (2) fontes de alta confiabilidade
#     com o label NLI esperado, OU a mesma quantidade de votos diretos
#     no dicionário nli_votos (fallback quando ranking não foi aplicado).
# ==============================================================================

import logging

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Limiares
# ---------------------------------------------------------------------------

_SCORE_NLI_FORTE: float = 0.75      # score mínimo para o NLI influenciar
_MIN_VOTOS_CONFIAVEIS: int = 2       # fontes de alta confiabilidade necessárias
_BOOST_CONCORDANCIA: float = 0.05   # acréscimo de confiança quando ML ≡ NLI
_CONFIANCA_CONFLITO: float = 0.55   # confiança adotada ao entrar em conflito
_MAX_CONFIANCA: float = 0.99        # teto absoluto de confiança


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
    Conta fontes com confiabilidade_fonte == "alta" que têm o label NLI indicado.

    Depende do ranking_fontes ter sido aplicado previamente.
    """
    return sum(
        1
        for f in fontes
        if f.get("confiabilidade_fonte") == "alta" and f.get("nli_label") == label
    )


def _nli_e_forte(
    nli_score: float | None,
    nli_votos: dict | None,
    fontes: list[dict],
    label: str,
) -> bool:
    """
    Verifica se o NLI tem sinal forte o suficiente para alterar o veredito.

    Exige score alto E quantidade mínima de fontes confiáveis concordando.
    O fallback por nli_votos cobre o caso em que ranking_fontes não foi aplicado.
    """
    if not nli_score or nli_score < _SCORE_NLI_FORTE:
        return False
    if _contar_votos_confiaveis(fontes, label) >= _MIN_VOTOS_CONFIAVEIS:
        return True
    return (nli_votos or {}).get(label, 0) >= _MIN_VOTOS_CONFIAVEIS


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
    # Regra 1 — NLI ausente, sem fontes ou neutro: mantém fluxo atual
    # ------------------------------------------------------------------
    if (
        not _tem_fontes(nli_votos)
        or not nli_resultado_agregado
        or nli_resultado_agregado == "NEUTRAL"
    ):
        logger.debug(
            "Decisor: NLI ausente/neutro — fluxo_atual (%s conf=%.2f)",
            resultado_atual, confianca_atual,
        )
        return {
            "resultado": resultado_atual,
            "confianca": confianca_atual,
            "decisao_origem": "fluxo_atual",
            "justificativa_decisao": (
                "NLI sem fontes avaliadas ou resultado neutro; "
                "mantém o resultado do fluxo atual."
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
