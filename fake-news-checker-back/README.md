# CheckAI — Backend (API)

Backend do projeto CheckAI (TCC) — uma API RESTful construída com FastAPI que serve a aplicação de verificação de alegações políticas. Responsável por:

- Autenticação de usuários (cadastro, login, JWT, recuperação de senha)
- Persistência em banco de dados relacional (MySQL)
- Histórico de verificações por usuário (busca, filtros, paginação, detalhe)
- Gerenciamento de conta (perfil, troca de senha, limpeza de histórico, exclusão)
- Verificação de alegações via pipeline multicamada: busca web em tempo real, ranking de fontes, classificador supervisionado (TF-IDF + SVM) e inferência por linguagem natural (NLI)

Este é um dos três subprojetos do CheckAI. O front-end e o pipeline de dados/treinamento de modelo ficam em diretórios separados na raiz do monorepo.

---

## Stack

| Pacote | Finalidade |
|---|---|
| FastAPI | Framework web assíncrono |
| Uvicorn | Servidor ASGI |
| SQLAlchemy | ORM |
| MySQL + PyMySQL | Banco e driver |
| bcrypt | Hashing de senhas |
| python-jose | Geração e validação de JWT |
| Pydantic | Validação de schemas (com EmailStr) |
| scikit-learn + joblib | Carregamento e inferência do classificador SVM |
| requests | Chamadas HTTP (busca Serper, extração de artigos) |
| trafilatura | Extração de texto limpo de páginas web |
| transformers + torch | Modelo NLI para inferência em linguagem natural |
| sentencepiece | Tokenização para o modelo NLI |

---

## Estrutura do Diretório

```text
fake-news-checker-back/
│
├── config.py                    # Configuração centralizada (.env, paths, JWT, BD)
├── database.py                  # Conexão e sessão do SQLAlchemy (MySQL)
├── main.py                      # Ponto de entrada da aplicação (FastAPI)
│
├── db_models/                   # Modelos do banco (SQLAlchemy ORM)
│   ├── user.py                  # Tabela `users`
│   └── verificacao.py           # Tabela `verificacoes`
│
├── models/                      # Schemas Pydantic + modelo de ML (.joblib)
│   └── schemas.py               # Validação de entrada/saída da API
│
├── routes/                      # Endpoints (camada HTTP)
│   ├── auth.py                  # Cadastro, login, perfil, recuperação, conta
│   ├── verificar.py             # Verificação pública (sem login, sem histórico)
│   ├── verificacao.py           # Histórico de verificações (autenticado)
│   ├── classificador.py         # Classificação direta de textos
│   ├── coleta.py                # Pipelines de coleta
│   ├── dados.py                 # Consulta de dados dos pipelines
│   └── health.py                # Saúde da API
│
├── services/                    # Lógica de negócio
│   ├── auth.py                  # Cadastro, autenticação, perfil, senha, conta
│   ├── verificacao.py           # Criação, listagem, resumo, limpeza
│   ├── classificador.py         # Inferência do classificador SVM
│   ├── busca_web.py             # Busca web em tempo real via Serper
│   ├── extrator_artigos.py      # Extração de texto de artigos (trafilatura)
│   ├── nli.py                   # Inferência NLI (transformers)
│   ├── ranking_fontes.py        # Pontuação e filtragem de fontes
│   ├── decisor_veredito.py      # Decisor final conservador (ML + NLI)
│   ├── concordancia_fontes.py   # Pontuação heurística por marcas textuais nas fontes
│   ├── fontes_oficiais.py
│   ├── google_factcheck.py
│   └── rss_noticias.py
│
├── utils/                       # Utilitários reutilizáveis
│   ├── csv_handler.py
│   ├── security.py              # Hashing (bcrypt), JWT, tokens de recuperação
│   └── dependencies.py          # Dependência de autenticação (usuário atual)
│
├── test_nli_standalone.py       # Teste do módulo NLI
├── test_ranking_fontes.py       # Teste do ranking de fontes
├── test_decisor_veredito.py     # Teste do decisor final
│
└── requirements.txt             # Dependências Python
```

A arquitetura é em camadas (rotas → serviços → utilitários), facilitando manutenção e testes.

---

## Fluxo de Verificação

