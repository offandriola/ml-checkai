"""
Testes unitários — ponderação temporal de fontes.

Verifica que o decisor trata corretamente cenários onde fontes antigas
podem dar sinais enganosos em alegações temporalmente sensíveis.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from services.decisor_veredito import decidir_veredito_final


def _fonte(
    tipo_fonte="jornalistica",
    confiabilidade="alta",
    nli_label="SUPPORTS",
    nli_score=0.9,
):
    return {
        "tipo_fonte": tipo_fonte,
        "confiabilidade_fonte": confiabilidade,
        "nli_label": nli_label,
        "nli_score": nli_score,
    }


# ── Cenários do decisor ───────────────────────────────────────────────────────

def test_decisor_sem_fontes_nli_mantem_resultado():
    """Sem fontes NLI avaliadas, mantém o resultado do ML."""
    veredito = decidir_veredito_final(
        resultado_atual="REAL",
        confianca_atual=0.80,
        nli_resultado_agregado=None,
        nli_score_agregado=None,
        nli_votos=None,
        fontes=[],
    )
    assert veredito["resultado"] == "REAL"
    assert veredito["decisao_origem"] == "fluxo_atual"


def test_decisor_nli_neutro_mantem_resultado():
    """NLI neutro não deve alterar o resultado."""
    veredito = decidir_veredito_final(
        resultado_atual="FALSO",
        confianca_atual=0.75,
        nli_resultado_agregado="NEUTRAL",
        nli_score_agregado=0.60,
        nli_votos={"SUPPORTS": 0, "REFUTES": 1, "NEUTRAL": 2},
        fontes=[_fonte(nli_label="NEUTRAL")],
    )
    assert veredito["resultado"] == "FALSO"
    assert veredito["decisao_origem"] == "fluxo_atual"


def test_decisor_conflito_real_refutes_inconclusivo():
    """ML=REAL + NLI=REFUTES forte → INCONCLUSIVO conservador."""
    fontes = [
        _fonte(tipo_fonte="jornalistica", confiabilidade="alta", nli_label="REFUTES", nli_score=0.9),
        _fonte(tipo_fonte="oficial",      confiabilidade="alta", nli_label="REFUTES", nli_score=0.85),
    ]
    veredito = decidir_veredito_final(
        resultado_atual="REAL",
        confianca_atual=0.80,
        nli_resultado_agregado="REFUTES",
        nli_score_agregado=0.87,
        nli_votos={"SUPPORTS": 0, "REFUTES": 2, "NEUTRAL": 0},
        fontes=fontes,
    )
    assert veredito["resultado"] == "INCONCLUSIVO"
    assert veredito["decisao_origem"] == "nli_decidiu_inconclusivo"
    # Justificativa deve ser legível (sem códigos internos)
    assert "nli" not in veredito["justificativa_decisao"].lower()
    assert "REFUTES" not in veredito["justificativa_decisao"]


def test_decisor_sem_evidencias_externas_justificativa_legivel():
    """Justificativa sempre deve ser legível ao usuário, sem termos técnicos."""
    veredito = decidir_veredito_final(
        resultado_atual="INCONCLUSIVO",
        confianca_atual=0.60,
        nli_resultado_agregado="SUPPORTS",
        nli_score_agregado=0.85,
        nli_votos={"SUPPORTS": 3, "REFUTES": 0, "NEUTRAL": 0},
        fontes=[
            _fonte(tipo_fonte="jornalistica", confiabilidade="alta", nli_label="SUPPORTS", nli_score=0.85),
            _fonte(tipo_fonte="oficial",      confiabilidade="alta", nli_label="SUPPORTS", nli_score=0.90),
            _fonte(tipo_fonte="fact_checking", confiabilidade="alta", nli_label="SUPPORTS", nli_score=0.80),
        ],
    )
    justificativa = veredito["justificativa_decisao"]
    # Não deve conter termos técnicos internos
    assert "nli_reforcou" not in justificativa
    assert "fluxo_atual" not in justificativa
    assert "nli_decidiu_inconclusivo" not in justificativa
    # Deve ser uma frase completa em português
    assert len(justificativa) > 20
    assert justificativa[0].isupper()
