# -*- coding: utf-8 -*-
"""
Teste manual do decisor de veredito final — services/decisor_veredito.py
========================================================================

Cobre os 8 cenarios definidos no enunciado + 1 cenario de NLI fraco.

Como executar (na pasta fake-news-checker-back/):
  python test_decisor_veredito.py
"""

import io
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
else:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

sys.path.insert(0, ".")

from services.decisor_veredito import decidir_veredito_final

SEP = "=" * 68


# ---------------------------------------------------------------------------
# Helpers de montagem de cenarios
# ---------------------------------------------------------------------------

def _fontes_altas(label: str, n: int = 3) -> list[dict]:
    """Cria n fontes de alta confiabilidade com o nli_label especificado."""
    return [
        {
            "titulo": f"Fonte confiavel {i+1}",
            "url": f"https://g1.globo.com/noticia-{i}",
            "snippet": f"Conteudo da noticia {i+1} com informacao verificada.",
            "fonte": "g1.globo.com",
            "confiabilidade_fonte": "alta",
            "nli_label": label,
            "nli_score": 0.92,
        }
        for i in range(n)
    ]


def _votos(label: str, n: int = 3) -> dict:
    outros = {"SUPPORTS": 0, "REFUTES": 0, "NEUTRAL": 0}
    outros[label] = n
    return outros


def _fontes_contextuais(label: str, n: int = 3) -> list[dict]:
    """Fontes contextual_politica (lula.com.br) — nao devem influenciar veredito."""
    return [
        {
            "titulo": f"Site politico {i + 1}",
            "url": f"https://lula.com.br/pronunciamento-{i}",
            "snippet": f"Conteudo do site politico {i + 1} com informacao sobre o tema.",
            "fonte": "lula.com.br",
            "tipo_fonte": "contextual_politica",
            "confiabilidade_fonte": "baixa",
            "nli_label": label,
            "nli_score": 0.92,
        }
        for i in range(n)
    ]


def _fontes_com_tipo(
    label: str, tipo: str, confiab: str = "alta", score: float = 0.88, n: int = 3
) -> list[dict]:
    """Fontes com tipo_fonte explicitamente definido (ranking aplicado)."""
    dominios = {
        "oficial": ("tse.jus.br", "https://tse.jus.br/noticia-{}"),
        "fact_checking": ("aosfatos.org", "https://aosfatos.org/noticias/{}"),
        "jornalistica": ("g1.globo.com", "https://g1.globo.com/noticia-{}"),
    }
    fonte_dom, url_tpl = dominios.get(tipo, ("exemplo.com", "https://exemplo.com/{}"))
    return [
        {
            "titulo": f"Fonte {tipo} {i + 1}",
            "url": url_tpl.format(i),
            "snippet": f"Conteudo verificado da fonte {tipo} {i + 1}.",
            "fonte": fonte_dom,
            "tipo_fonte": tipo,
            "confiabilidade_fonte": confiab,
            "nli_label": label,
            "nli_score": score,
        }
        for i in range(n)
    ]


def _rodar(cenario: dict) -> bool:
    resultado_obj = decidir_veredito_final(
        resultado_atual=cenario["resultado_atual"],
        confianca_atual=cenario["confianca_atual"],
        nli_resultado_agregado=cenario["nli_resultado_agregado"],
        nli_score_agregado=cenario["nli_score_agregado"],
        nli_votos=cenario["nli_votos"],
        fontes=cenario["fontes"],
    )

    esperado_resultado = cenario["esperado_resultado"]
    esperado_origem = cenario["esperado_origem"]

    ok_resultado = resultado_obj["resultado"] == esperado_resultado
    ok_origem = resultado_obj["decisao_origem"] == esperado_origem
    ok = ok_resultado and ok_origem

    icone = "[OK]" if ok else "[XX]"
    print(f"\n  {icone} Cenario {cenario['id']}: {cenario['nome']}")
    print(f"       Entrada : resultado={cenario['resultado_atual']}  conf={cenario['confianca_atual']:.2f}  NLI={cenario['nli_resultado_agregado']}  score_nli={cenario['nli_score_agregado']}")
    print(f"       Saida   : resultado={resultado_obj['resultado']}  conf={resultado_obj['confianca']:.2f}  origem={resultado_obj['decisao_origem']}")
    print(f"       Esperado: resultado={esperado_resultado}  origem={esperado_origem}")
    if not ok_resultado:
        print(f"       [FALHOU] resultado esperado={esperado_resultado}, obtido={resultado_obj['resultado']}")
    if not ok_origem:
        print(f"       [FALHOU] origem esperada={esperado_origem}, obtida={resultado_obj['decisao_origem']}")
    print(f"       Justif. : {resultado_obj['justificativa_decisao'][:80]}...")

    return ok