Quando uma alegação é enviada à API, o seguinte pipeline é executado:

```
Alegação (texto) enviada pelo usuário
        ↓
Busca web em tempo real via Serper
        ↓
Ranking e filtragem de fontes por confiabilidade
        ↓
Extração opcional de texto de artigos (trafilatura)
        ↓
Classificador SVM (TF-IDF) — inferência textual
        ↓
NLI — compara alegação × evidências coletadas
        ↓
Decisor final conservador (combina ML + NLI)
        ↓
Resultado: REAL | FALSO | INCONCLUSIVO
```

## Camadas do Sistema

| Camada | Responsabilidade |
|---|---|
| **Classificador SVM** | Classifica a alegação com base no texto usando TF-IDF + SVM treinado no corpus de notícias políticas em português |
| **Busca web (Serper)** | Recupera fontes e evidências em tempo real relacionadas à alegação |
| **Ranking de fontes** | Pontua e prioriza fontes por tipo (checagem, oficial, jornalística, acadêmica) e confiabilidade |
| **NLI** | Avalia, para cada evidência, se ela confirma (*SUPPORTS*), refuta (*REFUTES*) ou não permite conclusão (*NEUTRAL*) em relação à alegação |
| **Decisor final** | Combina o resultado do SVM com a análise NLI de forma conservadora, gerando o veredito final |

## Labels e Resultados

### Resultado final do sistema

| Label | Significado |
|---|---|
| `REAL` | A alegação é considerada verdadeira |
| `FALSO` | A alegação é considerada falsa |
| `INCONCLUSIVO` | Confiança insuficiente para afirmar REAL ou FALSO |

### Labels internos do NLI (por evidência)

Os labels abaixo são **internos** ao módulo NLI e indicam a relação entre cada evidência e a alegação. Eles **não são o resultado final** do sistema — são insumos para o decisor.

| Label NLI | Significado |
|---|---|
| `SUPPORTS` | A evidência confirma a alegação |
| `REFUTES` | A evidência refuta a alegação |
| `NEUTRAL` | A evidência não permite conclusão |

### Campo `decisao_origem`

Indica qual camada foi responsável pelo veredito final. Os valores possíveis são:

| Valor | Significado |
|---|---|
| `fluxo_atual` | O SVM decidiu; o NLI não alterou o resultado |
| `nli_reforcou` | O NLI confirmou e reforçou o resultado do SVM |
| `nli_decidiu_inconclusivo` | Conflito entre SVM e NLI resultou em INCONCLUSIVO |

---

## Como Rodar

### 1. Pré-requisitos

- Python 3.11+
- MySQL Server em execução
- Acesso ao modelo de ML treinado (gerado pelo subprojeto de modelo)
- Chave de API Serper (`SERPER_API_KEY`) para busca web em tempo real

### 2. Configurar o ambiente virtual

Na pasta `fake-news-checker-back/`:

```powershell
python -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

> **Atenção:** os pacotes `transformers` e `torch` podem ser grandes (~1 GB). O primeiro carregamento do modelo NLI também pode ser mais lento que o habitual.

### 3. Criar o banco MySQL

```sql
CREATE DATABASE checkai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

O charset `utf8mb4` é necessário para suportar acentuação em português.

### 4. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do monorepo (ou onde o `config.py` esperar — verifique a configuração atual), com:

```env
# Busca web
SERPER_API_KEY=sua_chave_serper

# Banco de dados
DATABASE_URL=mysql+pymysql://usuario:senha@localhost:3306/checkai

# Autenticação JWT
JWT_SECRET_KEY=sua_chave_secreta
JWT_ALGORITHM=HS256
JWT_EXPIRACAO_MINUTOS=60

# Servidor (opcional)
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=true

# Extração de artigos (0 = desabilitado)
EXTRAIR_ARTIGOS_MAX=0

# Modelo de ML (caminho para o diretório com o arquivo .joblib treinado)
DIR_MODELO=../fake-news-checker-model/modelos
```

Para gerar uma `JWT_SECRET_KEY` segura:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

> **NUNCA versione o arquivo `.env`.** Use `.env.example` como modelo.

### 5. Criar as tabelas no banco

O script `criar_tabelas.py` (na pasta apropriada — verificar localização após a reorganização do monorepo) cria as tabelas a partir dos modelos SQLAlchemy:

