# CheckAI — Pipeline de Dados para Classificação de Conteúdos Políticos

**Repositório:** https://github.com/offandriola/ml-checkai

O **CheckAI** é um projeto acadêmico de TCC voltado à construção de uma base de dados e de um modelo de classificação supervisionada para análise de conteúdos políticos em português. O objetivo é apoiar a identificação inicial de afirmações, manchetes ou notícias curtas com possível caráter **verdadeiro** ou **falso**, a partir de dados coletados de fontes públicas, rastreáveis e verificáveis.

O projeto já concluiu as etapas de coleta, curadoria e montagem do primeiro dataset de treino. A próxima etapa é o treinamento e avaliação do modelo supervisionado.

---

## Objetivo do Projeto

O objetivo principal é construir um dataset próprio, confiável e rastreável para treinar um modelo de Machine Learning supervisionado voltado à classificação de conteúdos políticos.

A proposta inicial considera uma classificação binária:

- **VERDADEIRO**
- **FALSO**

Além disso, o projeto mantém a possibilidade de evoluir para uma abordagem em dois níveis, com um rótulo complementar para classificar subtipos de falsidade, como:

- `FALSO_DIRETO`
- `ENGANOSO`
- `FORA_DE_CONTEXTO`

---

## Status Atual

O projeto concluiu as fases de **coleta**, **curadoria** e **montagem do primeiro dataset de treino**.

| Pipeline | Finalidade | Coleta | Curadoria |
|---|---|---|---|
| `pipeline_falso_google_factcheck` | Afirmações checadas por fact-checkers | ✅ Concluída | ✅ Concluída |
| `pipeline_verdadeiro_fontes_oficiais` | Dados oficiais de órgãos públicos | ✅ Concluída | ✅ Concluída |
| `pipeline_noticias_reais` | Notícias reais de portais jornalísticos | ✅ Concluída | ✅ Concluída |

O primeiro dataset de treino (`dataset_final_treino_v1.csv`) foi montado e está disponível em `dados/dataset_unificado/final/`. A próxima etapa é o treinamento e avaliação do modelo baseline.

---

## Estrutura do Projeto

```text
ml-checkai/
│
├── dados/
│   ├── dataset_unificado/
│   │   ├── curated/
│   │   └── final/
│   │
│   ├── pipeline_falso_google_factcheck/
│   │   ├── raw/
│   │   ├── curated/
│   │   └── final/
│   │
│   ├── pipeline_verdadeiro_fontes_oficiais/
│   │   ├── raw/
│   │   ├── curated/
│   │   └── final/
│   │
│   └── pipeline_noticias_reais/
│       ├── raw/
│       ├── curated/
│       └── final/
│
├── src/
│   ├── coleta_google_check.ipynb
│   ├── coleta_fontes_oficiais.ipynb
│   ├── coleta_rss_noticias_reais.ipynb
│   ├── curadoria_google_factcheck.ipynb
│   ├── curadoria_fontes_oficiais.ipynb
│   ├── curadoria_rss_noticias_reais.ipynb
│   └── montagem_dataset_final_v1.ipynb
│
├── .env.example
├── .gitignore
├── README.md
└── requirements.txt
```

---

## Visão Geral dos Pipelines

### 1. Pipeline de falsas/checadas

**Pasta:**

```text
dados/pipeline_falso_google_factcheck/
```

**Notebook:**

```text
src/coleta_google_check.ipynb
```

Esse pipeline utiliza a **Google Fact Check Tools API** para coletar afirmações já verificadas por organizações de checagem. Ele é usado principalmente para montar a base bruta de conteúdos falsos, enganosos, imprecisos ou distorcidos.

A coleta atual utiliza termos políticos como:

- urnas eletrônicas
- fraude nas urnas
- TSE
- eleições 2022
- eleições 2026
- voto impresso
- Lula
- Bolsonaro
- Alexandre de Moraes
- INSS
- Pix imposto
- anistia Bolsonaro
- STF redes sociais
- Congresso Nacional

Os dados brutos são salvos em:

```text
dados/pipeline_falso_google_factcheck/raw/
```

Campos coletados incluem:

