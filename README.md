# CheckAI — Classificação de Conteúdos Políticos

**Repositório:** https://github.com/offandriola/ml-checkai

O **CheckAI** é um projeto acadêmico de TCC voltado à análise e classificação de conteúdos políticos, com foco inicial em identificar se uma afirmação, notícia curta ou manchete possui indícios de ser **verdadeira** ou **falsa**.

O projeto utiliza técnicas de **Machine Learning supervisionado**, com construção de uma base de dados própria a partir de fontes públicas e verificáveis. A proposta é desenvolver uma solução capaz de apoiar a verificação inicial de conteúdos políticos, principalmente em um contexto de alta circulação de desinformação.

---

## Objetivo do Projeto

O objetivo principal do CheckAI é construir uma base de dados e um modelo de classificação capaz de analisar conteúdos políticos e retornar uma classificação binária (MVP):

- **Verdadeiro**
- **Falso**

A ideia é que o sistema evolua para receber textos curtos, manchetes ou afirmações políticas e indique uma classificação com base nos padrões aprendidos durante o treinamento.

---

## Status Atual

Atualmente, o projeto está na fase de **coleta, organização e preparação dos dados**.

Até o momento, foram adicionadas pipelines para coleta de dados a partir de:

- **Google Fact Check Tools API**
- **API de Dados Abertos da Câmara dos Deputados**

Essas fontes estão sendo utilizadas para compor a base inicial do projeto, separando conteúdos verificados e conteúdos provenientes de fontes oficiais.

---

## Estrutura do Projeto

```text
ml-checkai/
│
├── dados/
│   ├── dataset_unificado/
│   ├── pipeline_falso_google_factcheck/
│   │   └── raw/
│   └── pipeline_verdadeiro_fontes_oficiais/
│       └── raw/
│
├── src/
│   ├── coleta_google_check.ipynb
│   └── coleta_camara_deputados.ipynb
│
├── .env.example
├── .gitignore
├── README.md
└── requirements.txt
```


---

## Fontes de Dados

### Google Fact Check Tools API

A API do Google Fact Check é utilizada para coletar afirmações que já foram analisadas por agências de checagem. Esses dados ajudam a compor a parte da base relacionada a conteúdos verificados como falsos, imprecisos ou enganosos, dependendo da classificação original da checagem.

Os dados coletados são armazenados em:

```text
dados/pipeline_falso_google_factcheck/raw/
```

### API da Câmara dos Deputados

A API de Dados Abertos da Câmara dos Deputados é utilizada para coletar proposições e informações oficiais relacionadas ao contexto político brasileiro.

Esses dados ajudam a compor a parte da base baseada em fontes oficiais, servindo como apoio para conteúdos considerados verdadeiros ou institucionalmente verificáveis.

Os dados coletados são armazenados em:

```text
dados/pipeline_verdadeiro_fontes_oficiais/raw/
```

---

## Tecnologias Utilizadas

O projeto utiliza atualmente:

- Python
- Pandas
- Requests
- Python Dotenv
- Jupyter Notebook
- Git e GitHub
- APIs públicas

Futuramente, o projeto poderá utilizar também:

- Scikit-learn
- TF-IDF
- Regressão Logística
- Métricas de avaliação como acurácia, precisão, recall e F1-score

---

## Como Executar o Projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/offandriola/ml-checkai.git
cd ml-checkai
```

---

## Configuração do Ambiente

A recomendação é utilizar um ambiente virtual para evitar conflito com bibliotecas instaladas em outros projetos.

### Windows

Criar o ambiente virtual:

```bash
python -m venv .venv
```

Ativar o ambiente virtual no PowerShell:

```bash
.\.venv\Scripts\Activate.ps1
```

Caso esteja usando Prompt de Comando:

```bash
.venv\Scripts\activate
```

Atualizar o `pip`:

```bash
python -m pip install --upgrade pip
```

Instalar as dependências:

```bash
pip install -r requirements.txt
```

### macOS

Criar o ambiente virtual:

```bash
python3 -m venv .venv
```

Ativar o ambiente virtual:

```bash
source .venv/bin/activate
```

Atualizar o `pip`:

```bash
python3 -m pip install --upgrade pip
```

Instalar as dependências:

```bash
pip install -r requirements.txt
```

> No macOS, dependendo da instalação do Python, pode ser necessário usar `python3` e `pip3` no lugar de `python` e `pip`.

---

## Executando os Notebooks

Após instalar as dependências, abra o projeto no VS Code ou execute o Jupyter Notebook pelo terminal:

```bash
jupyter notebook
```

Os notebooks principais ficam na pasta:

```text
src/
```

---

## Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com base no arquivo `.env.example`.

Exemplo:

```env
GOOGLE_FACTCHECK_API_KEY=SUA_CHAVE_AQUI
```

> Importante: o arquivo `.env` não deve ser enviado ao GitHub, pois contém informações sensíveis, como chaves de API.

---

## Organização dos Dados

Os dados são organizados em pipelines separadas para facilitar a rastreabilidade e a manutenção do projeto.

### Dados brutos

Os arquivos brutos são salvos na pasta `raw/` de cada pipeline. Eles representam os dados exatamente como foram coletados das fontes externas, sem grandes transformações.

Exemplo:

```text
dados/pipeline_falso_google_factcheck/raw/
dados/pipeline_verdadeiro_fontes_oficiais/raw/
```

### Dataset unificado

A pasta `dataset_unificado/` será utilizada para armazenar a base final consolidada, após limpeza, padronização e rotulagem dos dados.

```text
dados/dataset_unificado/
```

---

## Pipeline do Projeto

O fluxo planejado do projeto é:

```text
Coleta dos dados
        ↓
Armazenamento dos dados brutos
        ↓
Limpeza e padronização
        ↓
Rotulagem dos registros
        ↓
Criação do dataset unificado
        ↓
Treinamento do modelo
        ↓
Avaliação do modelo
        ↓
Uso do modelo para classificação
```

---

## Modelo de Machine Learning

O modelo será desenvolvido com aprendizado supervisionado. A ideia inicial é utilizar uma abordagem simples e eficiente para classificação de texto, como:

- Vetorização com TF-IDF
- Classificador com Regressão Logística
- Avaliação com métricas de classificação

Essa abordagem permite criar uma primeira versão funcional do modelo, servindo como base para comparações futuras com técnicas mais avançadas.

---

## Próximos Passos

Os próximos passos do projeto são:

- Padronizar os dados coletados das diferentes fontes
- Criar o dataset unificado
- Definir os rótulos finais da classificação
- Remover duplicidades e registros inválidos
- Criar o primeiro modelo supervisionado
- Avaliar o desempenho do modelo
- Documentar os resultados obtidos
- Preparar a explicação metodológica para o TCC

---

## Cuidados com Segurança

Este projeto utiliza APIs externas. Por isso, alguns cuidados são necessários:

- Não subir arquivos `.env` para o GitHub
- Não expor chaves de API no código
- Usar `.env.example` apenas como modelo
- Manter dados brutos separados dos dados tratados
- Documentar a origem de cada base utilizada

---

## Finalidade Acadêmica

O CheckAI é um projeto desenvolvido com finalidade acadêmica para o Trabalho de Conclusão de Curso. Seu objetivo é estudar e aplicar conceitos de coleta de dados, curadoria de dataset, aprendizado supervisionado e classificação de textos políticos.

O sistema não deve ser interpretado como uma ferramenta definitiva de checagem factual, mas como uma aplicação experimental voltada ao estudo de técnicas computacionais para apoio à identificação de desinformação política.