```powershell
python criar_tabelas.py
```

Execute uma vez. As tabelas e os dados persistem entre execuções.

### 6. Subir a API

```powershell
python -m uvicorn main:app --reload
```

O comando exato pode variar dependendo de onde você está no terminal e como o módulo está estruturado após a reorganização. Se houver erro de import, confirme o caminho do app FastAPI.

A documentação interativa fica em:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Banco de Dados

### Tabela `users`

| Coluna | Tipo | Observação |
|---|---|---|
| id | INTEGER | Chave primária, auto-incremento |
| nome | VARCHAR(120) | Nome do usuário |
| email | VARCHAR(255) | Único e indexado |
| senha_hash | VARCHAR(255) | Hash bcrypt (nunca em texto puro) |
| criado_em | DATETIME | Data de criação |

### Tabela `verificacoes`

| Coluna | Tipo | Observação |
|---|---|---|
| id | INTEGER | Chave primária, auto-incremento |
| usuario_id | INTEGER | FK para users.id |
| texto_verificado | TEXT | Conteúdo enviado |
| tipo | VARCHAR(20) | texto, imagem, link |
| resultado | VARCHAR(20) | REAL, FALSO ou INCONCLUSIVO |
| confianca | FLOAT | Nível de confiança (0.0 a 1.0) |
| modelo_ativo | VARCHAR(5) | Se foi modelo real ou mock |
| fontes_json | TEXT | Fontes e metadados NLI serializados em JSON |
| criado_em | DATETIME | Data da verificação |

Relacionamento um-para-muitos entre `users` e `verificacoes`, com `cascade="all, delete-orphan"` — ao excluir um usuário, todas as suas verificações são removidas automaticamente.

> Para um schema versionado em produção, considere adotar Alembic no lugar do script manual.

---

## Autenticação (JWT)

A autenticação usa JSON Web Tokens. No login, as credenciais são validadas e um token assinado é retornado. Esse token deve ser enviado em rotas protegidas no header:

```text
Authorization: Bearer <token>
```

A validação acontece pela verificação da assinatura, sem ida ao banco a cada requisição. A proteção é feita por uma dependência reutilizável (`get_usuario_atual`, em `utils/dependencies.py`): qualquer endpoint que a declare passa a exigir token válido. Ausente, inválido ou expirado resulta em `401` automaticamente.

### Decisões de segurança

- **Senhas com hash bcrypt** — salt aleatório por senha; texto puro nunca é armazenado (OWASP A02).
- **Tokens com expiração** — o claim `exp` limita a janela de uso (OWASP A07).
- **Mensagem genérica no login** — e-mail inexistente e senha incorreta retornam a mesma resposta, evitando user enumeration.
- **Proteção de rotas centralizada** — controle de acesso consistente via dependência (OWASP A01).
- **Verificação de propriedade em acessos por id** — endpoints que recebem um `id` (ex.: detalhe de verificação) cruzam sempre com o `usuario_id`, prevenindo IDOR. Quando o recurso não pertence ao usuário, a API responde `404` em vez de `403`, evitando expor a existência do id (OWASP A01).
- **Troca de senha exige a senha atual** — defesa em profundidade contra uso indevido de tokens.
- **Tokens segmentados por propósito** — o token de recuperação de senha carrega `tipo="reset"` e não pode ser usado em lugar de um token de login (e vice-versa).
- **Chave secreta fora do versionamento** — a `JWT_SECRET_KEY` reside apenas no `.env`.

---

## Histórico de Verificações

Cada verificação criada por um usuário autenticado é persistida e associada a ele. O resultado vem da classificação do texto pelo pipeline multicamada, com uma regra adicional de confiança: quando a confiança fica abaixo de um limiar (padrão 0.60), o resultado é marcado como `INCONCLUSIVO` em vez de afirmar `REAL` ou `FALSO`. Isso torna o sistema mais transparente quanto à própria incerteza.

A listagem suporta busca, filtros e paginação via query string:

- `resultado` — filtra por categoria (`REAL`, `FALSO`, `INCONCLUSIVO`)
- `busca` — substring no conteúdo verificado (case-insensitive)
- `pagina` / `por_pagina` — paginação (padrão: página 1, 10 itens; máximo 100 por página)