- termo de busca
- texto da afirmação
- data da claim
- fonte da checagem
- URL da checagem
- avaliação original
- data da publicação
- URL da consulta
- data da coleta

---

### 2. Pipeline de verdadeiras por fontes oficiais

**Pasta:**

```text
dados/pipeline_verdadeiro_fontes_oficiais/
```

**Notebook:**

```text
src/coleta_fontes_oficiais.ipynb
```

Esse pipeline coleta dados diretamente de fontes oficiais, com foco em fatos institucionais verificáveis.

Fontes implementadas até o momento:

| Fonte | Situação | Observação |
|---|---|---|
| Câmara dos Deputados | ✅ Implementada | Proposições legislativas |
| Senado Federal | ✅ Implementada | Matérias legislativas |
| TSE | ✅ Implementada | Candidatos 2024 (dados eleitorais) |
| Portal da Transparência | ✅ Implementada | Emendas parlamentares, contratos e despesas públicas |
| STF | ✅ Implementada | Notícias oficiais |

Os dados brutos são salvos em:

```text
dados/pipeline_verdadeiro_fontes_oficiais/raw/
```

A Câmara e o Senado geram arquivos brutos separados, pois possuem estruturas de dados diferentes. A unificação será feita posteriormente na etapa de curadoria.

---

### 3. Pipeline de notícias reais

**Pasta:**

```text
dados/pipeline_noticias_reais/
```

**Notebook:**

```text
src/coleta_rss_noticias_reais.ipynb
```

Esse pipeline coleta notícias de portais jornalísticos por meio de feeds RSS. O objetivo principal não é definir se uma notícia é verdadeira ou falsa de forma imediata, mas capturar **linguagem jornalística política real**, contexto e vocabulário natural usado em notícias brasileiras.

Fontes configuradas até o momento:

| Portal | Categoria | Observação |
|---|---|---|
| Agência Brasil | Política | Fonte pública e institucional |
| BBC Brasil | Geral | Filtrada por termos políticos na curadoria |
| G1 Política | Política | Feed segmentado em política |
| UOL Notícias | Geral | Filtrada por termos políticos na curadoria |
| Poder360 | Política | Fonte jornalística com foco político |
| Folha de S.Paulo (Poder) | Política | Editoria de política |
| Correio Braziliense | Política | Cobertura política nacional |
| Veja Política | Política | Editoria de política |
| Metrópoles | Política | Cobertura política nacional |
| CartaCapital | Política | Cobertura política nacional |
| Congresso em Foco | Política | Cobertura do Congresso Nacional |

Os dados brutos são salvos em:

```text
dados/pipeline_noticias_reais/raw/
```

Campos coletados incluem:

- portal
- categoria
- título
- link
- resumo
- data de publicação
- URL do feed
- data da coleta

---

## Conceito de Camadas dos Dados

O projeto usa uma organização em três camadas:

```text
raw → curated → final
```

### `raw`

Dados brutos, exatamente como foram coletados das APIs, feeds RSS ou fontes externas. Essa camada preserva o histórico da coleta.

### `curated`

Dados limpos e padronizados. Os notebooks de curadoria aplicam:

- remoção de HTML
- padronização de datas para `YYYY-MM-DD`
- remoção de duplicatas
- filtragem temática (ex.: notícias gerais filtradas por termos políticos)
- normalização de textos e nomes de fontes
- mapeamento de avaliações para categorias padronizadas (`FALSO`, `ENGANOSO`, `VERDADEIRO`, etc.)
- criação de colunas auxiliares (`flag_texto_longo`, `origem_texto`, `avaliacao_categoria`, etc.)

Cada execução gera um arquivo com timestamp no nome, preservando o histórico de curadorias.

### `final`

Dataset consolidado, com schema uniforme e rótulos definitivos, pronto para treinamento supervisionado.

---

## Dataset Final de Treino v1

**Caminho:** `dados/dataset_unificado/final/dataset_final_treino_v1.csv`

**Notebook de montagem:** `src/montagem_dataset_final_v1.ipynb`

### Composição

