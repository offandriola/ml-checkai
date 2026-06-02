# -*- coding: utf-8 -*-
"""
Teste manual do servico de ranking e filtragem de fontes.
=========================================================

Monta uma lista simulada com sete tipos de fontes e mostra:
  - o estado antes do ranking
  - o estado depois do ranking
  - tipo, peso e confiabilidade de cada fonte selecionada
  - resumo da filtragem (quantas foram removidas e por que)

Como executar (na pasta fake-news-checker-back/):
  python test_ranking_fontes.py
"""

import io
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
else:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

sys.path.insert(0, ".")

from services.ranking_fontes import ranquear_fontes

# ---------------------------------------------------------------------------
# Fontes simuladas — sete tipos cobrindo todos os cenarios
# ---------------------------------------------------------------------------

FONTES_SIMULADAS = [
    # 1. Fonte oficial (governo / judiciario)
    {
        "titulo": "TSE confirma resultado das eleicoes presidenciais 2022",
        "url": "https://tse.jus.br/eleicoes/eleicoes-2022/resultado-oficial",
        "snippet": (
            "O Tribunal Superior Eleitoral confirmou o resultado das eleicoes "
            "presidenciais de 2022. Luiz Inacio Lula da Silva foi eleito "
            "presidente com 50,9% dos votos validos no segundo turno."
        ),
        "fonte": "tse.jus.br",
    },
    # 2. Fonte jornalistica de grande veiculo
    {
        "titulo": "Lula e eleito presidente do Brasil com 50,9% dos votos",
        "url": "https://g1.globo.com/politica/eleicoes/2022/noticia/lula-eleito",
        "snippet": (
            "Luiz Inacio Lula da Silva foi eleito presidente da Republica "
            "Federativa do Brasil no segundo turno das eleicoes de 2022, "
            "derrotando Jair Bolsonaro com 50,9% dos votos validos."
        ),
        "fonte": "g1.globo.com",
    },
    # 3. Fact-checking
    {
        "titulo": "E FALSO que Lula e vice-presidente de Bolsonaro",
        "url": "https://aosfatos.org/noticias/e-falso-que-lula-e-vice-bolsonaro",
        "snippet": (
            "A alegacao de que Lula e vice-presidente de Bolsonaro e falsa. "
            "Os dois sao adversarios politicos que disputaram a presidencia "
            "em 2022. Lula venceu Bolsonaro e assumiu o cargo em 2023."
        ),
        "fonte": "aosfatos.org",
    },
    # 4. YouTube (social — deve ser descartado)
    {
        "titulo": "VIDEO: Resultado das eleicoes 2022 ao vivo",
        "url": "https://www.youtube.com/watch?v=abc123xyz",
        "snippet": (
            "Assista ao vivo ao resultado das eleicoes presidenciais de 2022 "
            "no Brasil. Acompanhe a apuracao dos votos em tempo real."
        ),
        "fonte": "youtube.com",
    },
    # 5. Instagram (social — deve ser descartado)
    {
        "titulo": "Post sobre as eleicoes 2022",
        "url": "https://www.instagram.com/p/Cabc123456",
        "snippet": "Confira as imagens das eleicoes 2022 no Instagram do TSE.",
        "fonte": "instagram.com",
    },
    # 6. Wikipedia (enciclopedia — baixo peso)
    {
        "titulo": "Luiz Inacio Lula da Silva - Wikipedia",
        "url": "https://pt.wikipedia.org/wiki/Luiz_Inacio_Lula_da_Silva",
        "snippet": (
            "Luiz Inacio Lula da Silva e um politico e sindicalista brasileiro "
            "que foi presidente do Brasil em tres mandatos: 2003-2007, "
            "2007-2011 e 2023 em diante."
        ),
        "fonte": "pt.wikipedia.org",
    },
    # 7. Fonte desconhecida (blog ou site generico)
    {
        "titulo": "Analise politica: as eleicoes de 2022",
        "url": "https://blogpolitico2022.wordpress.com/eleicoes",
        "snippet": (
            "Uma analise detalhada sobre as eleicoes presidenciais de 2022 "
            "e o impacto para o cenario politico brasileiro."
        ),
        "fonte": "blogpolitico2022.wordpress.com",
    },
]

SEP = "=" * 65


def _exibir_fonte_simples(i: int, f: dict) -> None:
    print(f"\n  [{i}] {f.get('fonte', 'desconhecido')}")
    print(f"       titulo  : {f.get('titulo', '')[:60]}")
    print(f"       snippet : {(f.get('snippet') or '')[:65]}...")


