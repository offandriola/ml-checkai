# -*- coding: utf-8 -*-
"""
Teste isolado do servico NLI do CheckAI - services/nli.py
==========================================================

Executa quatro baterias de testes sem depender de banco de dados,
API externa, token JWT nem do classificador ML existente.

Casos cobertos:
  1. SUPPORTS  - evidencia confirma claramente a alegacao
  2. REFUTES   - evidencia contradiz / nega a alegacao
  3. NEUTRAL   - evidencia fala do tema mas nao confirma nem refuta
  4. Casos de borda - evidencia vazia, alegacao sem contexto, texto longo

Como executar (na pasta fake-news-checker-back/):
  python test_nli_standalone.py

Pre-requisitos:
  pip install transformers torch sentencepiece
  Modelo: MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7
  (~550 MB, multilingue com suporte nativo a Portugues, 3-classes)
  O modelo e baixado automaticamente do Hugging Face Hub na primeira execucao.
"""
import io
import sys

# Forca UTF-8 no stdout para evitar erros de encoding no Windows (cp1252)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
else:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import sys
import time

# Garante que importações do pacote services/ funcionem sem instalar como pacote
sys.path.insert(0, ".")

from services.nli import (
    agregar_resultado_nli,
    carregar_modelo_nli,
    classificar_par_nli,
    classificar_pares_nli,
    status_modelo_nli,
)

# ---------------------------------------------------------------------------
# Helpers de exibição
# ---------------------------------------------------------------------------

_SEP = "=" * 68
_OK = "PASSOU"
_FAIL = "FALHOU"
_SIM = "[OK]"
_NAO = "[XX]"


def _linha(titulo: str) -> None:
    print(f"\n{_SEP}")
    print(f"  {titulo}")
    print(_SEP)


def _exibir_caso(
    numero: str,
    alegacao: str,
    evidencia: str,
    resultado: dict,
    esperado: str,
) -> bool:
    label = resultado["label"]
    score = resultado["score"]
    ok = label == esperado
    icone = _SIM if ok else _NAO
    trecho = evidencia[:90] + "..." if len(evidencia) > 90 else evidencia

    print(f"\n  [{numero}] Alegação : {alegacao}")
    print(f"       Evidência: {trecho}")
    print(f"       Resultado: {label}  (score={score:.4f})")
    print(f"       Esperado : {esperado}  {icone}")
    return ok


# ===========================================================================
# BATERIA 1 — Casos principais: SUPPORTS / REFUTES / NEUTRAL
# ===========================================================================

CASOS_PRINCIPAIS = [
    {
        "id": "1",
        "nome": "SUPPORTS — evidência confirma diretamente",
        "alegacao": "Lula foi eleito presidente do Brasil em 2022.",
        "evidencia": (
            "Luiz Inácio Lula da Silva venceu Jair Bolsonaro no segundo turno "
            "das eleições presidenciais de 2022 e assumiu o terceiro mandato "
            "como presidente da República Federativa do Brasil em janeiro de 2023."
        ),
        "esperado": "SUPPORTS",
    },
    {
        "id": "2",
        "nome": "REFUTES — evidência contradiz e nega explicitamente",
        "alegacao": "Lula é vice-presidente de Bolsonaro.",
        "evidencia": (
            "Lula e Bolsonaro foram adversários diretos nas eleições de 2022. "
            "Lula venceu Bolsonaro e assumiu a presidência do país. "
            "Não é verdade que Lula foi ou é vice-presidente de Bolsonaro — "
            "os dois são rivais políticos, não aliados."
        ),
        "esperado": "REFUTES",
    },
    {
        "id": "3",
        "nome": "NEUTRAL — evidência fala do tema mas não confirma nem refuta",
        "alegacao": "Lula aprovou uma nova reforma tributária em março de 2026.",
        "evidencia": (
            "O governo Lula anunciou medidas econômicas no início de 2026, "
            "com foco em infraestrutura e geração de empregos para a "
            "população de baixa renda. O presidente participou de reuniões "
            "com ministros e líderes do Congresso Nacional."
        ),
        "esperado": "NEUTRAL",
    },
]

# ===========================================================================
# BATERIA 2 — Casos de borda
# ===========================================================================

