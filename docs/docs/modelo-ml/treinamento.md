---
sidebar_position: 2
---

# Treinamento do Modelo

O modelo de Machine Learning do CheckAI é um classificador binário que recebe um texto e prevê se é **verdadeiro** ou **falso**.

## Pipeline de ML

O modelo utiliza um pipeline clássico de NLP:

```
Texto de entrada
      │
      ▼
┌──────────────┐
│   TF-IDF     │  Transforma texto em números
│              │  (vetorização)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    SVM       │  Classifica o vetor como
│  (LinearSVC) │  0 (falso) ou 1 (verdadeiro)
└──────┬───────┘
       │
       ▼
  FALSO ou VERDADEIRO
  + confiança (0.0 a 1.0)
```

### O que é TF-IDF?

**TF-IDF** (Term Frequency - Inverse Document Frequency) é uma técnica que converte texto em números. Para cada palavra no texto:

- **TF (Term Frequency)** — quantas vezes a palavra aparece nesse texto
- **IDF (Inverse Document Frequency)** — quão rara essa palavra é no conjunto total de textos

Palavras que aparecem em muitos textos (como "de", "que", "o") recebem peso baixo. Palavras mais específicas (como "rachadinha", "vacina") recebem peso alto.

### O que é SVM?

**SVM** (Support Vector Machine) é um algoritmo de classificação que encontra a melhor "linha divisória" entre textos verdadeiros e falsos no espaço de features. O **LinearSVC** é a versão linear e eficiente do SVM.

## Configuração do modelo

| Componente | Parâmetro | Valor | Explicação |
|-----------|-----------|-------|------------|
| TF-IDF | `max_features` | 5.000 | Considera apenas as 5.000 palavras mais relevantes |
| TF-IDF | `ngram_range` | (1, 2) | Analisa palavras isoladas e pares de palavras |
| TF-IDF | `sublinear_tf` | True | Aplica log na frequência (reduz peso de repetições) |
| TF-IDF | `min_df` | 2 | Ignora palavras que aparecem em menos de 2 textos |
| TF-IDF | `max_df` | 0.9 | Ignora palavras que aparecem em mais de 90% dos textos |
| SVM | `class_weight` | balanced | Ajusta pesos para lidar com desbalanceamento |

## Dataset de treino

O modelo atual (v4) foi treinado com dados balanceados:

| Classe | Quantidade | Origem |
|--------|-----------|--------|
| `label=0` (falso) | ~254+ | Claims do Google Fact Check (verificados como falsos/enganosos por agências) |
| `label=1` (verdadeiro) | ~254+ | Notícias reais (RSS) + Claims verificados como verdadeiros |

**Split:** 80% treino / 20% teste, com estratificação por label.

## Métricas do modelo

O modelo v4 (SVM) apresentou os seguintes resultados:

| Métrica | Valor | Significado |
|---------|-------|-------------|
| **Acurácia** | ~90% | De cada 100 textos, acerta ~90 |
| **ROC-AUC** | ~97% | Excelente capacidade de distinguir classes |
| **Precisão** (verdadeiro) | ~93% | Quando diz "verdadeiro", acerta 93% das vezes |
| **Recall** (verdadeiro) | ~86% | Encontra 86% dos textos verdadeiros |

:::info[O que significam essas métricas?]

- **Acurácia**: percentual total de acertos
- **Precisão**: de todos que o modelo disse ser X, quantos realmente são X
- **Recall**: de todos que realmente são X, quantos o modelo encontrou
- **ROC-AUC**: capacidade geral de separação entre as classes (1.0 = perfeito)

:::
## Evolução dos modelos

O projeto treinou múltiplas versões para comparação:

| Versão | Algoritmo | Acurácia | ROC-AUC | Observação |
|--------|-----------|----------|---------|------------|
| v1 | LogReg | 86.2% | 93.6% | Baseline inicial, dataset pequeno |
| v2 balanced | LogReg | 90.2% | 97.1% | Dataset balanceado expandido |
| v2 size_matched | LogReg | 86.7% | 96.4% | Ablação: controle de tamanho de texto |
| v3 balanced | LogReg | ~90% | ~97% | Comparativo com NB e SVM |
| v3 balanced | NB | ~87% | ~94% | Naive Bayes (mais simples) |
| v3 balanced | SVM | ~91% | ~97% | SVM (melhor performance geral) |
| **v4 balanced** | **SVM** | **~91%** | **~97%** | **Modelo atual em produção** |

O **SVM** foi escolhido como modelo final por apresentar as melhores métricas consistentemente.

## Arquivos do modelo

Os modelos treinados ficam em `fake-news-checker-model/modelos/`:

```
modelos/
├── baseline_tfidf_svm_v4_balanced_2026-05-30_23-44-02.joblib      ← MODELO ATIVO
├── baseline_tfidf_svm_v4_balanced_2026-05-30_23-44-02_meta.json   ← Metadados
├── baseline_tfidf_logreg_v3_balanced_*.joblib                     ← LogReg v3
├── baseline_tfidf_nb_v3_balanced_*.joblib                         ← NaiveBayes v3
└── ... (versões anteriores)
```

O arquivo `_meta.json` contém metadados completos: métricas, hiperparâmetros, data de treino e composição do dataset.

## Como retreinar o modelo

1. Acesse o Jupyter Lab em `http://localhost:8888`
2. Abra o notebook `src/treino_baseline_v4_comparativo.ipynb`
3. Execute todas as células
4. O novo modelo será salvo em `modelos/`
5. Atualize o nome do modelo em `fake-news-checker-back/config.py` (variável `_NOME_MODELO`)
6. Reinicie o backend: `make restart backend`

## Modo Mock

Se o arquivo do modelo não for encontrado no disco, o backend ativa o **modo mock**: gera uma classificação determinística (baseada em hash SHA-256 do texto). Isso é útil para desenvolvimento do frontend sem depender do modelo, mas os resultados **não são confiáveis** — são apenas para teste.
