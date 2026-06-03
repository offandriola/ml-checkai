---
sidebar_position: 3
---

# Backend

O backend é uma **API RESTful** construída com **FastAPI** (Python), localizada na pasta `fake-news-checker-back/`.

## Estrutura de pastas

```
fake-news-checker-back/
├── main.py                      # Ponto de entrada da aplicação FastAPI
├── config.py                    # Configurações centralizadas (env, paths)
├── database.py                  # Conexão com o banco de dados (SQLAlchemy)
├── criar_tabelas.py             # Script de criação de tabelas
├── requirements.txt             # Dependências Python
├── Dockerfile
│
├── routes/                      # Endpoints da API (camada de rota)
│   ├── health.py                # GET /api/v1/health
│   ├── auth.py                  # POST /api/v1/auth/cadastro, /login, etc.
│   ├── classificador.py         # POST /api/v1/classificar
│   ├── verificar.py             # POST /api/v1/verificar (público)
│   ├── verificacao.py           # CRUD /api/v1/verificacoes (autenticado)
│   ├── dashboard.py             # GET /api/v1/dashboard/resumo
│   ├── coleta.py                # POST /api/v1/coleta/* (pipelines de dados)
│   └── dados.py                 # GET /api/v1/dados/* (consulta de dados)
│
├── services/                    # Lógica de negócio (camada de serviço)
│   ├── classificador.py         # Carrega e usa o modelo ML
│   ├── nli.py                   # Natural Language Inference (mDeBERTa)
│   ├── busca_web.py             # Busca de fontes via Serper.dev
│   ├── ranking_fontes.py        # Classificação e ranking de fontes
│   ├── concordancia_fontes.py   # Concordância entre ML e fontes
│   ├── decisor_veredito.py      # Decisão final combinando ML + NLI
│   ├── verificacao.py           # Orquestra o fluxo completo de verificação
│   ├── auth.py                  # Lógica de autenticação (hash, JWT)
│   ├── extrator_artigos.py      # Extração de conteúdo de URLs
│   ├── analisador_imagem.py     # OCR para análise de imagens
│   ├── google_factcheck.py      # Coleta via Google Fact Check API
│   ├── fontes_oficiais.py       # Coleta de fontes oficiais (gov.br)
│   └── rss_noticias.py          # Coleta de notícias via RSS
│
├── models/
│   └── schemas.py               # Schemas Pydantic (validação de dados)
│
├── db_models/                   # Modelos do banco de dados (SQLAlchemy ORM)
│   ├── user.py                  # Tabela de usuários
│   └── verificacao.py           # Tabela de verificações
│
└── utils/
    ├── security.py              # Utilitários de segurança
    ├── dependencies.py          # Dependências injetáveis (auth, db session)
    ├── csv_handler.py           # Leitura/escrita de CSVs
    └── db_migrate.py            # Migrações automáticas do banco
```

## Como a API funciona

### Inicialização (startup)

Quando o servidor inicia, o `main.py` executa:

1. **Aplica migrações** — cria/atualiza tabelas no banco de dados
2. **Carrega o modelo ML** — lê o arquivo `.joblib` do disco para a memória
3. **Carrega o modelo NLI** — baixa o mDeBERTa do Hugging Face (~550 MB na primeira vez)
4. **Registra routers** — conecta todos os endpoints

### Middlewares de segurança

O backend aplica várias camadas de proteção (baseadas no OWASP Top 10):

| Middleware | Proteção |
|-----------|----------|
| **CORS** | Controla quais domínios podem acessar a API |
| **Trusted Host** | Previne Host Header Injection |
| **Security Headers** | X-Frame-Options, CSP, HSTS, etc. |
| **Rate Limiting** | Limita a 30 requisições por minuto por IP |
| **Exception Handler** | Nunca vaza stack traces para o cliente |

### Organização em camadas

O código segue o padrão de separação em camadas:

```
Requisição HTTP
      │
      ▼
┌──────────┐
│  Routes   │  Recebe a requisição, valida entrada, chama o serviço
└────┬─────┘
     │
     ▼
┌──────────┐
│ Services  │  Contém toda a lógica de negócio
└────┬─────┘
     │
     ▼
┌──────────┐
│DB Models  │  Lê/escreve no banco de dados via SQLAlchemy
└──────────┘
```

- **Routes** (`routes/`) — recebem as requisições HTTP, validam os dados de entrada usando Pydantic e chamam os serviços
- **Services** (`services/`) — contêm toda a lógica de negócio (classificação, busca, NLI, etc.)
- **Models** (`db_models/`) — definem as tabelas do banco de dados
- **Schemas** (`models/schemas.py`) — definem o formato dos dados de entrada e saída da API

## Configuração

Todas as configurações ficam centralizadas no `config.py`, que lê variáveis de ambiente do arquivo `.env`:

| Categoria | Variáveis |
|-----------|-----------|
| Servidor | `API_HOST`, `API_PORT`, `API_DEBUG` |
| JWT | `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `JWT_EXPIRACAO_MINUTOS` |
| Banco | `DATABASE_URL` |
| APIs externas | `SERPER_API_KEY`, `GOOGLE_FACTCHECK_API_KEY` |
| Modelo ML | `DIR_MODELO` (caminho dos arquivos `.joblib`) |

## Modo Mock

Se o modelo ML não estiver disponível (arquivo `.joblib` não encontrado), o backend ativa automaticamente o **modo mock**: gera classificações determinísticas baseadas em hash do texto. Isso permite desenvolver e testar o frontend sem precisar do modelo treinado.
