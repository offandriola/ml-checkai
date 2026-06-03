---
sidebar_position: 1
---

# Pipeline de Dados

O modelo de ML do CheckAI precisa de dados rotulados (textos marcados como verdadeiros ou falsos) para aprender a classificar. Este capítulo explica como esses dados foram coletados, limpos e organizados.

## Visão geral dos pipelines

Os dados vêm de **três fontes** diferentes, cada uma em seu próprio pipeline:

```
Pipeline 1: Google Fact Check     → Textos FALSOS/ENGANOSOS
Pipeline 2: Fontes Oficiais       → Textos VERDADEIROS (gov.br, Câmara, Senado)
Pipeline 3: Notícias Reais (RSS)  → Textos VERDADEIROS (portais jornalísticos)
         │
         ▼
    Dataset Unificado (balanceado 1:1)
```

### Pipeline 1 — Google Fact Check (textos falsos)

**O que é:** A API do Google Fact Check reúne verificações feitas por agências profissionais (Aos Fatos, Lupa, Estadão Verifica, etc.). Cada verificação contém a afirmação original e o veredito da agência.

**Como funciona:**
1. O notebook `coleta_google_check.ipynb` consulta a API do Google com termos políticos brasileiros
2. Cada resultado contém: a afirmação (claim), o veredito do fact-checker e a URL da verificação
3. O notebook `curadoria_google_factcheck.ipynb` filtra e limpa os dados

**Rótulos coletados:** FALSO, ENGANOSO, FORA_DE_CONTEXTO → todos mapeados para `label=0` (fake)

### Pipeline 2 — Fontes Oficiais (textos verdadeiros)

**O que é:** Textos de sites governamentais que são, por definição, fontes primárias.

**Fontes:**
- Câmara dos Deputados (proposições legislativas)
- Senado Federal (matérias)
- Agência Brasil (EBC)
- Portais gov.br

**Rótulo:** `label=1` (verdadeiro)

### Pipeline 3 — Notícias Reais via RSS (textos verdadeiros)

**O que é:** Notícias publicadas em grandes portais jornalísticos, coletadas via feeds RSS.

**Fontes:** G1, Folha, UOL, Estadão, CNN Brasil, entre outros.

**Por que usar notícias como "verdadeiras"?** O objetivo é que o modelo aprenda a distinguir o estilo de linguagem de notícias legítimas do estilo de fake news/claims enganosos. Notícias de portais jornalísticos sérios passam por processo editorial e são, na grande maioria, factualmente corretas.

**Rótulo:** `label=1` (verdadeiro), classificado como `ROTULO_ASSUMIDO` (premissa, não verificação direta)

## Organização dos dados

Cada pipeline segue a mesma estrutura de diretórios com três camadas:

```
dados/
├── pipeline_falso_google_factcheck/
│   ├── raw/        ← Dados brutos, como coletados
│   ├── curated/    ← Dados limpos e normalizados
│   └── final/      ← Dados prontos para treino
│
├── pipeline_verdadeiro_fontes_oficiais/
│   ├── raw/
│   ├── curated/
│   └── final/
│
├── pipeline_noticias_reais/
│   ├── raw/
│   ├── curated/
│   └── final/
│
└── dataset_unificado/
    ├── curated/    ← Dataset combinado
    └── final/      ← Dataset balanceado para treino
```

**Camada `raw`** — Dados exatamente como vieram da fonte. Não são modificados.

**Camada `curated`** — Dados após limpeza: remoção de duplicatas, normalização de texto, validação de campos.

**Camada `final`** — Dados prontos para treino, com schema unificado e balanceamento de classes.

## Notebooks de coleta

Os notebooks ficam em `fake-news-checker-model/src/`:

| Notebook | Descrição |
|----------|-----------|
| `coleta_google_check.ipynb` | Coleta da API Google Fact Check |
| `curadoria_google_factcheck.ipynb` | Limpeza dos dados do Google FC |
| `coleta_fontes_oficiais.ipynb` | Coleta de Câmara, Senado, gov.br |
| `curadoria_fontes_oficiais.ipynb` | Limpeza das fontes oficiais |
| `coleta_rss_noticias_reais.ipynb` | Coleta de notícias via RSS |
| `curadoria_rss_noticias_reais.ipynb` | Limpeza das notícias |
| `montagem_dataset_final_v4.ipynb` | Monta o dataset unificado final |
| `verificacao_overlap_crossdataset.ipynb` | Verifica se há duplicatas entre pipelines |

## Coleta via API (em tempo real)

Além dos notebooks, o backend também tem endpoints para executar coletas programaticamente:

- `POST /api/v1/coleta/google-factcheck` — executa o pipeline 1
- `POST /api/v1/coleta/fontes-oficiais` — executa o pipeline 2
- `POST /api/v1/coleta/noticias-reais` — executa o pipeline 3
- `POST /api/v1/coleta/todas` — executa todos os pipelines

Esses endpoints salvam os CSVs na camada `raw/` correspondente.