A resposta usa um envelope de paginação contendo `total`, `pagina`, `por_pagina`, `total_paginas` e `itens`.

---

## Recuperação de Senha

Fluxo em duas etapas:

1. `POST /auth/recuperar-senha` — recebe o e-mail e gera um token de recuperação com validade curta (15 minutos por padrão). Por segurança, responde igualmente para e-mails existentes ou não.
2. `POST /auth/redefinir-senha` — recebe o token + a nova senha; valida o token e atualiza a senha.

> **Nota acadêmica:** o token é retornado diretamente na resposta da primeira etapa para fins de demonstração do TCC. Em produção, ele seria enviado por e-mail e nunca exposto na API. Essa decisão evita a dependência de servidor SMTP no ambiente de demonstração, mantendo o restante do fluxo idêntico ao real.

---

## Endpoints

### Autenticação, perfil e conta

| Método | Rota | Protegida | Descrição |
|---|---|---|---|
| POST | /api/v1/auth/cadastro | Não | Cria um novo usuário |
| POST | /api/v1/auth/login | Não | Valida credenciais e retorna JWT |
| POST | /api/v1/auth/recuperar-senha | Não | Gera token de recuperação |
| POST | /api/v1/auth/redefinir-senha | Não | Redefine a senha via token |
| GET | /api/v1/auth/me | Sim | Dados do usuário autenticado |
| PATCH | /api/v1/auth/me | Sim | Atualiza nome e/ou e-mail |
| POST | /api/v1/auth/me/senha | Sim | Troca a senha (exige senha atual) |
| DELETE | /api/v1/auth/me/historico | Sim | Apaga todas as verificações do usuário |
| DELETE | /api/v1/auth/me | Sim | Exclui a conta e tudo associado |

### Verificação

| Método | Rota | Protegida | Descrição |
|---|---|---|---|
| **POST** | **/api/v1/verificar** | **Não** | **Verifica uma alegação sem login; não salva histórico** |
| POST | /api/v1/verificacoes | Sim | Verifica uma alegação e salva no histórico |
| GET | /api/v1/verificacoes | Sim | Lista com busca, filtros e paginação |
| GET | /api/v1/verificacoes/{id} | Sim | Detalhe de uma verificação |
| GET | /api/v1/verificacoes/resumo | Sim | Estatísticas agregadas do usuário |

### Demais

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/v1/health | Status da API |
| GET | /api/v1/dados | Consulta de dados dos pipelines |
| POST | /api/v1/coleta | Execução de pipelines de coleta |
| POST | /api/v1/classificar | Classificação direta de texto |
| GET | /api/v1/classificar/status | Status e caminho do modelo carregado |

---

## Exemplos de Uso

### Cadastro

```json
POST /api/v1/auth/cadastro
{
  "nome": "Nome Sobrenome",
  "email": "usuario@exemplo.com",
  "senha": "suaSenhaSegura"
}
```

### Login

```json
POST /api/v1/auth/login
{
  "email": "usuario@exemplo.com",
  "senha": "suaSenhaSegura"
}
```

A resposta contém o `access_token` para uso nas próximas requisições.

### Verificar alegação (rota pública, sem login)

```json
POST /api/v1/verificar
{
  "texto": "Lula foi vice presidente de Bolsonaro",
  "tipo": "texto"
}
```

### Criar verificação com histórico (rota protegida)

```json
POST /api/v1/verificacoes
Authorization: Bearer <token>
{
  "texto": "Governo anuncia nova isenção de impostos",
  "tipo": "texto"
}
```

### Exemplo de resposta enriquecida

```json
{
  "resultado": "FALSO",
  "confianca": 0.87,
  "nli_resultado_agregado": "REFUTES",
  "nli_score_agregado": 0.74,
  "nli_votos": {
    "SUPPORTS": 0,
    "REFUTES": 3,
    "NEUTRAL": 1
  },
  "decisao_origem": "nli_reforcou",
  "justificativa_decisao": "Maioria das evidências refuta a alegação com alta confiança.",
  "fontes": [
    {
      "titulo": "Lula e Bolsonaro foram adversários em 2018 e 2022",
      "url": "https://exemplo.com/noticia",
      "nli_label": "REFUTES",
      "nli_score": 0.91,
      "tipo_fonte": "jornalistica",
      "confiabilidade_fonte": "alta",
      "peso_fonte": 1.2
    }
  ]
}
```

