---
sidebar_position: 3
---

# Natural Language Inference (NLI)

O NLI é a segunda camada de inteligência do CheckAI. Enquanto o modelo TF-IDF+SVM classifica o texto isoladamente, o NLI **compara** o texto do usuário com as fontes encontradas na web.

## O que é NLI?

**Natural Language Inference** (Inferência em Linguagem Natural) é a tarefa de determinar a relação lógica entre duas frases:

| Relação | Significado | Exemplo |
|---------|-------------|---------|
| **SUPPORTS** (Entailment) | A evidência confirma a afirmação | Afirmação: "Lula é presidente" → Fonte: "Lula foi eleito presidente em 2022" |
| **REFUTES** (Contradiction) | A evidência contradiz a afirmação | Afirmação: "O Brasil saiu da ONU" → Fonte: "Brasil renova compromisso com a ONU" |
| **NEUTRAL** | A evidência fala do tema mas não confirma nem refuta | Afirmação: "Lula viajou para a China" → Fonte: "Brasil tem relações comerciais com a China" |

## Modelo utilizado

O CheckAI usa o modelo **mDeBERTa-v3-base-xnli-multilingual-nli-2mil7** do Hugging Face:

| Característica | Valor |
|---------------|-------|
| Arquitetura | DeBERTa-v3-base |
| Treinamento | XNLI + MultiNLI (2 milhões+ de exemplos) |
| Idiomas | 100+ (incluindo Português nativo) |
| Classes | 3 (ENTAILMENT, NEUTRAL, CONTRADICTION) |
| Tamanho | ~550 MB |

:::info[Por que este modelo?]

Escolhemos um modelo **multilíngue** porque o dataset de treino não tem dados NLI em português suficientes para treinar do zero. O mDeBERTa foi treinado com 2 milhões de pares de frases em múltiplos idiomas, incluindo português, o que garante boa performance sem necessidade de fine-tuning.

:::
## Como funciona no CheckAI

### 1. Pré-processamento

Cada fonte encontrada na web tem seu texto (snippet ou artigo completo) truncado a **1.500 caracteres** (~300-400 tokens), que é o limite seguro para o BERT (máximo de 512 tokens).

### 2. Classificação par a par

O modelo recebe pares `(evidência, alegação)` e retorna scores para as três classes:

```python
# Entrada
evidência = "Lula foi eleito presidente do Brasil em outubro de 2022"
alegação  = "Lula é presidente do Brasil"

# Saída do modelo
{
    "ENTAILMENT": 0.92,     # ← Maior score → SUPPORTS
    "NEUTRAL": 0.05,
    "CONTRADICTION": 0.03
}
```

### 3. Limiares de decisão

Para evitar falsos positivos, o CheckAI aplica limiares conservadores:

| Label | Limiar mínimo | Significado |
|-------|--------------|-------------|
| SUPPORTS | 0.65 | Score de entailment precisa ser ≥ 65% |
| REFUTES | 0.60 | Score de contradiction precisa ser ≥ 60% |
| NEUTRAL | qualquer | Qualquer score abaixo dos limiares |

### 4. Agregação por votação

Quando várias fontes são analisadas, o NLI agrega os resultados por votação:

- **≥ 50% REFUTES** → resultado agregado = REFUTES (prioridade: qualquer evidência de falsidade pesa mais)
- **≥ 50% SUPPORTS** → resultado agregado = SUPPORTS
- **Caso contrário** → NEUTRAL

O score final é a **média dos scores** do label vencedor.

## Exemplo prático

Suponha que o usuário enviou: **"Lula é presidente do Brasil"**

O sistema encontrou 5 fontes:

| Fonte | NLI Label | Score |
|-------|-----------|-------|
| g1.globo.com | SUPPORTS | 0.89 |
| folha.uol.com.br | SUPPORTS | 0.85 |
| wikipedia.org | SUPPORTS | 0.78 |
| bbc.com | NEUTRAL | 0.52 |
| terra.com.br | SUPPORTS | 0.71 |

**Agregação:**
- SUPPORTS: 4 fontes (80%) → ≥ 50% ✓
- Score médio: (0.89 + 0.85 + 0.78 + 0.71) / 4 = 0.81
- Resultado: **SUPPORTS com score 0.81**

## Integração no fluxo

O NLI **não** substitui o modelo ML — ele é usado como sinal adicional pelo [Decisor de Veredito](./decisor-veredito) para ajustar o resultado final. Quando o NLI e o ML concordam, a confiança aumenta. Quando discordam, o resultado pode se tornar INCONCLUSIVO.