CASOS_BORDA = [
    {
        "id": "B1",
        "nome": "Evidência vazia → sempre NEUTRAL",
        "alegacao": "Lula foi eleito em 2022.",
        "evidencia": "",
        "esperado": "NEUTRAL",
    },
    {
        "id": "B2",
        "nome": "Evidência de espaços → sempre NEUTRAL",
        "alegacao": "Lula foi eleito em 2022.",
        "evidencia": "   ",
        "esperado": "NEUTRAL",
    },
    {
        "id": "B3",
        "nome": "Evidência muito longa (> MAX_CHARS) → deve funcionar sem erro",
        "alegacao": "Lula foi eleito presidente.",
        "evidencia": (
            "Lula foi eleito presidente do Brasil em 2022, derrotando Bolsonaro. "
            * 100  # gera ~7000 chars
        ),
        "esperado": "SUPPORTS",
    },
    {
        "id": "B4",
        "nome": "Evidência off-topic completa → NEUTRAL",
        "alegacao": "Bolsonaro aprovou a PEC dos precatórios.",
        "evidencia": (
            "A seleção brasileira de futebol venceu a Argentina por 3 a 0 "
            "em amistoso realizado em São Paulo. Os gols foram marcados por "
            "Vinicius Junior, Rodrygo e Raphinha."
        ),
        "esperado": "NEUTRAL",
    },
]


# ===========================================================================
# BATERIA 3 — Agregação de múltiplas fontes
# ===========================================================================

def _rodar_bateria_agregacao(alegacao: str, fontes: list[dict]) -> dict:
    resultados = classificar_pares_nli(alegacao, fontes)
    return agregar_resultado_nli(resultados), resultados


# ===========================================================================
# Runner principal
# ===========================================================================