### Listar histórico com filtros

```text
GET /api/v1/verificacoes?resultado=FALSO&busca=imposto&pagina=1&por_pagina=10
```

### Recuperar senha

```json
POST /api/v1/auth/recuperar-senha
{ "email": "usuario@exemplo.com" }
```

```json
POST /api/v1/auth/redefinir-senha
{ "token": "<token_recebido>", "nova_senha": "suaNovaSenha123" }
```

---

## Integração com o Modelo de ML

A API carrega o classificador SVM treinado (TF-IDF + SVM, arquivo `.joblib`) no startup da aplicação (via `lifespan` do FastAPI). O classificador opera em modo real quando o arquivo do modelo está presente no caminho configurado; caso contrário, opera em modo mock, gerando resultados determinísticos com base em hash do texto — o mesmo texto sempre retorna o mesmo resultado, o que facilita testes reproduzíveis antes do modelo estar disponível.

Em modo real, a inferência usa `predict` + `predict_proba` para obter rótulo e confiança. A regra de `INCONCLUSIVO` é aplicada na camada de serviço da API, não no modelo. O resultado do SVM é um dos insumos do decisor final, que também considera os votos NLI para gerar o veredito conservador.

---

## Testes

Os testes das camadas principais do pipeline podem ser executados diretamente:

```powershell
python test_nli_standalone.py
python test_ranking_fontes.py
python test_decisor_veredito.py
```

---

## Docker

O projeto pode ser executado em contêiner. Ao montar a imagem ou subir o serviço, observe:

> **Atenção:** o NLI usa `transformers` e `torch`. O modelo utilizado é o `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7` (~550 MB), baixado automaticamente pelo Hugging Face na primeira execução. O build da imagem e o primeiro carregamento podem ser significativamente mais lentos e consumir mais memória do que um backend convencional. Planeje o recurso de memória do contêiner de acordo.

---

## Segurança Operacional

A aplicação aplica diversas práticas baseadas no OWASP Top 10:

- **Security headers** em todas as respostas (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Strict-Transport-Security` em produção, `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`).
- **Rate limiting por IP** — 30 requisições por 60 segundos no padrão, com resposta `429` ao exceder.
- **Trusted Host middleware** — proteção contra ataques de injeção de cabeçalho `Host`.
- **CSP segmentada** — restritiva por padrão, mais permissiva apenas nas rotas de documentação (que carregam recursos de um CDN externo).
- **Documentação interativa desabilitada em produção** — `/docs`, `/redoc` e `/openapi.json` só ficam acessíveis com `API_DEBUG=true`.
- **Handler global de erros** — captura exceções não tratadas, registra o stack trace internamente e retorna mensagem genérica ao cliente, evitando vazamento de informações.

---

## Cuidados

- Não versione `.env` (nem `*.env`) — está no `.gitignore`.
- Senhas dos usuários são sempre bcrypt, nunca em texto puro.
- `JWT_SECRET_KEY` deve ser gerada aleatoriamente e mantida fora do versionamento.
- `SERPER_API_KEY` também deve ficar exclusivamente no `.env` e nunca ser versionada.
- Em produção, ajustar `allow_origins` do CORS para o domínio real do front-end (hoje aberto para facilitar desenvolvimento).
- Em produção, ajustar `allowed_hosts` do TrustedHost para o domínio real.
- A documentação `/docs` deve ficar desabilitada em produção (já automático via `API_DEBUG`).

---

## Finalidade Acadêmica

Este backend faz parte do CheckAI, projeto desenvolvido como Trabalho de Conclusão de Curso (TCC). Não deve ser interpretado como ferramenta definitiva de checagem factual, mas como uma aplicação experimental para estudar:

- Desenvolvimento de APIs seguras (FastAPI, JWT, OWASP);
- Autenticação, persistência relacional e gerenciamento de sessão;
- Classificação supervisionada em português (TF-IDF + SVM);
- Recuperação de evidências em tempo real via busca web;
- Inferência em linguagem natural (NLI) aplicada à verificação de alegações políticas.
