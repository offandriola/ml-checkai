CheckAI — Backend (API)
Backend do projeto CheckAI (TCC) — uma API RESTful construída com FastAPI que serve a aplicação de classificação de conteúdos políticos. Responsável por:

Autenticação de usuários (cadastro, login, JWT, recuperação de senha)
Persistência em banco de dados relacional (MySQL)
Histórico de verificações por usuário (busca, filtros, paginação, detalhe)
Gerenciamento de conta (perfil, troca de senha, limpeza de histórico, exclusão)
Integração com o modelo de Machine Learning treinado pelo time

Este é um dos três subprojetos do CheckAI. O front-end e o pipeline de dados / treinamento de modelo ficam em diretórios separados na raiz do monorepo.

Stack

FastAPI — framework web assíncrono
Uvicorn — servidor ASGI
SQLAlchemy — ORM
MySQL + PyMySQL — banco e driver
bcrypt — hashing de senhas
python-jose — geração e validação de JWT
Pydantic — validação de schemas (com EmailStr)
scikit-learn + joblib — carregamento e inferência do modelo de ML


Estrutura do diretório
textfake-news-checker-back/
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
│   ├── verificacao.py           # Histórico de verificações
│   ├── classificador.py         # Classificação de textos
│   ├── coleta.py                # Pipelines de coleta
│   ├── dados.py                 # Consulta de dados dos pipelines
│   └── health.py                # Saúde da API
│
├── services/                    # Lógica de negócio
│   ├── auth.py                  # Cadastro, autenticação, perfil, senha, conta
│   ├── verificacao.py           # Criação, listagem, resumo, limpeza
│   ├── classificador.py         # Inferência do modelo
│   ├── fontes_oficiais.py
│   ├── google_factcheck.py
│   └── rss_noticias.py
│
├── utils/                       # Utilitários reutilizáveis
│   ├── csv_handler.py
│   ├── security.py              # Hashing (bcrypt), JWT, tokens de recuperação
│   └── dependencies.py          # Dependência de autenticação (usuário atual)
│
└── requirements.txt             # Dependências Python
A arquitetura é em camadas (rotas → serviços → utilitários), facilitando manutenção e testes.

Como rodar
1. Pré-requisitos

Python 3.11+
MySQL Server em execução
Acesso ao modelo de ML treinado (gerado pelo subprojeto de modelo)

2. Configurar o ambiente virtual
Na pasta fake-news-checker-back/:
powershellpython -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
3. Criar o banco MySQL
sqlCREATE DATABASE checkai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
O charset utf8mb4 é necessário para suportar acentuação em português.
4. Configurar variáveis de ambiente
Crie um arquivo .env na raiz do monorepo (ou onde o config.py esperar — verifique a configuração atual), com:
env# Banco de dados
DATABASE_URL=mysql+pymysql://usuario:senha@localhost:3306/checkai

# Autenticação JWT
JWT_SECRET_KEY=sua_chave_secreta_aqui
JWT_ALGORITHM=HS256
JWT_EXPIRACAO_MINUTOS=60

# Servidor (opcional)
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=true
Para gerar uma JWT_SECRET_KEY segura:
powershellpython -c "import secrets; print(secrets.token_hex(32))"

NUNCA versione o arquivo .env. Use .env.example como modelo.

5. Criar as tabelas no banco
O script criar_tabelas.py (na pasta apropriada — verificar localização após a reorganização do monorepo) cria as tabelas a partir dos modelos SQLAlchemy:
powershellpython criar_tabelas.py
Execute uma vez. As tabelas e os dados persistem entre execuções.
6. Subir a API
powershellpython -m uvicorn main:app --reload

O comando exato pode variar dependendo de onde você está no terminal e como o módulo está estruturado após a reorganização. Se houver erro de import, confirme o caminho do app FastAPI.

A documentação interativa fica em:

Swagger UI: http://localhost:8000/docs
ReDoc: http://localhost:8000/redoc


