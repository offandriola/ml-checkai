---
sidebar_position: 2
---

# Autenticação

O CheckAI usa **JWT (JSON Web Tokens)** para autenticar usuários. Este é o mesmo padrão usado por grandes aplicações web.

## Como funciona o JWT?

Pense no JWT como um "crachá digital":

1. Você faz login com email e senha
2. O servidor verifica suas credenciais e gera um **token** (uma string longa codificada)
3. Esse token contém seu ID de usuário e uma data de expiração
4. Em todas as próximas requisições, você envia esse token no cabeçalho HTTP
5. O servidor valida o token sem precisar consultar o banco de dados novamente

```
Login                    Requisição autenticada
┌──────┐                 ┌──────┐
│Client│──email/senha──▶ │Server│
│      │◀──JWT token──── │      │
└──────┘                 └──────┘

┌──────┐                 ┌──────┐
│Client│──Bearer token─▶ │Server│  ← Valida o token
│      │◀──dados──────── │      │     sem ir ao banco
└──────┘                 └──────┘
```

## Fluxo de cadastro

```bash
# 1. Criar conta
POST /api/v1/auth/cadastro
{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "senha": "minhasenha123"
}

# Resposta: dados do usuário (sem a senha)
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@exemplo.com"
}
```

A senha é armazenada como **hash bcrypt** — mesmo que alguém acesse o banco de dados, não consegue recuperar a senha original.

## Fluxo de login

```bash
# 2. Fazer login
POST /api/v1/auth/login
{
  "email": "joao@exemplo.com",
  "senha": "minhasenha123"
}

# Resposta: token JWT
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## Usando o token

Para acessar endpoints protegidos, inclua o token no cabeçalho `Authorization`:

```bash
# 3. Requisição autenticada
GET /api/v1/verificacoes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Configurações do JWT

| Variável | Valor padrão | Descrição |
|----------|-------------|-----------|
| `JWT_SECRET_KEY` | — | Chave secreta para assinar tokens (obrigatória) |
| `JWT_ALGORITHM` | HS256 | Algoritmo de assinatura |
| `JWT_EXPIRACAO_MINUTOS` | 60 | Tempo de vida do token (1 hora) |

:::danger[Importante]

A `JWT_SECRET_KEY` deve ser uma string longa e aleatória. **Nunca** compartilhe essa chave ou a coloque no código-fonte.

:::
## Recuperação de senha

O CheckAI implementa um fluxo simplificado de recuperação de senha:

1. O usuário solicita a recuperação informando o email
2. O servidor gera um token temporário (15 minutos)
3. O usuário usa esse token para definir uma nova senha

:::note[Nota acadêmica]

Em produção, o token seria enviado por e-mail. Como este é um projeto de TCC sem servidor de e-mail configurado, o token é retornado diretamente na resposta da API para fins de demonstração.

:::
## Testando no Swagger UI

1. Acesse `http://localhost:8000/docs`
2. Faça login via `POST /api/v1/auth/login`
3. Copie o `access_token` da resposta
4. Clique no botão **"Authorize"** (cadeado) no topo da página
5. Cole o token e clique em "Authorize"
6. Agora todos os endpoints autenticados funcionarão