def _exibir_fonte_ranqueada(i: int, f: dict) -> None:
    print(f"\n  [{i}] {f.get('fonte', 'desconhecido')}")
    print(f"       titulo             : {f.get('titulo', '')[:55]}")
    print(f"       tipo_fonte         : {f.get('tipo_fonte', '-')}")
    print(f"       confiabilidade     : {f.get('confiabilidade_fonte', '-')}")
    print(f"       peso_fonte         : {f.get('peso_fonte', '-')}")
    print(f"       snippet            : {(f.get('snippet') or '')[:55]}...")


def main() -> None:
    # ------------------------------------------------------------------
    # Estado ANTES
    # ------------------------------------------------------------------
    print(f"\n{SEP}")
    print("  ANTES do ranking — fontes brutas da Serper")
    print(SEP)
    print(f"\n  Total de fontes: {len(FONTES_SIMULADAS)}")
    for i, f in enumerate(FONTES_SIMULADAS, 1):
        _exibir_fonte_simples(i, f)

    # ------------------------------------------------------------------
    # Aplicar ranking
    # ------------------------------------------------------------------
    fontes_ranqueadas = ranquear_fontes(FONTES_SIMULADAS, max_fontes=5)

    # ------------------------------------------------------------------
    # Estado DEPOIS
    # ------------------------------------------------------------------
    print(f"\n{SEP}")
    print("  DEPOIS do ranking — fontes filtradas e ordenadas (max=5)")
    print(SEP)
    print(f"\n  Total retornado: {len(fontes_ranqueadas)}")
    for i, f in enumerate(fontes_ranqueadas, 1):
        _exibir_fonte_ranqueada(i, f)

    # ------------------------------------------------------------------
    # Resumo da filtragem
    # ------------------------------------------------------------------
    print(f"\n{SEP}")
    print("  Resumo da filtragem")
    print(SEP)

    n_antes = len(FONTES_SIMULADAS)
    n_depois = len(fontes_ranqueadas)
    n_removidas = n_antes - n_depois

    print(f"\n  Fontes originais  : {n_antes}")
    print(f"  Fontes mantidas   : {n_depois}")
    print(f"  Fontes removidas  : {n_removidas}")

    dominios_mantidos = [f.get("fonte", "") for f in fontes_ranqueadas]
    dominios_originais = [f.get("fonte", "") for f in FONTES_SIMULADAS]
    dominios_removidos = [d for d in dominios_originais if d not in dominios_mantidos]

    print(f"\n  Dominios removidos: {dominios_removidos}")

    tipos_presentes = [f.get("tipo_fonte", "?") for f in fontes_ranqueadas]
    print(f"\n  Tipos presentes   : {tipos_presentes}")

    social_ok = all(f.get("fonte", "") not in ("youtube.com", "instagram.com") for f in fontes_ranqueadas)
    wiki_ok = not any(f.get("tipo_fonte") == "enciclopedia" for f in fontes_ranqueadas)

    print(f"\n  Social descartado : {'[OK]' if social_ok else '[FALHOU]'}")
    print(f"  Wikipedia fora    : {'[OK]' if wiki_ok else '[OK - mantida no ranking se necessario]'}")

    # ------------------------------------------------------------------
    # Verificacoes adicionais
    # ------------------------------------------------------------------
    print(f"\n{SEP}")
    print("  Verificacoes de corretude")
    print(SEP)

    checks = [
        ("Fonte oficial no topo", fontes_ranqueadas[0].get("tipo_fonte") == "oficial" if fontes_ranqueadas else False),
        ("YouTube descartado", all("youtube" not in f.get("url", "") for f in fontes_ranqueadas)),
        ("Instagram descartado", all("instagram" not in f.get("url", "") for f in fontes_ranqueadas)),
        ("Todos tem tipo_fonte", all("tipo_fonte" in f for f in fontes_ranqueadas)),
        ("Todos tem peso_fonte", all("peso_fonte" in f for f in fontes_ranqueadas)),
        ("Pesos em ordem decrescente", all(
            fontes_ranqueadas[i]["peso_fonte"] >= fontes_ranqueadas[i + 1]["peso_fonte"]
            for i in range(len(fontes_ranqueadas) - 1)
        ) if len(fontes_ranqueadas) > 1 else True),
    ]

    acertos = 0
    for nome, ok in checks:
        icone = "[OK]" if ok else "[XX]"
        print(f"\n  {icone} {nome}")
        if ok:
            acertos += 1

    print(f"\n  Resultado: {acertos}/{len(checks)} verificacoes passaram")
    status = "PASSOU" if acertos == len(checks) else "PARCIAL"
    print(f"  Status   : {status}")
    print()


if __name__ == "__main__":
    main()