def main() -> None:
    # -----------------------------------------------------------------------
    # Carregamento do modelo
    # -----------------------------------------------------------------------
    _linha("Carregando modelo NLI")
    print()

    t0 = time.time()
    ok = carregar_modelo_nli()
    elapsed = time.time() - t0

    status = status_modelo_nli()
    print(f"  Modelo   : {status['nli_modelo']}")
    print(f"  3-classes: {status['nli_3classes']}")
    print(f"  Tempo    : {elapsed:.1f}s")
    print(f"  Status   : {status['mensagem']}")

    if not ok:
        print("\n  ERRO: o modelo não foi carregado.")
        print("  Instale as dependências e tente novamente:")
        print("    pip install transformers torch sentencepiece")
        sys.exit(1)

    # -----------------------------------------------------------------------
    # Bateria 1 — Casos principais
    # -----------------------------------------------------------------------
    _linha("Bateria 1 — Casos principais (SUPPORTS / REFUTES / NEUTRAL)")

    acertos_b1 = 0
    for caso in CASOS_PRINCIPAIS:
        t_caso = time.time()
        resultado = classificar_par_nli(caso["alegacao"], caso["evidencia"])
        duracao = time.time() - t_caso
        ok_caso = _exibir_caso(
            caso["id"], caso["alegacao"], caso["evidencia"], resultado, caso["esperado"]
        )
        print(f"       Latência : {duracao:.2f}s")
        if ok_caso:
            acertos_b1 += 1

    print(f"\n  Resultado bateria 1: {acertos_b1}/{len(CASOS_PRINCIPAIS)} acertos")

    # -----------------------------------------------------------------------
    # Bateria 2 — Casos de borda
    # -----------------------------------------------------------------------
    _linha("Bateria 2 — Casos de borda")

    acertos_b2 = 0
    for caso in CASOS_BORDA:
        resultado = classificar_par_nli(caso["alegacao"], caso["evidencia"])
        ok_caso = _exibir_caso(
            caso["id"], caso["alegacao"], caso["evidencia"], resultado, caso["esperado"]
        )
        if ok_caso:
            acertos_b2 += 1

    print(f"\n  Resultado bateria 2: {acertos_b2}/{len(CASOS_BORDA)} acertos")

    # -----------------------------------------------------------------------
    # Bateria 3 — Agregação
    # -----------------------------------------------------------------------
    _linha("Bateria 3 — classificar_pares_nli() + agregar_resultado_nli()")

    # Sub-caso A: maioria SUPPORTS (3 fontes com linguagem direta e confirmadora)
    alegacao_agr = "Lula foi eleito presidente do Brasil em 2022."
    fontes_agr_sup = [
        {
            "titulo": "Resultado das eleicoes presidenciais 2022",
            "url": "https://g1.globo.com/eleicoes",
            "snippet": (
                "Lula foi eleito presidente do Brasil em 2022, derrotando Bolsonaro "
                "no segundo turno com 50,9% dos votos."
            ),
        },
        {
            "titulo": "Lula eleito presidente",
            "url": "https://agenciabrasil.ebc.com.br",
            "snippet": (
                "Luiz Inacio Lula da Silva foi eleito presidente do Brasil em 2022. "
                "Lula derrotou o candidato Jair Bolsonaro e foi eleito para o cargo."
            ),
        },
        {
            "titulo": "Eleicao presidencial brasileira 2022",
            "url": "https://bbc.com/portuguese",
            "snippet": (
                "Lula foi eleito presidente do Brasil em outubro de 2022, "
                "vencendo Jair Bolsonaro e conquistando seu terceiro mandato."
            ),
        },
    ]

    print(f"\n  Sub-caso A — maioria SUPPORTS")
    print(f"  Alegacao: {alegacao_agr}")
    print(f"\n  Avaliando {len(fontes_agr_sup)} fontes...")

    agregado_a, res_a = _rodar_bateria_agregacao(alegacao_agr, fontes_agr_sup)
    for i, (fonte, res) in enumerate(zip(fontes_agr_sup, res_a), 1):
        print(f"\n    Fonte {i}: [{res['label']}  score={res['score']:.4f}]")
        print(f"             {fonte['snippet'][:80]}...")

    print(f"\n  Resultado agregado : {agregado_a['label']}  (score={agregado_a['score']:.4f})")
    print(f"  Votos              : {agregado_a['votos']}")
    esperado_a = "SUPPORTS"
    icone_a = _SIM if agregado_a["label"] == esperado_a else _NAO
    print(f"  Esperado           : {esperado_a}  {icone_a}")
    acerto_a = 1 if agregado_a["label"] == esperado_a else 0

    # Sub-caso B: maioria REFUTES (2 fontes que contradizem)
    alegacao_ref = "Lula e Bolsonaro sao aliados politicos e governam juntos."
    fontes_agr_ref = [
        {
            "titulo": "Rivalidade Lula-Bolsonaro",
            "url": "https://aosfatos.org",
            "snippet": (
                "Lula e Bolsonaro sao adversarios politicos. Nao e verdade que governam "
                "juntos — Bolsonaro perdeu a eleicao de 2022 para Lula."
            ),
        },
        {
            "titulo": "Disputa eleitoral 2022",
            "url": "https://agenciabrasil.ebc.com.br",
            "snippet": (
                "A eleicao de 2022 foi marcada pela disputa entre Lula e Bolsonaro. "
                "Os dois sao rivais, nao aliados. Bolsonaro nao faz parte do governo Lula."
            ),
        },
        {
            "titulo": "Economia em 2023",
            "url": "https://valor.globo.com",
            "snippet": (
                "O PIB brasileiro cresceu 2,9% em 2023, no primeiro ano do governo Lula."
            ),
        },
    ]

    print(f"\n  Sub-caso B — maioria REFUTES")
    print(f"  Alegacao: {alegacao_ref}")
    print(f"\n  Avaliando {len(fontes_agr_ref)} fontes...")

    agregado_b, res_b = _rodar_bateria_agregacao(alegacao_ref, fontes_agr_ref)
    for i, (fonte, res) in enumerate(zip(fontes_agr_ref, res_b), 1):
        print(f"\n    Fonte {i}: [{res['label']}  score={res['score']:.4f}]")
        print(f"             {fonte['snippet'][:80]}...")

    print(f"\n  Resultado agregado : {agregado_b['label']}  (score={agregado_b['score']:.4f})")
    print(f"  Votos              : {agregado_b['votos']}")
    esperado_b = "REFUTES"
    icone_b = _SIM if agregado_b["label"] == esperado_b else _NAO
    print(f"  Esperado           : {esperado_b}  {icone_b}")
    acerto_b = 1 if agregado_b["label"] == esperado_b else 0

    acertos_b3 = acerto_a + acerto_b

    # -----------------------------------------------------------------------
    # Resumo final
    # -----------------------------------------------------------------------
    _linha("Resumo final")

    total_acertos = acertos_b1 + acertos_b2 + acertos_b3
    total_casos = len(CASOS_PRINCIPAIS) + len(CASOS_BORDA) + 2

    print(f"\n  Bateria 1 (principais) : {acertos_b1}/{len(CASOS_PRINCIPAIS)}")
    print(f"  Bateria 2 (borda)      : {acertos_b2}/{len(CASOS_BORDA)}")
    print(f"  Bateria 3 (agregacao)  : {acertos_b3}/2")
    print(f"\n  Total: {total_acertos}/{total_casos} casos corretos")

    if total_acertos == total_casos:
        print(f"\n  {_OK} -- todos os casos passaram.")
    elif acertos_b1 == len(CASOS_PRINCIPAIS):
        print(f"\n  PARCIAL -- casos principais OK; verificar casos de borda/agregacao.")
    else:
        print(
            f"\n  {_FAIL} -- {total_casos - total_acertos} caso(s) divergiram do esperado."
            "\n  Verifique os resultados individuais acima para diagnostico."
        )

    print()


if __name__ == "__main__":
    main()
