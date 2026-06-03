---
sidebar_position: 2
---

# Frontend

O frontend é uma **Single Page Application (SPA)** construída com React e Vite, localizada na pasta `fake-news-checker-front/`.

## Estrutura de pastas

```
fake-news-checker-front/
├── src/
│   ├── App.tsx                  # Rotas e layout principal
│   ├── main.tsx                 # Ponto de entrada
│   ├── components/
│   │   ├── LandingPage.tsx      # Página inicial pública
│   │   ├── LoginPage.tsx        # Tela de login
│   │   ├── RegisterPage.tsx     # Tela de cadastro
│   │   ├── HomePage.tsx         # Dashboard principal (autenticado)
│   │   ├── HistoryPage.tsx      # Histórico de verificações
│   │   ├── ResultsPage.tsx      # Detalhes de uma verificação
│   │   ├── VerdictPage.tsx      # Exibição do veredito
│   │   ├── SettingsPage.tsx     # Configurações do perfil
│   │   ├── ComposedInput.tsx    # Campo de entrada com anexos
│   │   ├── Header.tsx           # Barra de navegação
│   │   ├── Sidebar.tsx          # Menu lateral
│   │   ├── PlanosPage.tsx       # Página de planos
│   │   ├── SobrePage.tsx        # Página sobre o projeto
│   │   └── ui/                  # Componentes base (Radix UI + Tailwind)
│   ├── contexts/
│   │   └── AuthContext.tsx      # Contexto de autenticação (JWT)
│   └── services/
│       ├── api.ts               # Configuração do fetch/axios
│       ├── auth.ts              # Serviço de autenticação
│       └── verificacoes.ts      # Serviço de verificações
├── index.html
├── package.json
├── vite.config.ts
└── Dockerfile
```

## Páginas da aplicação

### Páginas públicas (sem login)

| Página | Componente | Descrição |
|--------|-----------|-----------|
| Landing Page | `LandingPage.tsx` | Apresentação do projeto com campo para verificação rápida |
| Login | `LoginPage.tsx` | Formulário de autenticação |
| Cadastro | `RegisterPage.tsx` | Registro de novo usuário |
| Esqueci a senha | `ForgotPasswordPage.tsx` | Recuperação de senha |
| Planos | `PlanosPage.tsx` | Página de planos disponíveis |
| Sobre | `SobrePage.tsx` | Informações sobre o projeto |

### Páginas autenticadas (requerem login)

| Página | Componente | Descrição |
|--------|-----------|-----------|
| Dashboard | `HomePage.tsx` | Visão geral com estatísticas e nova verificação |
| Histórico | `HistoryPage.tsx` | Lista paginada de verificações anteriores |
| Resultado | `ResultsPage.tsx` | Detalhes completos de uma verificação |
| Veredito | `VerdictPage.tsx` | Exibição visual do resultado |
| Configurações | `SettingsPage.tsx` | Perfil, troca de senha e zona de perigo |

## Autenticação

O frontend utiliza **JWT (JSON Web Token)** para autenticação:

1. O usuário faz login com email e senha
2. O backend retorna um token JWT
3. O token é armazenado no navegador (localStorage)
4. Todas as requisições autenticadas enviam o token no header `Authorization: Bearer <token>`
5. O `AuthContext.tsx` gerencia o estado de autenticação em toda a aplicação

## Comunicação com o backend

Os serviços em `src/services/` encapsulam todas as chamadas à API:

- **`api.ts`** — configuração base (URL, headers, interceptors)
- **`auth.ts`** — login, cadastro, logout, recuperação de senha
- **`verificacoes.ts`** — criar verificação, listar histórico, buscar por ID

## Como rodar apenas o frontend (desenvolvimento)

Se você quer trabalhar só no frontend:

```bash
cd fake-news-checker-front
npm install
npm run dev
```

O Vite iniciará em `http://localhost:5173`. As requisições à API serão redirecionadas para `http://127.0.0.1:8000` via proxy configurado no `package.json`.

:::note[Para o frontend funcionar completamente, o backend precisa estar rodando. Use `make up` para subir tudo junto.]

:::