# ---------------------------------------------------------------------------
# Definicao dos 9 cenarios
# ---------------------------------------------------------------------------

CENARIOS = [
    # 1. ML=REAL + NLI=SUPPORTS forte → mantém REAL com boost
    {
        "id": "1",
        "nome": "ML=REAL + NLI=SUPPORTS forte → REAL (boost)",
        "resultado_atual": "REAL",
        "confianca_atual": 0.82,
        "nli_resultado_agregado": "SUPPORTS",
        "nli_score_agregado": 0.93,
        "nli_votos": _votos("SUPPORTS", 3),
        "fontes": _fontes_altas("SUPPORTS", 3),
        "esperado_resultado": "REAL",
        "esperado_origem": "nli_reforcou",
    },
    # 2. ML=FALSO + NLI=REFUTES forte → mantém FALSO com boost
    {
        "id": "2",
        "nome": "ML=FALSO + NLI=REFUTES forte → FALSO (boost)",
        "resultado_atual": "FALSO",
        "confianca_atual": 0.88,
        "nli_resultado_agregado": "REFUTES",
        "nli_score_agregado": 0.97,
        "nli_votos": _votos("REFUTES", 3),
        "fontes": _fontes_altas("REFUTES", 3),
        "esperado_resultado": "FALSO",
        "esperado_origem": "nli_reforcou",
    },
    # 3. ML=REAL + NLI=REFUTES forte → INCONCLUSIVO
    {
        "id": "3",
        "nome": "ML=REAL + NLI=REFUTES forte → INCONCLUSIVO (conflito)",
        "resultado_atual": "REAL",
        "confianca_atual": 0.75,
        "nli_resultado_agregado": "REFUTES",
        "nli_score_agregado": 0.91,
        "nli_votos": _votos("REFUTES", 3),
        "fontes": _fontes_altas("REFUTES", 3),
        "esperado_resultado": "INCONCLUSIVO",
        "esperado_origem": "nli_decidiu_inconclusivo",
    },
    # 4. ML=FALSO + NLI=SUPPORTS forte → INCONCLUSIVO
    {
        "id": "4",
        "nome": "ML=FALSO + NLI=SUPPORTS forte → INCONCLUSIVO (conflito)",
        "resultado_atual": "FALSO",
        "confianca_atual": 0.79,
        "nli_resultado_agregado": "SUPPORTS",
        "nli_score_agregado": 0.85,
        "nli_votos": _votos("SUPPORTS", 3),
        "fontes": _fontes_altas("SUPPORTS", 3),
        "esperado_resultado": "INCONCLUSIVO",
        "esperado_origem": "nli_decidiu_inconclusivo",
    },
    # 5. ML=INCONCLUSIVO + NLI=SUPPORTS forte → REAL
    {
        "id": "5",
        "nome": "ML=INCONCLUSIVO + NLI=SUPPORTS forte → REAL (NLI resolve)",
        "resultado_atual": "INCONCLUSIVO",
        "confianca_atual": 0.55,
        "nli_resultado_agregado": "SUPPORTS",
        "nli_score_agregado": 0.89,
        "nli_votos": _votos("SUPPORTS", 3),
        "fontes": _fontes_altas("SUPPORTS", 3),
        "esperado_resultado": "REAL",
        "esperado_origem": "nli_reforcou",
    },
    # 6. ML=INCONCLUSIVO + NLI=REFUTES forte → FALSO
    {
        "id": "6",
        "nome": "ML=INCONCLUSIVO + NLI=REFUTES forte → FALSO (NLI resolve)",
        "resultado_atual": "INCONCLUSIVO",
        "confianca_atual": 0.55,
        "nli_resultado_agregado": "REFUTES",
        "nli_score_agregado": 0.94,
        "nli_votos": _votos("REFUTES", 3),
        "fontes": _fontes_altas("REFUTES", 3),
        "esperado_resultado": "FALSO",
        "esperado_origem": "nli_reforcou",
    },
    # 7. NLI=NEUTRAL → mantém resultado atual sem alterar
    {
        "id": "7",
        "nome": "NLI=NEUTRAL → mantém resultado atual (FALSO)",
        "resultado_atual": "FALSO",
        "confianca_atual": 0.81,
        "nli_resultado_agregado": "NEUTRAL",
        "nli_score_agregado": 0.92,
        "nli_votos": {"SUPPORTS": 0, "REFUTES": 0, "NEUTRAL": 3},
        "fontes": _fontes_altas("NEUTRAL", 3),
        "esperado_resultado": "FALSO",
        "esperado_origem": "fluxo_atual",
    },
    # 8. Sem fontes (votos todos 0) → mantém resultado atual
    {
        "id": "8",
        "nome": "Sem fontes avaliadas → mantém resultado atual (REAL)",
        "resultado_atual": "REAL",
        "confianca_atual": 0.73,
        "nli_resultado_agregado": "REFUTES",
        "nli_score_agregado": 0.88,
        "nli_votos": {"SUPPORTS": 0, "REFUTES": 0, "NEUTRAL": 0},
        "fontes": [],
        "esperado_resultado": "REAL",
        "esperado_origem": "fluxo_atual",
    },
    # 9. NLI fraco (score abaixo do limiar) → mantém resultado atual
    {
        "id": "9",
        "nome": "NLI=REFUTES fraco (score=0.60) → mantém resultado (REAL)",
        "resultado_atual": "REAL",
        "confianca_atual": 0.80,
        "nli_resultado_agregado": "REFUTES",
        "nli_score_agregado": 0.60,   # abaixo de _SCORE_NLI_FORTE (0.75)
        "nli_votos": _votos("REFUTES", 3),
        "fontes": _fontes_altas("REFUTES", 3),
        "esperado_resultado": "REAL",
        "esperado_origem": "fluxo_atual",
    },
    # 10. ML=REAL + lula.com.br REFUTES alto → mantém REAL (site politico ignorado)
    {
        "id": "10",
        "nome": "ML=REAL + lula.com.br REFUTES forte → REAL (contextual_politica ignorada)",
        "resultado_atual": "REAL",
        "confianca_atual": 0.80,
        "nli_resultado_agregado": "REFUTES",
        "nli_score_agregado": 0.92,
        "nli_votos": _votos("REFUTES", 3),
        "fontes": _fontes_contextuais("REFUTES", 3),
        "esperado_resultado": "REAL",
        "esperado_origem": "fluxo_atual",
    },
    # 11. ML=REAL + Aos Fatos REFUTES 0.61 → INCONCLUSIVO (regra especial)
    {
        "id": "11",
        "nome": "ML=REAL + Aos Fatos REFUTES score=0.61 → INCONCLUSIVO (regra especial)",
        "resultado_atual": "REAL",
        "confianca_atual": 0.80,
        "nli_resultado_agregado": "REFUTES",
        "nli_score_agregado": 0.61,   # abaixo de _SCORE_NLI_FORTE, mas acima de _SCORE_FACTCHECK_ESPECIAL
        "nli_votos": _votos("REFUTES", 1),
        "fontes": _fontes_com_tipo("REFUTES", "fact_checking", "alta", 0.61, 1),
        "esperado_resultado": "INCONCLUSIVO",
        "esperado_origem": "nli_decidiu_inconclusivo",
    },
    # 12. ML=INCONCLUSIVO + lula.com.br SUPPORTS alto → continua INCONCLUSIVO
    {
        "id": "12",
        "nome": "ML=INCONCLUSIVO + lula.com.br SUPPORTS forte → INCONCLUSIVO (site politico ignorado)",
        "resultado_atual": "INCONCLUSIVO",
        "confianca_atual": 0.55,
        "nli_resultado_agregado": "SUPPORTS",
        "nli_score_agregado": 0.92,
        "nli_votos": _votos("SUPPORTS", 3),
        "fontes": _fontes_contextuais("SUPPORTS", 3),
        "esperado_resultado": "INCONCLUSIVO",
        "esperado_origem": "fluxo_atual",
    },
    # 13. ML=INCONCLUSIVO + fonte oficial SUPPORTS forte → REAL
    {
        "id": "13",
        "nome": "ML=INCONCLUSIVO + fonte oficial SUPPORTS forte → REAL",
        "resultado_atual": "INCONCLUSIVO",
        "confianca_atual": 0.55,
        "nli_resultado_agregado": "SUPPORTS",
        "nli_score_agregado": 0.88,
        "nli_votos": _votos("SUPPORTS", 3),
        "fontes": _fontes_com_tipo("SUPPORTS", "oficial", "alta", 0.88, 3),
        "esperado_resultado": "REAL",
        "esperado_origem": "nli_reforcou",
    },
]


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------

def main() -> None:
    print(f"\n{SEP}")
    print("  Teste do Decisor de Veredito Final — CheckAI")
    print(SEP)
    print(f"\n  Total de cenarios: {len(CENARIOS)}")

    acertos = 0
    for cenario in CENARIOS:
        if _rodar(cenario):
            acertos += 1

    print(f"\n{SEP}")
    print("  Resumo")
    print(SEP)
    print(f"\n  Acertos : {acertos}/{len(CENARIOS)}")
    status = "PASSOU" if acertos == len(CENARIOS) else "PARCIAL"
    print(f"  Status  : {status}")
    print()


if __name__ == "__main__":
    main()
