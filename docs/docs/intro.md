---
sidebar_position: 1
slug: /intro
---

# O que é o CheckAI?

O **CheckAI** é uma plataforma de verificação de fake news que combina **Machine Learning**, **busca web em tempo real** e **Natural Language Inference (NLI)** para analisar a veracidade de afirmações, manchetes e notícias em português brasileiro.

Este é um projeto acadêmico de **Trabalho de Conclusão de Curso (TCC)** da **UNICID**, focado em conteúdos políticos.

## O que o projeto faz?

Quando você envia um texto para o CheckAI, o seguinte acontece:

1. **Classificação por ML** — Um modelo de Machine Learning (TF-IDF + SVM) treinado com dados reais classifica o texto como **VERDADEIRO** ou **FALSO**
2. **Busca de fontes** — O sistema busca automaticamente fontes na web relacionadas ao texto via Serper.dev (API do Google)
3. **Ranking de fontes** — As fontes encontradas são classificadas por tipo (oficial, jornalística, fact-checking, etc.) e recebem um peso de confiabilidade
4. **Análise NLI** — Um modelo de Natural Language Inference (mDeBERTa) compara o texto original com cada fonte para verificar se as fontes confirmam, refutam ou são neutras
5. **Decisão final** — Um sistema de regras combina todos os sinais para produzir o veredito final: **REAL**, **FALSO** ou **INCONCLUSIVO**

## Componentes do projeto

O CheckAI é composto por **três módulos principais**:

| Módulo | Tecnologia | Descrição |
|--------|-----------|-----------|
| `fake-news-checker-front` | React + Vite + Tailwind | Interface do usuário (landing page, dashboard, histórico) |
| `fake-news-checker-back` | Python + FastAPI | API RESTful com toda a lógica de verificação |
| `fake-news-checker-model` | Jupyter + scikit-learn | Notebooks de coleta de dados e treinamento do modelo |

## Para quem é esta documentação?

Esta documentação foi escrita para que **qualquer pessoa** — mesmo sem experiência em programação — consiga:

- Entender o que o projeto faz e como funciona
- Instalar e rodar o projeto na sua máquina
- Explorar a API e os endpoints disponíveis
- Compreender como o modelo de ML foi treinado
- Executar os testes automatizados

## Próximos passos

- **[Guia de Instalação](./guia-instalacao)** — Configure e rode o projeto na sua máquina
- **[Arquitetura](./arquitetura/visao-geral)** — Entenda como os componentes se comunicam
- **[Modelo de ML](./modelo-ml/pipeline-dados)** — Saiba como os dados foram coletados e o modelo treinado
