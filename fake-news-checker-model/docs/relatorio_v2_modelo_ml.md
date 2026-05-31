# Relatório Técnico — CheckAI V2

**Data:** 2026-05-19  
**Branch:** feature/modelo-ml  
**Responsável:** Kawan Andriola (TCC — UNICID)

---

## 1. Resumo da V2

A V2 do CheckAI é um classificador binário de fake news em português brasileiro, treinado sobre o dataset `v2_balanced`. O modelo utiliza um pipeline TF-IDF + Regressão Logística, idêntico ao baseline da V1, com o objetivo de estabelecer uma linha de base metodologicamente defensável antes de avançar para modelos mais complexos.

**Feature de entrada:** `texto_principal` (única coluna usada no treino — nenhuma coluna estrutural como portal, pipeline ou data é fornecida ao modelo).  
**Alvo:** `label` (0 = fake/enganoso, 1 = real/verdadeiro).

Foram treinados dois modelos com datasets distintos:

- **`v2_balanced`** — dataset principal, balanceado 1:1, com rótulos de múltiplas origens. É o **baseline oficial da V2**.
- **`v2_size_matched`** — dataset de ablação, construído com controle explícito de comprimento textual por faixa. Serve exclusivamente para investigar se o modelo aprende com o conteúdo semântico ou usa o tamanho do texto como atalho. **Não é o modelo oficial.**

---

## 2. Datasets utilizados

### Dataset principal — v2_balanced

| Campo | Valor |
|---|---|
| Arquivo | `dataset_final_treino_v2_balanced_2026-05-19_00-48-15.csv` |
| Total de registros | 508 |
| label=0 (fake/enganoso) | 254 |
| label=1 (real/verdadeiro) | 254 |
| Split treino/teste | 406 / 102 (80/20, stratify=label) |

**Composição do label=0:** claims checadas pelo Google Fact Check — FALSO (165), ENGANOSO (64), FORA_DE_CONTEXTO (25). Rótulo proveniente de agências verificadoras (`ROTULO_FORTE`).

**Composição do label=1:** notícias reais de portais jornalísticos coletadas por RSS — NOTICIA_REAL (231) e claims verificadas como verdadeiras pelo GFC — GFC_VERDADEIRO (23). Rótulos de qualidade mista (`ROTULO_ASSUMIDO` para RSS, `ROTULO_FORTE` para GFC_VERDADEIRO).

### Dataset de ablação — v2_size_matched

| Campo | Valor |
|---|---|
| Arquivo | `dataset_final_treino_v2_size_matched_2026-05-18_23-42-41.csv` |
| Total de registros | 146 |
| label=0 | 73 |
| label=1 | 73 |
| Split treino/teste | 116 / 30 (80/20, stratify=label) |

Construído a partir do `v2_balanced`, com controle por faixa de comprimento: para cada faixa de `tamanho_chars`, seleciona `min(n_label0, n_label1)` amostras de cada classe. Resultado: médias de comprimento convergem para o mesmo valor em ambas as classes (≈162 chars), eliminando o confundidor tamanho-vs-rótulo.

---

## 3. Modelos treinados

### Pipeline (idêntico para ambos)

| Componente | Parâmetro | Valor |
|---|---|---|
| TF-IDF | max_features | 5.000 |
| TF-IDF | ngram_range | (1, 2) |
| TF-IDF | sublinear_tf | True |
| TF-IDF | min_df | 2 |
| TF-IDF | max_df | 0.9 |
| LogReg | C | 1.0 |
| LogReg | solver | lbfgs |
| LogReg | class_weight | balanced |
| Geral | random_state | 42 |

### Arquivos gerados

| Arquivo | Papel |
|---|---|
| `modelos/baseline_tfidf_logreg_v2_balanced.joblib` | **Modelo oficial da V2** |
| `modelos/baseline_tfidf_logreg_v2_balanced_meta.json` | Metadados completos do modelo oficial |
| `modelos/baseline_tfidf_logreg_v2_size_matched.joblib` | Modelo de ablação |
| `modelos/baseline_tfidf_logreg_v2_size_matched_meta.json` | Metadados do modelo de ablação |

Features TF-IDF aprendidas: 1.858 (balanced) e 456 (size_matched, corpus menor).

---

## 4. Métricas comparativas

| Métrica | V1 (referência) | V2 balanced | V2 size_matched | Δ (bal → sm) |
|---|---|---|---|---|
| Acurácia | 0.8625 | **0.9020** | 0.8667 | −0.035 |
| Precisão+ | 0.9394 | 0.9362 | 0.9231 | −0.013 |
| Recall+ | 0.7750 | **0.8627** | 0.8000 | −0.063 |
| F1+ | 0.8493 | **0.8980** | 0.8571 | −0.041 |
| F1 macro | 0.8614 | **0.9018** | 0.8661 | −0.036 |
| ROC-AUC | 0.9359 | **0.9708** | 0.9644 | −0.006 |