Banco de Dados
Tabela users
ColunaTipoObservaçãoidINTEGERChave primária, auto-incrementonomeVARCHAR(120)Nome do usuárioemailVARCHAR(255)Único e indexadosenha_hashVARCHAR(255)Hash bcrypt (nunca em texto puro)criado_emDATETIMEData de criação
Tabela verificacoes
ColunaTipoObservaçãoidINTEGERChave primária, auto-incrementousuario_idINTEGERFK para users.idtexto_verificadoTEXTConteúdo enviadotipoVARCHAR(20)texto, imagem, linkresultadoVARCHAR(20)REAL, FALSO ou INCONCLUSIVOconfiancaFLOATNível de confiança (0.0 a 1.0)modelo_ativoVARCHAR(5)Se foi modelo real ou mockcriado_emDATETIMEData da verificação
Relacionamento um-para-muitos entre users e verificacoes, com cascade="all, delete-orphan" — ao excluir um usuário, todas as suas verificações são removidas automaticamente.

Para um schema versionado em produção, considere adotar Alembic no lugar do script manual.


Autenticação (JWT)
A autenticação usa JSON Web Tokens. No login, as credenciais são validadas e um token assinado é retornado. Esse token deve ser enviado em rotas protegidas no header:
textAuthorization: Bearer <token>
A validação acontece pela verificação da assinatura, sem ida ao banco a cada requisição. A proteção é feita por uma dependência reutilizável (get_usuario_atual, em utils/dependencies.py): qualquer endpoint que a declare passa a exigir token válido. Ausente, inválido ou expirado resulta em 401 automaticamente.
Decisões de segurança

Senhas com hash bcrypt — salt aleatório por senha; texto puro nunca é armazenado (OWASP A02).
Tokens com expiração — o claim exp limita a janela de uso (OWASP A07).
Mensagem genérica no login — e-mail inexistente e senha incorreta retornam a mesma resposta, evitando user enumeration.
Proteção de rotas centralizada — controle de acesso consistente via dependência (OWASP A01).
Verificação de propriedade em acessos por id — endpoints que recebem um id (ex.: detalhe de verificação) cruzam sempre com o usuario_id, prevenindo IDOR. Quando o recurso não pertence ao usuário, a API responde 404 em vez de 403, evitando expor a existência do id (OWASP A01).
Troca de senha exige a senha atual — defesa em profundidade contra uso indevido de tokens.
Tokens segmentados por propósito — o token de recuperação de senha carrega tipo="reset" e não pode ser usado em lugar de um token de login (e vice-versa).
Chave secreta fora do versionamento — a JWT_SECRET_KEY reside apenas no .env.


Histórico de Verificações
Cada verificação criada por um usuário autenticado é persistida e associada a ele. O resultado vem da classificação do texto pelo modelo de ML, com uma regra adicional de confiança: quando a confiança fica abaixo de um limiar (padrão 0.60), o resultado é marcado como INCONCLUSIVO em vez de afirmar REAL ou FALSO. Isso torna o sistema mais transparente quanto à própria incerteza.
A listagem suporta busca, filtros e paginação via query string:

resultado — filtra por categoria (REAL, FALSO, INCONCLUSIVO)
busca — substring no conteúdo verificado (case-insensitive)
pagina / por_pagina — paginação (padrão: página 1, 10 itens; máximo 100 por página)

A resposta usa um envelope de paginação contendo total, pagina, por_pagina, total_paginas e itens.

Recuperação de Senha
Fluxo em duas etapas:

POST /auth/recuperar-senha — recebe o e-mail e gera um token de recuperação com validade curta (15 minutos por padrão). Por segurança, responde igualmente para e-mails existentes ou não.
POST /auth/redefinir-senha — recebe o token + a nova senha; valida o token e atualiza a senha.


Nota acadêmica: o token é retornado diretamente na resposta da primeira etapa para fins de demonstração do TCC. Em produção, ele seria enviado por e-mail e nunca exposto na API. Essa decisão evita a dependência de servidor SMTP no ambiente de demonstração, mantendo o restante do fluxo idêntico ao real.


