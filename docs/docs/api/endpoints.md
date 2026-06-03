---
sidebar_position: 1
---

# Endpoints da API

A API do CheckAI segue o padrão REST e está disponível em `http://localhost:8000`. A documentação interativa (Swagger UI) pode ser acessada em `http://localhost:8000/docs` quando o modo debug está ativado.

## Resumo dos endpoints

### Públicos (sem autenticação)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/` | Informações básicas da API |
| `GET` | `/api/v1/health` | Verificação de saúde da API |
| `POST` | `/api/v1/verificar` | Verificação pública (landing page) |
| `POST` | `/api/v1/classificar` | Classificação simples de texto |
| `GET` | `/api/v1/classificar/status` | Status do modelo ML |
| `POST` | `/api/v1/auth/cadastro` | Criar conta |
| `POST` | `/api/v1/auth/login` | Fazer login |
| `POST` | `/api/v1/auth/recuperar-senha` | Solicitar recuperação de senha |
| `POST` | `/api/v1/auth/redefinir-senha` | Redefinir senha com token |

### Autenticados (requerem JWT)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/v1/auth/perfil` | Dados do usuário logado |
| `PATCH` | `/api/v1/auth/perfil` | Atualizar nome/email |
| `POST` | `/api/v1/auth/trocar-senha` | Trocar senha |
| `POST` | `/api/v1/verificacoes` | Criar verificação (salva no histórico) |
| `POST` | `/api/v1/verificacoes/imagem` | Verificação por imagem (OCR) |
| `GET` | `/api/v1/verificacoes` | Listar histórico (paginado) |
| `GET` | `/api/v1/verificacoes/{id}` | Detalhes de uma verificação |
| `DELETE` | `/api/v1/verificacoes/historico` | Limpar todo o histórico |
| `GET` | `/api/v1/dashboard/resumo` | Estatísticas do usuário |

### Coleta de dados

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/v1/coleta/google-factcheck` | Executar pipeline Google Fact Check |
| `POST` | `/api/v1/coleta/fontes-oficiais` | Executar pipeline fontes oficiais |
| `POST` | `/api/v1/coleta/noticias-reais` | Executar pipeline notícias RSS |
| `POST` | `/api/v1/coleta/todas` | Executar todos os pipelines |
| `GET` | `/api/v1/dados/estatisticas` | Estatísticas dos pipelines |
| `GET` | `/api/v1/dados/{pipeline}/arquivos` | Listar arquivos de um pipeline |
| `GET` | `/api/v1/dados/{pipeline}/registros` | Ver registros de um pipeline |

---

## Detalhes dos principais endpoints

### POST `/api/v1/verificar`

Verificação pública — usada pela landing page. Não exige login e não salva no histórico.

**Corpo da requisição:**
```json
{
  "texto": "Governo anuncia nova isenção de impostos",
  "tipo": "texto"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `texto` | string | Sim | Texto a ser verificado (5 a 10.000 caracteres) |
| `tipo` | string | Não | `texto` (padrão), `link` ou `imagem` |

**Resposta (200):**
```json
{
  "texto_verificado": "Governo anuncia nova isenção de impostos",
  "tipo": "texto",
  "resultado": "INCONCLUSIVO",
  "confianca": 0.55,
  "modelo_ativo": true,
  "fontes": [
    {
      "titulo": "Governo estuda isenção de IR...",
      "url": "https://g1.globo.com/...",
      "snippet": "O governo federal avalia...",
      "fonte": "g1.globo.com",
      "tipo_fonte": "jornalistica",
      "confiabilidade_fonte": "alta",
      "peso_fonte": 0.85,
      "nli_label": "SUPPORTS",
      "nli_score": 0.78
    }
  ],
  "nli_resultado_agregado": "SUPPORTS",
  "nli_score_agregado": 0.78,
  "nli_votos": {"SUPPORTS": 3, "REFUTES": 0, "NEUTRAL": 2},
  "decisao_origem": "nli_reforcou",
  "justificativa_decisao": "ML e NLI concordam..."
}
```

### POST `/api/v1/auth/login`

Autentica o usuário e retorna um token JWT.

**Corpo da requisição:**
```json
{
  "email": "usuario@exemplo.com",
  "senha": "minhasenha123"
}
```

**Resposta (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### GET `/api/v1/verificacoes`

Lista o histórico de verificações do usuário autenticado, com filtros e paginação.

**Query parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `resultado` | string | Filtrar por resultado: REAL, FALSO ou INCONCLUSIVO |
| `busca` | string | Buscar por palavra-chave no texto verificado |
| `pagina` | int | Página atual (padrão: 1) |
| `por_pagina` | int | Itens por página (padrão: 10) |

**Resposta (200):**
```json
{
  "total": 45,
  "pagina": 1,
  "por_pagina": 10,
  "total_paginas": 5,
  "itens": [
    {
      "id": 123,
      "texto_verificado": "...",
      "tipo": "texto",
      "resultado": "REAL",
      "confianca": 0.87,
      "fontes": [...],
      "criado_em": "2026-05-30T14:30:00"
    }
  ]
}
```

### GET `/api/v1/dashboard/resumo`

Retorna estatísticas agregadas do usuário.

**Resposta (200):**
```json
{
  "total_verificacoes": 45,
  "total_reais": 20,
  "total_falsas": 15,
  "total_inconclusivas": 10,
  "percentual_reais": 44.4
}
```

## Documentação interativa

A melhor forma de explorar todos os endpoints é usando o **Swagger UI** em `http://localhost:8000/docs`. Lá você pode:

- Ver todos os endpoints com seus parâmetros
- Testar requisições diretamente no navegador
- Ver os schemas de entrada e saída
- Autenticar-se com JWT para testar endpoints protegidos

:::note[O Swagger UI só está disponível quando `API_DEBUG=true` no arquivo `.env`. Em produção, ele é desabilitado por segurança.]

:::