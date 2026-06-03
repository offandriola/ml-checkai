---
sidebar_position: 1
---

# Como Testar

Esta página explica como testar o CheckAI de diferentes formas: pela interface visual, pela API diretamente, e pelos testes automatizados.

## Testando pela interface (Frontend)

A forma mais simples de testar é usando a interface visual:

1. Suba o projeto com `make up`
2. Acesse `http://localhost:3000`
3. Na landing page, digite um texto no campo de verificação e clique em "Verificar"
4. O resultado aparecerá com o veredito, confiança e fontes

### Exemplos de textos para testar

| Texto | Resultado esperado |
|-------|-------------------|
| "Lula é presidente do Brasil" | REAL (fato verificável) |
| "Bolsonaro é vice do Lula" | FALSO (factualmente impossível) |
| "O sol nasce no oeste" | FALSO (contradiz fatos básicos) |
| "Xyzzy blah lorem" | INCONCLUSIVO (texto sem sentido) |

:::tip[Tente textos em português sobre política brasileira — esse é o domínio em que o modelo foi treinado e tem melhor performance.]

:::
## Testando pela API (Swagger UI)

Para testar a API diretamente:

1. Acesse `http://localhost:8000/docs`
2. Encontre o endpoint `POST /api/v1/verificar`
3. Clique em "Try it out"
4. Cole o JSON de teste e clique em "Execute"

```json
{
  "texto": "Governo anuncia nova medida econômica para 2026",
  "tipo": "texto"
}
```

### Testando endpoints autenticados

1. Use `POST /api/v1/auth/cadastro` para criar uma conta
2. Use `POST /api/v1/auth/login` para obter o token
3. Clique no botão **Authorize** (cadeado) no topo
4. Cole o token e clique em "Authorize"
5. Agora você pode testar `POST /api/v1/verificacoes`, `GET /api/v1/verificacoes`, etc.

## Testando via cURL (terminal)

Se preferir usar o terminal:

```bash
# Verificação pública (sem login)
curl -X POST http://localhost:8000/api/v1/verificar \
  -H "Content-Type: application/json" \
  -d '{"texto": "Lula é presidente do Brasil", "tipo": "texto"}'

# Criar conta
curl -X POST http://localhost:8000/api/v1/auth/cadastro \
  -H "Content-Type: application/json" \
  -d '{"nome": "Teste", "email": "teste@teste.com", "senha": "senha12345"}'

# Login (copie o access_token da resposta)
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@teste.com", "senha": "senha12345"}'

# Verificação autenticada (substitua <TOKEN> pelo access_token)
curl -X POST http://localhost:8000/api/v1/verificacoes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"texto": "Governo anuncia nova medida econômica", "tipo": "texto"}'

# Listar histórico
curl http://localhost:8000/api/v1/verificacoes \
  -H "Authorization: Bearer <TOKEN>"

# Health check
curl http://localhost:8000/api/v1/health
```

## Testando o modelo ML isoladamente

Para testar apenas a classificação (sem busca web e NLI):

```bash
curl -X POST http://localhost:8000/api/v1/classificar \
  -H "Content-Type: application/json" \
  -d '{"texto": "Governo anuncia nova medida econômica para 2026"}'
```

Resposta:
```json
{
  "texto_original": "Governo anuncia nova medida econômica para 2026",
  "classificacao": "VERDADEIRO",
  "confianca": 0.85,
  "modelo_ativo": true,
  "mensagem": "Classificação realizada com modelo treinado"
}
```

## Verificando o status dos serviços

```bash
# Status da API
curl http://localhost:8000/api/v1/health

# Status do modelo ML
curl http://localhost:8000/api/v1/classificar/status

# Status dos containers Docker
docker-compose ps
```
