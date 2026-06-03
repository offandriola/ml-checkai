---
sidebar_position: 7
---

# Contribuindo

Guia para quem quer contribuir com o projeto CheckAI.

## Estrutura do repositório

```
ml-checkai/
├── fake-news-checker-front/   # Frontend (React + Vite)
├── fake-news-checker-back/    # Backend (FastAPI)
├── fake-news-checker-model/   # Notebooks de ML
├── docs/                      # Esta documentação (Docusaurus)
├── docker-compose.yml         # Orquestração dos containers
├── Makefile                   # Atalhos para Docker
├── .env.example               # Template das variáveis de ambiente
└── README.md                  # Visão geral do projeto
```

## Configurando o ambiente de desenvolvimento

1. Clone o repositório e copie o `.env`:
   ```bash
   git clone https://github.com/offandriola/ml-checkai.git
   cd ml-checkai
   cp .env.example .env
   ```

2. Preencha o `JWT_SECRET_KEY` no `.env`

3. Suba o ambiente com Docker:
   ```bash
   make up
   ```

4. O hot-reload está ativado tanto no backend (uvicorn --reload) quanto no frontend (Vite). Edite os arquivos e as mudanças refletem automaticamente.

## Fluxo de desenvolvimento

### Criando uma feature nova

1. Crie um branch a partir de `main`:
   ```bash
   git checkout -b feat/minha-feature
   ```

2. Faça suas alterações

3. Teste localmente

4. Commit e push:
   ```bash
   git add .
   git commit -m "feat: descrição da feature"
   git push origin feat/minha-feature
   ```

5. Abra um Pull Request no GitHub

### Convenção de branches

| Prefixo | Uso |
|---------|-----|
| `feat/` | Nova funcionalidade |
| `fix/` | Correção de bug |
| `docs/` | Alterações na documentação |
| `refactor/` | Refatoração de código |

## Trabalhando no Backend

```bash
# Ver logs em tempo real
make logs-backend

# Abrir terminal no container
make shell-backend

# Executar testes
make shell-backend
python -m pytest -v
```

Arquivos importantes:
- `main.py` — ponto de entrada, middlewares
- `routes/` — endpoints HTTP
- `services/` — lógica de negócio
- `models/schemas.py` — validação de dados (Pydantic)
- `config.py` — variáveis de configuração

## Trabalhando no Frontend

```bash
# Ver logs
make logs-frontend

# Ou rodar localmente (fora do Docker)
cd fake-news-checker-front
npm install
npm run dev
```

Arquivos importantes:
- `src/App.tsx` — rotas
- `src/components/` — páginas e componentes
- `src/services/` — chamadas à API
- `src/contexts/AuthContext.tsx` — autenticação

## Trabalhando nos Notebooks

1. Acesse `http://localhost:8888`
2. Navegue até `fake-news-checker-model/src/`
3. Os notebooks seguem a ordem: coleta → curadoria → montagem → treino

## Editando a documentação

```bash
cd docs
npm install
npm start
```

A documentação abrirá em `http://localhost:3000` com hot-reload. Edite os arquivos `.md` em `docs/docs/` e veja as mudanças em tempo real.

### Deploy da documentação

Para publicar no GitHub Pages:

```bash
cd docs
npm run build
```

Ou configure o GitHub Actions para deploy automático (veja a seção de CI/CD).
