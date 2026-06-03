---
sidebar_position: 4
---

# Segurança

O backend do CheckAI implementa múltiplas camadas de segurança baseadas nas recomendações do **OWASP Top 10** e **OWASP API Security**.

## Resumo das proteções

| Proteção | O que previne | Implementação |
|----------|--------------|---------------|
| Hashing de senhas | Roubo de senhas do banco | bcrypt com salt automático |
| JWT com expiração | Uso indevido de tokens | Tokens expiram em 60 minutos |
| CORS | Requisições de domínios maliciosos | Apenas métodos e headers permitidos |
| Rate Limiting | Ataques de força bruta e DoS | 30 req/min por IP |
| Security Headers | XSS, clickjacking, MIME sniffing | X-Frame-Options, CSP, HSTS, etc. |
| Trusted Host | Host Header Injection | Validação do header Host |
| Input Validation | Injeção de dados maliciosos | Pydantic valida todos os inputs |
| Error Handling | Vazamento de informações internas | Nunca retorna stack traces |
| IDOR Prevention | Acesso a dados de outros usuários | Filtro por usuario_id em todas as queries |

## Detalhes de cada proteção

### Hashing de senhas (OWASP A02)

As senhas **nunca** são armazenadas em texto puro. O bcrypt gera um hash irreversível com salt automático:

```
Senha: "minhasenha123"
Hash:  "$2b$12$LJ3m4YsGJF8kPYu.7Q3eO..."
```

Mesmo senhas iguais geram hashes diferentes (por causa do salt), tornando ataques de rainbow table ineficazes.

### Rate Limiting (OWASP A04)

Cada IP pode fazer no máximo **30 requisições por minuto**. Ao exceder o limite:

```
HTTP 429 Too Many Requests
{
  "detail": "Limite de requisições excedido. Tente novamente em breve."
}
```

### Security Headers (OWASP A05)

Toda resposta HTTP inclui headers de segurança:

| Header | Valor | Proteção |
|--------|-------|----------|
| `X-Content-Type-Options` | `nosniff` | Previne MIME sniffing |
| `X-Frame-Options` | `DENY` | Previne clickjacking (iframes) |
| `X-XSS-Protection` | `1; mode=block` | Proteção XSS (navegadores legados) |
| `Strict-Transport-Security` | `max-age=31536000` | Força HTTPS (em produção) |
| `Content-Security-Policy` | `default-src 'self'` | Restringe fontes de conteúdo |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controla informações do referer |
| `Permissions-Policy` | `camera=(), microphone=()` | Desabilita APIs desnecessárias |
| `Cache-Control` | `no-store, no-cache` | Impede cache de dados sensíveis |

### Prevenção de IDOR (OWASP A01)

Todas as queries de verificações filtram por `usuario_id`, impedindo que um usuário acesse dados de outro:

```python
# Mesmo que o atacante mude o ID na URL, só retorna seus próprios dados
db.query(Verificacao).filter(
    Verificacao.id == verificacao_id,
    Verificacao.usuario_id == usuario_id,  # ← Proteção IDOR
)
```

### Documentação desabilitada em produção (OWASP A05)

O Swagger UI (`/docs`) e o schema OpenAPI (`/openapi.json`) são desabilitados quando `API_DEBUG=false`, reduzindo a superfície de ataque.

### Validação de entrada (Pydantic)

Todos os dados de entrada são validados automaticamente pelo Pydantic:

- Textos: comprimento mínimo e máximo
- Emails: formato válido (EmailStr)
- Senhas: mínimo de 8 caracteres, máximo de 72 (limite do bcrypt)
- Números: ranges válidos (ge, le)

Dados inválidos resultam em erro 422 com detalhes do que está errado.

### Error Handler global (OWASP A09)

Erros não tratados são capturados por um handler global que:
1. **Loga** o erro completo internamente (incluindo stack trace)
2. **Retorna** uma mensagem genérica ao cliente (sem detalhes internos)

```json
{
  "detail": "Erro interno do servidor. Contate o administrador."
}
```

Isso impede que atacantes usem mensagens de erro para mapear a aplicação.