Endpoints
Autenticação, perfil e conta
MétodoRotaProtegidaDescriçãoPOST/api/v1/auth/cadastroNãoCria um novo usuárioPOST/api/v1/auth/loginNãoValida credenciais e retorna JWTPOST/api/v1/auth/recuperar-senhaNãoGera token de recuperaçãoPOST/api/v1/auth/redefinir-senhaNãoRedefine a senha via tokenGET/api/v1/auth/meSimDados do usuário autenticadoPATCH/api/v1/auth/meSimAtualiza nome e/ou e-mailPOST/api/v1/auth/me/senhaSimTroca a senha (exige senha atual)DELETE/api/v1/auth/me/historicoSimApaga todas as verificações do usuárioDELETE/api/v1/auth/meSimExclui a conta e tudo associado
Verificações (histórico)
MétodoRotaProtegidaDescriçãoPOST/api/v1/verificacoesSimClassifica um texto e salva no históricoGET/api/v1/verificacoesSimLista com busca, filtros e paginaçãoGET/api/v1/verificacoes/{id}SimDetalhe de uma verificaçãoGET/api/v1/verificacoes/resumoSimEstatísticas agregadas do usuário
Demais
MétodoRotaDescriçãoGET/api/v1/healthStatus da APIGET/api/v1/dadosConsulta de dados dos pipelinesPOST/api/v1/coletaExecução de pipelines de coletaPOST/api/v1/classificarClassificação direta de texto

Exemplos de uso
Cadastro
jsonPOST /api/v1/auth/cadastro
{
  "nome": "Nome Sobrenome",
  "email": "usuario@exemplo.com",
  "senha": "suaSenhaSegura"
}
Login
jsonPOST /api/v1/auth/login
{
  "email": "usuario@exemplo.com",
  "senha": "suaSenhaSegura"
}
A resposta contém o access_token para uso nas próximas requisições.
Criar verificação (rota protegida)
jsonPOST /api/v1/verificacoes
Authorization: Bearer <token>
{
  "texto": "Governo anuncia nova isenção de impostos",
  "tipo": "texto"
}
Listar histórico com filtros
textGET /api/v1/verificacoes?resultado=FALSO&busca=imposto&pagina=1&por_pagina=10
Recuperar senha
jsonPOST /api/v1/auth/recuperar-senha
{ "email": "usuario@exemplo.com" }
jsonPOST /api/v1/auth/redefinir-senha
{ "token": "<token_recebido>", "nova_senha": "suaNovaSenha123" }

Integração com o Modelo de ML
A API carrega o modelo de Machine Learning treinado (.joblib) no startup da aplicação (via lifespan do FastAPI). O classificador opera em modo real quando o arquivo do modelo está presente no caminho configurado; caso contrário, opera em modo mock, gerando resultados aleatórios para permitir desenvolvimento e testes do front antes do modelo estar disponível.
Em produção (modo real), a inferência usa predict + predict_proba para obter rótulo e confiança. A regra de INCONCLUSIVO descrita acima é aplicada na camada de serviço da API, não no modelo.

Segurança operacional
A aplicação aplica diversas práticas baseadas no OWASP Top 10:

Security headers em todas as respostas (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Strict-Transport-Security em produção, Content-Security-Policy, Referrer-Policy, Permissions-Policy).
Rate limiting por IP — 30 requisições por 60 segundos no padrão, com resposta 429 ao exceder.
Trusted Host middleware — proteção contra ataques de injeção de cabeçalho Host.
CSP segmentada — restritiva por padrão, mais permissiva apenas nas rotas de documentação (que carregam recursos de um CDN externo).
Documentação interativa desabilitada em produção — /docs, /redoc e /openapi.json só ficam acessíveis com API_DEBUG=true.
Handler global de erros — captura exceções não tratadas, registra o stack trace internamente e retorna mensagem genérica ao cliente, evitando vazamento de informações.


Cuidados

Não versione .env (nem *.env) — está no .gitignore.
Senhas dos usuários são sempre bcrypt, nunca em texto puro.
JWT_SECRET_KEY deve ser gerada aleatoriamente e mantida fora do versionamento.
Em produção, ajustar allow_origins do CORS para o domínio real do front-end (hoje aberto para facilitar desenvolvimento).
Em produção, ajustar allowed_hosts do TrustedHost para o domínio real.
A documentação /docs deve ficar desabilitada em produção (já automático via API_DEBUG).


Finalidade Acadêmica
Este backend faz parte do CheckAI, projeto desenvolvido como Trabalho de Conclusão de Curso. Não deve ser interpretado como ferramenta definitiva de checagem factual, mas como uma aplicação experimental para estudar desenvolvimento de APIs seguras, autenticação, persistência relacional e integração com modelos de aprendizado supervisionado em português.