| Atributo | Valor |
|---|---|
| Total de registros | 800 |
| Positivos (label = 1) | 400 |
| Negativos (label = 0) | 400 |
| Seed de amostragem | 42 |
| Faixa de tamanho dos textos | 50–400 caracteres |

### Distribuição por `label_detalhe`

| Rótulo | Classe | Qtd |
|---|---|---|
| `NOTICIA_REAL` | Positivo | 374 |
| `GFC_VERDADEIRO` | Positivo | 26 |
| `FALSO` | Negativo | 260 |
| `ENGANOSO` | Negativo | 120 |
| `FORA_DE_CONTEXTO` | Negativo | 20 |

Os 26 registros `GFC_VERDADEIRO` são claims verificados como verdadeiros pelo Google Fact Check — mesma fonte e formato dos registros falsos, o que reduz o risco de o modelo aprender o estilo da fonte em vez da veracidade.

### Schema

| Coluna | Descrição |
|---|---|
| `id_registro` | UUID único herdado do pipeline de origem |
| `texto_principal` | Texto da afirmação ou manchete (50–400 chars) |
| `label` | `1` = positivo/real, `0` = negativo/falso |
| `label_detalhe` | Categoria específica (NOTICIA_REAL, GFC_VERDADEIRO, FALSO, ENGANOSO, FORA_DE_CONTEXTO) |
| `pipeline_origem` | Pipeline de origem (`google_factcheck` ou `noticias_reais`) |
| `portal_origem` | Fonte/portal do registro (ex.: `AOS_FATOS`, `G1_POLITICA`) |
| `origem_texto` | Como o texto foi construído (`titulo`, `titulo_resumo`, `afirmacao_checada`) |
| `tamanho_chars` | Comprimento em caracteres do `texto_principal` |
| `data_publicacao` | Data de publicação original (YYYY-MM-DD, pode ser vazio) |
| `url_origem` | URL rastreável da origem |

### Sobre as Fontes Oficiais nesta versão

O pipeline de fontes oficiais coletou e curou **10.595 registros** de Câmara, Senado, STF, TSE e Portal da Transparência. Esse material **não foi incluído no dataset v1 de treino** por uma decisão metodológica deliberada:

os textos de contratos públicos, emendas parlamentares, despesas orçamentárias e fichas de candidatos eleitorais têm estrutura gramatical muito distinta de claims políticos e manchetes jornalísticas. Incluí-los na classe positiva introduziria um forte viés de formato — o modelo aprenderia a distinguir tipos de documento em vez de aprender a distinguir veracidade.

Esses dados permanecerão disponíveis como **base de evidência e referência** para versões futuras do sistema, especialmente para enriquecer contexto factual na verificação de afirmações.

---

## Padrão de Salvamento dos Arquivos Brutos

Cada execução de coleta salva um novo CSV com data e hora no nome do arquivo.

Exemplo:

```text
google_factcheck_raw_2026-05-10_02-42-39.csv
rss_noticias_reais_raw_2026-05-10_01-58-57.csv
senado_materias_raw_2026-05-10_02-28-13.csv
```

Esse padrão evita sobrescrever coletas antigas e melhora a rastreabilidade do dataset.

---

## Tecnologias Utilizadas

O projeto utiliza atualmente:

- Python
- Pandas
- Requests
- Feedparser
- Python Dotenv
- Jupyter Notebook
- Git e GitHub
- APIs públicas
- Feeds RSS

Futuramente, o projeto poderá utilizar:

- Scikit-learn
- TF-IDF
- Regressão Logística
- LinearSVC
- Métricas como acurácia, precisão, recall e F1-score

---

## Configuração do Ambiente

É recomendado utilizar um ambiente virtual.

### Windows

```bash
python -m venv .venv
```

Ativar no PowerShell:

```bash
.\.venv\Scripts\Activate.ps1
```

Ou no Prompt de Comando:

```bash
.venv\Scripts\activate
```

Atualizar o `pip`:

```bash
python -m pip install --upgrade pip
```

Instalar dependências:

```bash
pip install -r requirements.txt
```

### macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install --upgrade pip
pip install -r requirements.txt
```

> No macOS, dependendo da instalação do Python, pode ser necessário usar `python3` e `pip3` no lugar de `python` e `pip`.

---

## Configuração da Chave da Google Fact Check Tools API

O pipeline do Google Fact Check precisa de uma chave de API.

Crie um arquivo chamado:

```text
google-factcheck-api-key.env
```

Na raiz do projeto, com o seguinte conteúdo:

```env
GOOGLE_FACTCHECK_API_KEY=SUA_CHAVE_AQUI
```

O arquivo `.env.example` serve apenas como modelo:

```env
GOOGLE_FACTCHECK_API_KEY=COLE_SUA_CHAVE_AQUI
```

> Nunca envie o arquivo `google-factcheck-api-key.env` para o GitHub.

---

## Como Executar os Notebooks

Após instalar as dependências, abra o projeto no VS Code ou execute:

```bash
jupyter notebook
```

Os notebooks ficam em:

```text
src/
```

Ordem recomendada de execução completa do pipeline:

```text
── Coleta ──────────────────────────────────────────────────
1. src/coleta_google_check.ipynb
2. src/coleta_fontes_oficiais.ipynb
3. src/coleta_rss_noticias_reais.ipynb

── Curadoria ───────────────────────────────────────────────
4. src/curadoria_google_factcheck.ipynb
5. src/curadoria_fontes_oficiais.ipynb
6. src/curadoria_rss_noticias_reais.ipynb

── Montagem do dataset ─────────────────────────────────────
7. src/montagem_dataset_final_v1.ipynb
```

Os notebooks de curadoria sempre usam o arquivo raw mais recente de cada pipeline. O notebook de montagem sempre usa o arquivo curated mais recente de cada pipeline.

---

## Metodologia de Confiabilidade do Dataset

A confiabilidade do dataset será construída a partir de quatro princípios:

1. **Fonte rastreável**: cada registro deve manter URL, origem ou endpoint de coleta.
2. **Separação por origem**: dados de fact-checking, dados oficiais e notícias reais ficam em pipelines diferentes.
3. **Preservação do dado bruto**: cada coleta gera um arquivo bruto novo, sem sobrescrever coletas anteriores.
4. **Curadoria posterior**: os registros só serão considerados prontos após limpeza, padronização e revisão.

Essa estratégia evita depender de dados gerados artificialmente e permite justificar academicamente a origem dos registros usados no treinamento.

---

## Fluxo Planejado do Projeto

```text
Coleta dos dados brutos
        ↓
Armazenamento em raw/
        ↓
Validação das fontes
        ↓
Limpeza e padronização
        ↓
Criação das camadas curated/
        ↓
Geração do dataset final
        ↓
Treinamento do modelo supervisionado
        ↓
Avaliação do desempenho
        ↓
Uso do modelo para classificação
```

---

## Próximos Passos

- Treinar o modelo baseline com TF-IDF + Regressão Logística
- Avaliar o baseline com acurácia, precisão, recall, F1-score e matriz de confusão
- Expandir a base positiva com mais notícias reais curtas de fontes diversas
- Buscar mais claims verificados como verdadeiros em fontes de fact-checking (aumentar os 26 atuais)
- Montar o `dataset_final_treino_v2` com maior volume e melhor equilíbrio de distribuição de tamanhos
- Investigar uso das Fontes Oficiais como base de evidência/referência em versões futuras

---

## Cuidados de Segurança

Este projeto utiliza chaves de API e dados externos. Portanto:

- Não envie arquivos `.env` ao GitHub
- Não exponha chaves de API em notebooks, scripts ou commits
- Use `.env.example` apenas como modelo
- Restrinja a chave da Google API para a Fact Check Tools API quando possível
- Revogue e gere uma nova chave caso ela seja exposta acidentalmente
- Evite versionar grandes volumes de dados brutos se isso dificultar o repositório

---

## Finalidade Acadêmica

O CheckAI é um projeto desenvolvido com finalidade acadêmica para o Trabalho de Conclusão de Curso. O sistema não deve ser interpretado como uma ferramenta definitiva de checagem factual, mas como uma aplicação experimental para estudar coleta de dados, curadoria de dataset, aprendizado supervisionado e classificação de textos políticos em português.