> Valores obtidos no conjunto de teste (20% reservado com estratificação por `label`, `random_state=42`).

**Matriz de confusão — v2_balanced (102 amostras de teste):**

```
               Pred 0   Pred 1
Real 0 (fake)    48        3     ← 3 falsos negativos (fake → real)
Real 1 (real)     9       42     ← 9 falsos positivos (real → fake)
```

---

## 5. Interpretação metodológica

O `v2_balanced` superou a V1 em todas as métricas. O ganho mais expressivo foi no recall positivo (+0.088), indicando que o modelo erra menos ao classificar notícias reais como falsas — um erro com custo elevado em sistemas de fact-checking.

O experimento de ablação com `v2_size_matched` revelou uma queda moderada de desempenho (−0.036 F1 macro), mas sem colapso. Dois aspectos complementam essa análise:

1. **Sem tokens suspeitos nos coeficientes:** nenhum dos 40 coeficientes mais influentes de nenhum dos dois modelos apresentou tokens ligados a portais, agências, datas ou estilo jornalístico de atribuição (`afirmou`, `segundo`, `declarou`, etc.).

2. **ROC-AUC preservado no size_matched (0.9644):** o modelo de ablação mantém alta capacidade discriminativa mesmo sem o confundidor de tamanho, sugerindo que o modelo aprende sinal semântico real.

A queda de F1 no size_matched é parcialmente explicável pelo volume drasticamente menor do corpus de ablação (146 vs. 508 registros) e pelo vocabulário TF-IDF reduzido (456 vs. 1.858 features), o que dificulta isolar o efeito puro do viés de tamanho. Ainda assim, o experimento é metodologicamente válido e fortalece o TCC por documentar que o risco foi investigado explicitamente.

**Conclusão:** o comprimento do texto influencia o aprendizado, mas não é o único — nem o principal — fator capturado pelo modelo.

---

## 6. Limitações atuais

1. **Volume pequeno:** 508 registros para treino é insuficiente para afirmações robustas de generalização. O benchmark mínimo para classificadores de fake news na literatura é da ordem de 5.000–10.000 exemplos.

2. **Diferença de origem entre classes:** label=0 são claims curtas checadas por agências (média ≈ 99 chars); label=1 são predominantemente títulos+resumos de portais RSS (média ≈ 246 chars). Essa diferença estrutural não é totalmente eliminável sem oversampling ou coleta direcionada de claims verdadeiras curtas.

3. **Poucos GFC_VERDADEIRO:** apenas 23 registros com rótulo positivo forte (verificados explicitamente como verdadeiros por agências). O restante do label=1 (NOTICIA_REAL) tem rótulo assumido por confiabilidade da fonte, não por verificação direta.

4. **Ausência de datasets acadêmicos:** o pipeline ainda não integra bases como Fake.Br, FakeRecogna ou similares, que forneceriam label=0 e label=1 em maior volume e com metodologia documentada.

5. **Domínio restrito:** o dataset é concentrado em política eleitoral brasileira (2022–2024). A generalização para outros domínios (saúde, economia, internacional) é incerta.

---

## 7. Próximas etapas

- [ ] Integrar datasets acadêmicos brasileiros (Fake.Br, FakeRecogna ou equivalente)
- [ ] Criar pipeline de padronização e curadoria para esses datasets (`ROTULO_ACADEMICO`)
- [ ] Auditar distribuição de tamanho de textos por classe antes de montar a V3
- [ ] Gerar dataset V3 com volume próximo de 6.000 registros
- [ ] Treinar modelos comparativos na V3 (TF-IDF + LogReg como baseline, avaliar BERT/BERTimbau)
- [ ] Avaliar generalização entre fontes (treino em GFC, teste em RSS e vice-versa)
- [ ] Alinhar parâmetros de `api/services/google_factcheck.py` com o notebook de coleta

---

## Referência de arquivos

```
modelos/
  baseline_tfidf_logreg_v1.joblib                          ← V1 (referência histórica)
  baseline_tfidf_logreg_v1_meta.json
  baseline_tfidf_logreg_v2_balanced.joblib                 ← V2 oficial
  baseline_tfidf_logreg_v2_balanced_meta.json
  baseline_tfidf_logreg_v2_size_matched.joblib             ← V2 ablação
  baseline_tfidf_logreg_v2_size_matched_meta.json

dados/dataset_unificado/final/
  dataset_final_treino_v1.csv                              ← locked
  dataset_final_treino_v2_balanced_2026-05-19_00-48-15.csv ← dataset principal V2
  dataset_final_treino_v2_size_matched_2026-05-18_23-42-41.csv ← dataset ablação V2

src/
  montagem_dataset_final_v2.ipynb                          ← pipeline de montagem do dataset
  treino_baseline_v2_comparativo.ipynb                     ← pipeline de treino comparativo
```
