---
sidebar_position: 4
---

# Decisor de Veredito

O Decisor de Veredito é a camada final de decisão do CheckAI. Ele combina todos os sinais disponíveis — modelo ML, concordância com fontes e NLI — para produzir o veredito definitivo.

## Filosofia: conservador por design

O decisor é **deliberadamente conservador**: quando há conflito entre os sinais, ele prefere classificar como **INCONCLUSIVO** em vez de arriscar um veredito errado. Em um sistema de verificação de fatos, é melhor dizer "não temos certeza" do que afirmar algo incorreto.

## Sinais de entrada

| Sinal | Origem | Descrição |
|-------|--------|-----------|
| `resultado_atual` | ML + Concordância | REAL, FALSO ou INCONCLUSIVO (já ajustado pelas fontes) |
| `confianca_atual` | ML + Concordância | Score de 0.0 a 1.0 |
| `nli_resultado_agregado` | NLI | SUPPORTS, REFUTES ou NEUTRAL |
| `nli_score_agregado` | NLI | Score médio do veredito NLI |
| `nli_votos` | NLI | Contagem: `{SUPPORTS: N, REFUTES: N, NEUTRAL: N}` |
| `fontes` | Ranking | Lista de fontes com tipo e confiabilidade |

## Regras de decisão

As regras são aplicadas em ordem de prioridade:

### Regra 1a — NLI ausente

Se o NLI não avaliou nenhuma fonte (modelo não carregado ou sem fontes):
- **Ação:** mantém o resultado do fluxo ML + fontes sem alteração
- **Justificativa:** sem NLI, não há sinal adicional para alterar o veredito

### Regra E — Fact-checking contradiz

Se uma fonte de **fact-checking** (Aos Fatos, Lupa, etc.) de alta confiabilidade contradiz o resultado do ML:
- ML=REAL + fact-checker REFUTES → **INCONCLUSIVO**
- ML=FALSO + fact-checker SUPPORTS → **INCONCLUSIVO**
- **Justificativa:** agências de fact-checking são especializadas — uma única fonte qualificada é suficiente para gerar dúvida

### Regra 1b — NLI neutro

Se o NLI agregado é NEUTRAL:
- **Ação:** mantém o resultado atual
- **Justificativa:** NLI neutro não fornece sinal direcional

### Regra 2 — ML e NLI concordam (forte)

Se ambos apontam na mesma direção com sinal forte:
- ML=REAL + NLI=SUPPORTS forte → **REAL** (confiança +5%)
- ML=FALSO + NLI=REFUTES forte → **FALSO** (confiança +5%)
- **Justificativa:** concordância reforça o veredito

### Regras 3 e 4 — ML e NLI discordam (forte)

Se há conflito forte entre ML e NLI:
- ML=REAL + NLI=REFUTES forte → **INCONCLUSIVO** (confiança = 55%)
- ML=FALSO + NLI=SUPPORTS forte → **INCONCLUSIVO** (confiança = 55%)
- **Justificativa:** conflito entre sinais → resultado não confiável

### Regras 5 e 6 — NLI resolve inconclusivo

Se o ML foi inconclusivo mas o NLI tem sinal forte:
- INCONCLUSIVO + NLI=SUPPORTS forte → **REAL** (confiança = score NLI)
- INCONCLUSIVO + NLI=REFUTES forte → **FALSO** (confiança = score NLI)
- **Justificativa:** NLI desempata a incerteza

### Regra 7 — NLI fraco

Se o NLI está presente mas sem sinal forte o suficiente:
- **Ação:** mantém o resultado atual
- **Justificativa:** sinal fraco não é suficiente para alterar o veredito

## O que é "NLI forte"?

Para que o NLI influencie o veredito, duas condições precisam ser atendidas:

1. **Score agregado ≥ 0.75** — o NLI tem alta confiança na direção
2. **≥ 2 fontes independentes de alta confiabilidade** votaram nessa direção

### Fontes que podem influenciar o veredito

Apenas fontes de tipos **independentes e confiáveis** contam:

| Tipo | Pode influenciar? | Exemplo |
|------|-------------------|---------|
| `oficial` | Sim | gov.br, Câmara, Senado |
| `fact_checking` | Sim | Aos Fatos, Lupa, Boatos.org |
| `jornalistica` | Sim | G1, Folha, UOL, BBC |
| `enciclopedia` | Não | Wikipedia |
| `contextual_politica` | Não | Sites de partidos |
| `desconhecida` | Não | Blogs e sites menores |
| `social` | Não (descartada antes) | Facebook, Twitter, Instagram |

## Saída do decisor

O decisor retorna um objeto com quatro campos:

```json
{
  "resultado": "REAL",
  "confianca": 0.87,
  "decisao_origem": "nli_reforcou",
  "justificativa_decisao": "ML e NLI concordam (REAL/SUPPORTS, score=0.85); confiança de 0.82 → 0.87."
}
```

| Campo | Valores possíveis | Descrição |
|-------|-------------------|-----------|
| `resultado` | REAL, FALSO, INCONCLUSIVO | Veredito final |
| `confianca` | 0.0 a 0.99 | Nível de certeza |
| `decisao_origem` | `fluxo_atual`, `nli_reforcou`, `nli_decidiu_inconclusivo` | Quem tomou a decisão |
| `justificativa_decisao` | texto livre | Explicação legível da regra aplicada |
