---
sidebar_position: 2
---

# Testes do Backend

O backend possui testes automatizados para validar os componentes críticos da lógica de verificação.

## Arquivos de teste

| Arquivo | O que testa |
|---------|-------------|
| `test_ranking_fontes.py` | Filtragem, classificação e ranking de fontes web |
| `test_decisor_veredito.py` | Regras de decisão final (ML + NLI) |
| `test_nli_standalone.py` | Classificação NLI par a par e agregação |
| `tests/test_api.py` | Endpoints da API (model service) |

## Como executar os testes

### Via Docker (recomendado)

```bash
# Abrir terminal no container do backend
make shell-backend

# Executar todos os testes
python -m pytest

# Executar um teste específico
python -m pytest test_ranking_fontes.py -v

# Executar com saída detalhada
python -m pytest -v --tb=short
```

### Localmente (sem Docker)

Se você tem Python 3.12 instalado e as dependências:

```bash
cd fake-news-checker-back
pip install -r requirements.txt
python -m pytest
```

## O que cada teste cobre

### test_ranking_fontes.py

Testa o módulo de ranking que filtra e classifica fontes da web:

- Detecção correta de tipo de fonte (oficial, jornalística, fact-checking, etc.)
- Descarte de fontes de redes sociais
- Descarte de fontes com dados insuficientes
- Cálculo de peso de confiabilidade
- Ordenação por confiabilidade
- Bônus para snippets longos

### test_decisor_veredito.py

Testa as regras de decisão final que combinam ML e NLI:

- NLI ausente → mantém fluxo ML
- NLI neutro → mantém fluxo ML
- ML + NLI concordam → boost de confiança
- ML + NLI discordam → INCONCLUSIVO
- ML inconclusivo + NLI forte → NLI decide
- Fact-checker contradiz → INCONCLUSIVO
- NLI fraco → mantém fluxo ML

### test_nli_standalone.py

Testa o serviço de Natural Language Inference:

- Classificação de pares (alegação, evidência)
- Mapeamento de labels (ENTAILMENT → SUPPORTS, etc.)
- Agregação por votação (maioria simples)
- Limiares de confiança
- Comportamento com modelo ausente (fallback NEUTRAL)

## Escrevendo novos testes

Os testes seguem o padrão pytest. Para adicionar um novo teste:

1. Crie um arquivo `test_*.py` na raiz de `fake-news-checker-back/`
2. Escreva funções que comecem com `test_`
3. Use `assert` para validar resultados

```python
# Exemplo: test_meu_modulo.py
from services.ranking_fontes import ranquear_fontes

def test_fontes_vazias_retorna_lista_vazia():
    resultado = ranquear_fontes([])
    assert resultado == []

def test_fonte_social_descartada():
    fontes = [{
        "titulo": "Post no Instagram",
        "url": "https://instagram.com/post/123",
        "snippet": "Texto do post sobre política...",
        "fonte": "instagram.com",
    }]
    resultado = ranquear_fontes(fontes)
    assert len(resultado) == 0
```

## Testes da API (endpoint-level)

O arquivo `fake-news-checker-model/tests/test_api.py` testa os endpoints da API. Esses testes fazem requisições HTTP reais contra a aplicação:

```bash
# Executar dentro do container de notebooks
cd /app/fake-news-checker-model
python -m pytest tests/ -v
```

:::note[Os testes de endpoint requerem que o backend esteja rodando. Execute `make up` antes.]

:::