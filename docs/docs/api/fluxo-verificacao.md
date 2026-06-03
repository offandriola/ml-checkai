---
sidebar_position: 3
---

# Fluxo de Verificação

Esta página descreve o fluxo completo que acontece quando um texto é enviado para verificação — desde a entrada do usuário até a resposta final.

## Visão geral

```
Entrada do usuário (texto, link ou imagem)
              │
              ▼
    ┌───── Pré-processamento ─────┐
    │  texto → usa direto          │
    │  link  → extrai conteúdo     │
    │  imagem → OCR (Tesseract)    │
    └──────────┬──────────────────┘
               │
    ┌──────────┴──────────┐
    │    (em paralelo)     │
    ▼                      ▼
Modelo ML            Busca Web
(TF-IDF+SVM)         (Serper.dev)
    │                      │
    │                      ▼
    │              Ranking de Fontes
    │              (filtra, classifica)
    │                      │
    └──────────┬───────────┘
               │
               ▼
      Concordância ML + Fontes
      (ajusta veredito com evidências)
               │
               ▼
          Análise NLI
      (cada fonte vs. alegação)
               │
               ▼
      Decisor de Veredito Final
      (combina todos os sinais)
               │
               ▼
         Resposta final
    REAL / FALSO / INCONCLUSIVO
    + fontes + justificativa
```

## Etapa 1: Pré-processamento

O sistema aceita três tipos de entrada:

| Tipo | O que acontece |
|------|---------------|
| `texto` | O texto é usado diretamente |
| `link` | O conteúdo da URL é extraído via Trafilatura (biblioteca Python de extração de artigos) |
| `imagem` | O texto é extraído da imagem via OCR (Tesseract) |

Se a extração falhar (link inacessível, imagem sem texto legível), o sistema tenta prosseguir com o que tem ou retorna INCONCLUSIVO.

## Etapa 2: Classificação ML + Busca Web (paralelo)

Estas duas operações rodam **simultaneamente** para economizar tempo:

### Classificação ML

O texto é enviado ao modelo TF-IDF + SVM, que retorna:
- **classificação**: VERDADEIRO ou FALSO
- **confiança**: de 0.0 a 1.0
- **modelo_ativo**: se o modelo real foi usado (ou mock)

### Busca Web

O texto é enviado à API Serper.dev (wrapper do Google), que retorna até 5 resultados orgânicos. Para cada resultado, são extraídos: título, URL, snippet e domínio.

A busca usa cache em memória — o mesmo texto normalizado sempre retorna as mesmas fontes, evitando resultados inconsistentes.

## Etapa 3: Ranking de Fontes

As fontes brutas da Serper passam por um processo de filtragem e classificação:

1. **Descarta fontes inválidas** — sem título, sem snippet, ou snippet muito curto (< 20 caracteres)
2. **Descarta redes sociais** — Instagram, Facebook, Twitter, TikTok, etc. (conteúdo não verificável)
3. **Classifica por tipo** — analisa o domínio para categorizar a fonte
4. **Atribui peso de confiabilidade** — cada tipo tem um peso de 0.0 a 1.0
5. **Ordena por peso** — fontes mais confiáveis primeiro
6. **Limita a 5 fontes** — retorna apenas as top 5

### Tipos de fonte e pesos

| Tipo | Peso | Confiabilidade | Exemplos |
|------|------|---------------|----------|
| `oficial` | 1.00 | Alta | gov.br, Câmara, Senado, IBGE |
| `fact_checking` | 0.95 | Alta | Aos Fatos, Lupa, Boatos.org |
| `jornalistica` | 0.80 | Alta | G1, Folha, UOL, BBC, CNN |
| `desconhecida` | 0.45 | Média | Blogs, sites menores |
| `enciclopedia` | 0.30 | Baixa | Wikipedia |
| `contextual_politica` | 0.20 | Baixa | Sites de partidos políticos |
| `social` | 0.05 | Muito baixa | Descartada antes de chegar aqui |

## Etapa 4: Concordância ML + Fontes

O módulo de concordância analisa se as fontes encontradas confirmam ou contradizem a afirmação do usuário. Ele busca por:

- **Marcas de desmentido** — "é falso", "fake news", "informação falsa", "desinformação", etc.
- **Marcas de confirmação** — "eleito presidente", "foi eleito", "assumiu o", etc.
- **Corroboração factual** — verbos como "confessou", "admitiu", "foi condenado"
- **Relações específicas** — "X é vice de Y" (com regras especiais para pares impossíveis)

Se as fontes confirmam fortemente ou desmentem a afirmação, o resultado do ML pode ser ajustado. Se não há confirmação explícita, a confiança é reduzida.

## Etapa 5: Análise NLI

Cada fonte aprovada pelo ranking é comparada com a afirmação do usuário via modelo NLI (mDeBERTa). Cada par (afirmação, evidência) recebe um label:

- **SUPPORTS** — a evidência confirma a afirmação
- **REFUTES** — a evidência contradiz
- **NEUTRAL** — sem relação direta

Os resultados são agregados por votação (maioria simples, com prioridade para REFUTES).

## Etapa 6: Decisor de Veredito Final

O decisor combina todos os sinais usando regras conservadoras:

- ML + NLI concordam → **reforça** o veredito (+5% de confiança)
- ML + NLI discordam (ambos fortes) → **INCONCLUSIVO**
- ML inconclusivo + NLI forte → **NLI decide**
- Fact-checker contradiz ML → **INCONCLUSIVO**
- NLI fraco → **mantém** ML

Para detalhes completos, veja a página [Decisor de Veredito](../modelo-ml/decisor-veredito).

## Exemplo completo

**Entrada:** "Lula é vice do Bolsonaro"

1. **ML:** classifica como FALSO (confiança 0.72)
2. **Busca web:** encontra 5 fontes sobre Lula e Bolsonaro
3. **Ranking:** G1, Folha, Wikipedia, UOL, BBC
4. **Concordância:** detecta que o par Lula/Bolsonaro é "vice impossível" → mantém FALSO
5. **NLI:** 4/5 fontes = REFUTES (score 0.81)
6. **Decisor:** ML=FALSO + NLI=REFUTES → concordam → FALSO com confiança 0.77

**Resposta final:**
```json
{
  "resultado": "FALSO",
  "confianca": 0.77,
  "decisao_origem": "nli_reforcou",
  "justificativa_decisao": "ML e NLI concordam (FALSO/REFUTES, score=0.81); confiança de 0.72 → 0.77."
}
```
