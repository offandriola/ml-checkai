# CheckAI — Pipeline de Dados para Classificação de Conteúdos Políticos

**Repositório:** https://github.com/offandriola/ml-checkai

O **CheckAI** é um projeto acadêmico de TCC voltado à construção de uma base de dados e de um modelo de classificação supervisionada para análise de conteúdos políticos em português. O objetivo é apoiar a identificação inicial de afirmações, manchetes ou notícias curtas com possível caráter **verdadeiro** ou **falso**, a partir de dados coletados de fontes públicas, rastreáveis e verificáveis.

Nesta etapa, o projeto está focado na **coleta e organização dos dados brutos**. A curadoria, padronização dos rótulos e treinamento do modelo serão realizados em etapas posteriores.

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

O projeto está na fase de **ingestão de dados brutos (RAW)**.

Até o momento, foram estruturados três pipelines principais:

| Pipeline | Finalidade | Status |
|---|---|---|
| `pipeline_falso_google_factcheck` | Coletar afirmações checadas por fontes de fact-checking | Em desenvolvimento |
| `pipeline_verdadeiro_fontes_oficiais` | Coletar dados oficiais de órgãos públicos | Em desenvolvimento |
| `pipeline_noticias_reais` | Coletar notícias reais para capturar linguagem jornalística política | Em desenvolvimento |

A curadoria ainda não foi aplicada de forma definitiva. A lógica atual é primeiro ampliar e validar as fontes brutas para depois limpar, padronizar e unificar os dados.

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
│   └── coleta_rss_noticias_reais.ipynb
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
| Câmara dos Deputados | Implementada | Coleta proposições legislativas |
| Senado Federal | Implementada | Coleta matérias legislativas |
| TSE | Pendente | Portal em validação/manutenção no momento da implementação |

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
| BBC Brasil | Geral | Será filtrada por política na curadoria |
| G1 Política | Política | Feed segmentado em política |
| UOL Notícias | Geral | Será filtrada por política na curadoria |
| Poder360 | Política | Fonte jornalística com foco político |

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

Dados limpos e padronizados. Nessa etapa serão aplicados tratamentos como:

- limpeza de HTML
- padronização de datas
- remoção de duplicidades
- filtragem temática
- normalização de textos
- criação de colunas auxiliares

### `final`

Dados prontos para treinamento do modelo. Nessa etapa, os dados terão estrutura padronizada e rótulos definidos.

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

Ordem recomendada para executar a etapa atual de coleta:

```text
1. src/coleta_google_check.ipynb
2. src/coleta_fontes_oficiais.ipynb
3. src/coleta_rss_noticias_reais.ipynb
```

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

- Finalizar a validação das fontes oficiais do Pipeline 2
- Retomar a coleta do TSE quando o portal estiver disponível
- Criar notebooks de curadoria para cada pipeline
- Limpar HTML dos feeds RSS
- Filtrar notícias gerais por termos políticos
- Remover duplicidades
- Padronizar datas e nomes de fontes
- Criar colunas finais de treino
- Definir os rótulos finais
- Unificar os pipelines no `dataset_unificado`
- Treinar o primeiro modelo supervisionado
- Avaliar o modelo com métricas de classificação

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
