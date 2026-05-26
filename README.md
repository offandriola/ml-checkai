CheckAI — Pipeline de Dados e API para Classificação de Conteúdos Políticos
Repositório: https://github.com/offandriola/ml-checkai
O CheckAI é um projeto acadêmico de TCC voltado à construção de uma base de dados, de um modelo de classificação supervisionada e de uma API RESTful para análise de conteúdos políticos em português. O objetivo é apoiar a identificação inicial de afirmações, manchetes ou notícias curtas com possível caráter verdadeiro ou falso, a partir de dados coletados de fontes públicas, rastreáveis e verificáveis.
O projeto já concluiu as etapas de coleta, curadoria e montagem do primeiro dataset de treino, e iniciou a construção do backend (API com autenticação de usuários e persistência em banco de dados relacional). As próximas etapas envolvem o treinamento e avaliação do modelo supervisionado e sua integração ao endpoint de classificação.

Objetivo do Projeto
O objetivo principal é construir um dataset próprio, confiável e rastreável para treinar um modelo de Machine Learning supervisionado voltado à classificação de conteúdos políticos, disponibilizado por meio de uma API.
A proposta inicial considera uma classificação binária:

VERDADEIRO
FALSO

Além disso, o projeto mantém a possibilidade de evoluir para uma abordagem em dois níveis, com um rótulo complementar para classificar subtipos de falsidade, como:

FALSO_DIRETO
ENGANOSO
FORA_DE_CONTEXTO


Status Atual
FrenteSituaçãoColeta de dados (3 pipelines)✅ ConcluídaCuradoria de dados (3 pipelines)✅ ConcluídaMontagem do dataset de treino v1✅ ConcluídaBackend — API base (FastAPI)✅ EstruturadaBackend — Banco de dados (MySQL)✅ ConfiguradoBackend — Cadastro e Login (JWT)✅ ImplementadosTreinamento do modelo supervisionado🔜 Próxima etapa
Pipelines de dados
PipelineFinalidadeColetaCuradoriapipeline_falso_google_factcheckAfirmações checadas por fact-checkers✅ Concluída✅ Concluídapipeline_verdadeiro_fontes_oficiaisDados oficiais de órgãos públicos✅ Concluída✅ Concluídapipeline_noticias_reaisNotícias reais de portais jornalísticos✅ Concluída✅ Concluída
O primeiro dataset de treino (dataset_final_treino_v1.csv) foi montado e está disponível em dados/dataset_unificado/final/. A próxima etapa é o treinamento e avaliação do modelo baseline.

Estrutura do Projeto
textml-checkai/
│
├── api/                              # Backend FastAPI
│   ├── config.py                     # Configuração centralizada (.env, paths, JWT, BD)
│   ├── database.py                   # Conexão e sessão do SQLAlchemy (MySQL)
│   ├── main.py                       # Ponto de entrada da aplicação (app FastAPI)
│   │
│   ├── db_models/                    # Modelos do banco de dados (SQLAlchemy ORM)
│   │   └── user.py                   # Modelo da tabela `users`
│   │
│   ├── models/                       # Schemas Pydantic e modelo de ML (.pkl)
│   │   └── schemas.py                # Validação de entrada/saída da API
│   │
│   ├── routes/                       # Endpoints (camada HTTP)
│   │   ├── auth.py                   # Cadastro e login de usuários
│   │   ├── classificador.py
│   │   ├── coleta.py
│   │   ├── dados.py
│   │   └── health.py
│   │
│   ├── services/                     # Lógica de negócio
│   │   ├── auth.py                   # Cadastro, busca e autenticação de usuários
│   │   ├── classificador.py
│   │   ├── fontes_oficiais.py
│   │   ├── google_factcheck.py
│   │   └── rss_noticias.py
│   │
│   └── utils/                        # Utilitários reutilizáveis
│       ├── csv_handler.py
│       └── security.py               # Hashing de senha (bcrypt) e JWT
│
├── dados/
│   ├── dataset_unificado/
│   │   ├── curated/
│   │   └── final/
│   │
│   ├── pipeline_falso_google_factcheck/
│   │   ├── raw/
│   │   ├── curated/
│   │   └── final/
│   │
│   ├── pipeline_verdadeiro_fontes_oficiais/
│   │   ├── raw/
│   │   ├── curated/
│   │   └── final/
│   │
│   └── pipeline_noticias_reais/
│       ├── raw/
│       ├── curated/
│       └── final/
│
├── src/                              # Notebooks de coleta, curadoria e montagem
│   ├── coleta_google_check.ipynb
│   ├── coleta_fontes_oficiais.ipynb
│   ├── coleta_rss_noticias_reais.ipynb
│   ├── curadoria_google_factcheck.ipynb
│   ├── curadoria_fontes_oficiais.ipynb
│   ├── curadoria_rss_noticias_reais.ipynb
│   └── montagem_dataset_final_v1.ipynb
│
├── criar_tabelas.py                  # Script para criar as tabelas no banco
├── .env.example
├── .gitignore
├── README.md
└── requirements.txt

Visão Geral dos Pipelines
1. Pipeline de falsas/checadas
Pasta:
textdados/pipeline_falso_google_factcheck/
Notebook:
textsrc/coleta_google_check.ipynb
Esse pipeline utiliza a Google Fact Check Tools API para coletar afirmações já verificadas por organizações de checagem. Ele é usado principalmente para montar a base bruta de conteúdos falsos, enganosos, imprecisos ou distorcidos.
A coleta atual utiliza termos políticos como:

urnas eletrônicas
fraude nas urnas
TSE
eleições 2022
eleições 2026
voto impresso
Lula
Bolsonaro
Alexandre de Moraes
INSS
Pix imposto
anistia Bolsonaro
STF redes sociais
Congresso Nacional

Os dados brutos são salvos em:
textdados/pipeline_falso_google_factcheck/raw/
Campos coletados incluem:

termo de busca
texto da afirmação
data da claim
fonte da checagem
URL da checagem
avaliação original
data da publicação
URL da consulta
data da coleta


2. Pipeline de verdadeiras por fontes oficiais
Pasta:
textdados/pipeline_verdadeiro_fontes_oficiais/
Notebook:
textsrc/coleta_fontes_oficiais.ipynb
Esse pipeline coleta dados diretamente de fontes oficiais, com foco em fatos institucionais verificáveis.
Fontes implementadas até o momento:
FonteSituaçãoObservaçãoCâmara dos Deputados✅ ImplementadaProposições legislativasSenado Federal✅ ImplementadaMatérias legislativasTSE✅ ImplementadaCandidatos 2024 (dados eleitorais)Portal da Transparência✅ ImplementadaEmendas parlamentares, contratos e despesas públicasSTF✅ ImplementadaNotícias oficiais
Os dados brutos são salvos em:
textdados/pipeline_verdadeiro_fontes_oficiais/raw/
A Câmara e o Senado geram arquivos brutos separados, pois possuem estruturas de dados diferentes. A unificação será feita posteriormente na etapa de curadoria.

3. Pipeline de notícias reais
Pasta:
textdados/pipeline_noticias_reais/
Notebook:
textsrc/coleta_rss_noticias_reais.ipynb
Esse pipeline coleta notícias de portais jornalísticos por meio de feeds RSS. O objetivo principal não é definir se uma notícia é verdadeira ou falsa de forma imediata, mas capturar linguagem jornalística política real, contexto e vocabulário natural usado em notícias brasileiras.
Fontes configuradas até o momento:
PortalCategoriaObservaçãoAgência BrasilPolíticaFonte pública e institucionalBBC BrasilGeralFiltrada por termos políticos na curadoriaG1 PolíticaPolíticaFeed segmentado em políticaUOL NotíciasGeralFiltrada por termos políticos na curadoriaPoder360PolíticaFonte jornalística com foco políticoFolha de S.Paulo (Poder)PolíticaEditoria de políticaCorreio BraziliensePolíticaCobertura política nacionalVeja PolíticaPolíticaEditoria de políticaMetrópolesPolíticaCobertura política nacionalCartaCapitalPolíticaCobertura política nacionalCongresso em FocoPolíticaCobertura do Congresso Nacional
Os dados brutos são salvos em:
textdados/pipeline_noticias_reais/raw/
Campos coletados incluem:

portal
categoria
título
link
resumo
data de publicação
URL do feed
data da coleta


Conceito de Camadas dos Dados
O projeto usa uma organização em três camadas:
textraw → curated → final
raw
Dados brutos, exatamente como foram coletados das APIs, feeds RSS ou fontes externas. Essa camada preserva o histórico da coleta.
curated
Dados limpos e padronizados. Os notebooks de curadoria aplicam:

remoção de HTML
padronização de datas para YYYY-MM-DD
remoção de duplicatas
filtragem temática (ex.: notícias gerais filtradas por termos políticos)
normalização de textos e nomes de fontes
mapeamento de avaliações para categorias padronizadas (FALSO, ENGANOSO, VERDADEIRO, etc.)
criação de colunas auxiliares (flag_texto_longo, origem_texto, avaliacao_categoria, etc.)

Cada execução gera um arquivo com timestamp no nome, preservando o histórico de curadorias.
final
Dataset consolidado, com schema uniforme e rótulos definitivos, pronto para treinamento supervisionado.

Dataset Final de Treino v1
Caminho: dados/dataset_unificado/final/dataset_final_treino_v1.csv
Notebook de montagem: src/montagem_dataset_final_v1.ipynb
Composição
AtributoValorTotal de registros800Positivos (label = 1)400Negativos (label = 0)400Seed de amostragem42Faixa de tamanho dos textos50–400 caracteres
Distribuição por label_detalhe
RótuloClasseQtdNOTICIA_REALPositivo374GFC_VERDADEIROPositivo26FALSONegativo260ENGANOSONegativo120FORA_DE_CONTEXTONegativo20
Os 26 registros GFC_VERDADEIRO são claims verificados como verdadeiros pelo Google Fact Check — mesma fonte e formato dos registros falsos, o que reduz o risco de o modelo aprender o estilo da fonte em vez da veracidade.
Schema
ColunaDescriçãoid_registroUUID único herdado do pipeline de origemtexto_principalTexto da afirmação ou manchete (50–400 chars)label1 = positivo/real, 0 = negativo/falsolabel_detalheCategoria específica (NOTICIA_REAL, GFC_VERDADEIRO, FALSO, ENGANOSO, FORA_DE_CONTEXTO)pipeline_origemPipeline de origem (google_factcheck ou noticias_reais)portal_origemFonte/portal do registro (ex.: AOS_FATOS, G1_POLITICA)origem_textoComo o texto foi construído (titulo, titulo_resumo, afirmacao_checada)tamanho_charsComprimento em caracteres do texto_principaldata_publicacaoData de publicação original (YYYY-MM-DD, pode ser vazio)url_origemURL rastreável da origem
Sobre as Fontes Oficiais nesta versão
O pipeline de fontes oficiais coletou e curou 10.595 registros de Câmara, Senado, STF, TSE e Portal da Transparência. Esse material não foi incluído no dataset v1 de treino por uma decisão metodológica deliberada:
os textos de contratos públicos, emendas parlamentares, despesas orçamentárias e fichas de candidatos eleitorais têm estrutura gramatical muito distinta de claims políticos e manchetes jornalísticas. Incluí-los na classe positiva introduziria um forte viés de formato — o modelo aprenderia a distinguir tipos de documento em vez de aprender a distinguir veracidade.
Esses dados permanecerão disponíveis como base de evidência e referência para versões futuras do sistema, especialmente para enriquecer contexto factual na verificação de afirmações.

Padrão de Salvamento dos Arquivos Brutos
Cada execução de coleta salva um novo CSV com data e hora no nome do arquivo.
Exemplo:
textgoogle_factcheck_raw_2026-05-10_02-42-39.csv
rss_noticias_reais_raw_2026-05-10_01-58-57.csv
senado_materias_raw_2026-05-10_02-28-13.csv
Esse padrão evita sobrescrever coletas antigas e melhora a rastreabilidade do dataset.

Backend — API CheckAI
A partir do dataset, o projeto expõe uma API RESTful construída em FastAPI, responsável por servir os dados, executar pipelines, classificar textos e gerenciar usuários. A API segue uma arquitetura em camadas (rotas → serviços → utilitários) e incorpora boas práticas de segurança baseadas no OWASP Top 10.
Arquitetura em Camadas
A pasta api/ separa responsabilidades de forma clara:
CamadaPastaResponsabilidadeRotasapi/routes/Recebe a requisição HTTP, valida e devolve a respostaServiçosapi/services/Lógica de negócio e acesso ao bancoUtilitáriosapi/utils/Funções reutilizáveis (hashing, JWT, manipulação de CSV)Modelos do bancoapi/db_models/Definição das tabelas via SQLAlchemy ORMSchemasapi/models/schemas.pyValidação de entrada/saída via Pydantic
Essa separação facilita testes, manutenção e a defesa acadêmica da organização do código.
Stack do Backend

FastAPI — framework web assíncrono
Uvicorn — servidor ASGI
SQLAlchemy — ORM para acesso ao banco
MySQL — banco de dados relacional
PyMySQL — driver de conexão Python ↔ MySQL
bcrypt — hashing de senhas
python-jose — geração e validação de tokens JWT
Pydantic — validação de dados (com EmailStr para e-mails)

Banco de Dados (MySQL)
O backend persiste os usuários em um banco MySQL chamado checkai.
Criação do banco
Com o MySQL Server instalado e em execução, crie o banco (via MySQL Workbench ou linha de comando):
sqlCREATE DATABASE checkai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

O charset utf8mb4 é usado para suportar corretamente acentuação e caracteres especiais em português.

Modelo de dados — tabela users
ColunaTipoObservaçãoidINTEGERChave primária, auto-incrementonomeVARCHAR(120)Nome do usuárioemailVARCHAR(255)Único e indexado (usado no login)senha_hashVARCHAR(255)Hash bcrypt da senha (nunca em texto puro)criado_emDATETIMEData de criação do registro
Criação das tabelas
O script criar_tabelas.py, na raiz do projeto, cria automaticamente as tabelas a partir dos modelos SQLAlchemy:
bashpython criar_tabelas.py
Execute-o uma vez após configurar o .env e criar o banco. As tabelas e os dados persistem entre reinicializações da máquina — não é necessário recriá-las a cada uso.

Evolução futura: para versionamento profissional do schema, considera-se a adoção do Alembic (migrations) em substituição ao script manual.

Autenticação (JWT)
A autenticação utiliza JSON Web Tokens (JWT). No login, as credenciais são validadas e um token assinado é retornado. Esse token deve ser enviado nas requisições a rotas protegidas no header Authorization: Bearer <token>. A validação ocorre pela verificação da assinatura, sem necessidade de consultar o banco a cada requisição.
Decisões de segurança adotadas:

Senhas com hash bcrypt — com salt aleatório por senha; o texto puro nunca é armazenado (OWASP A02).
Token com expiração — o claim exp limita a janela de uso de cada token (OWASP A07).
Mensagem genérica no login — e-mail inexistente e senha incorreta retornam a mesma mensagem, evitando user enumeration.
Chave secreta fora do versionamento — a JWT_SECRET_KEY reside apenas no .env.

Endpoints de autenticação
MétodoRotaDescriçãoPOST/api/v1/auth/cadastroCria um novo usuário (senha protegida por hash)POST/api/v1/auth/loginValida credenciais e retorna um token JWT
Exemplo de corpo para cadastro:
json{
  "nome": "Nome Sobrenome",
  "email": "usuario@exemplo.com",
  "senha": "suaSenhaSegura"
}
Exemplo de corpo para login:
json{
  "email": "usuario@exemplo.com",
  "senha": "suaSenhaSegura"
}
Outros Endpoints
MétodoRotaDescriçãoGET/api/v1/healthVerifica o status da APIGET/api/v1/dadosConsulta de dados dos pipelinesPOST/api/v1/coletaExecução de pipelines de coletaPOST/api/v1/classificarClassificação de um texto
Como Executar a API
Com o ambiente virtual ativado e as dependências instaladas:
bashpython -m uvicorn api.main:app --reload
A documentação interativa (Swagger UI) fica disponível, em modo debug, em:
texthttp://localhost:8000/docs
E a documentação alternativa (ReDoc) em:
texthttp://localhost:8000/redoc

Por segurança (OWASP A05), a documentação é desabilitada automaticamente quando a API roda em modo de produção.


Tecnologias Utilizadas
O projeto utiliza atualmente:
Dados e coleta

Python
Pandas
Requests
Feedparser
Python Dotenv
Jupyter Notebook
APIs públicas e Feeds RSS

Backend / API

FastAPI
Uvicorn
SQLAlchemy
MySQL / PyMySQL
bcrypt
python-jose (JWT)
Pydantic

Infraestrutura

Git e GitHub

Futuramente, o projeto poderá utilizar:

Scikit-learn
TF-IDF
Regressão Logística
LinearSVC
Métricas como acurácia, precisão, recall e F1-score


Configuração do Ambiente
É recomendado utilizar um ambiente virtual.
Windows
bashpython -m venv .venv
Ativar no PowerShell:
bash.\.venv\Scripts\Activate.ps1
Ou no Prompt de Comando:
bash.venv\Scripts\activate
Atualizar o pip:
bashpython -m pip install --upgrade pip
Instalar dependências:
bashpip install -r requirements.txt
macOS
bashpython3 -m venv .venv
source .venv/bin/activate
python3 -m pip install --upgrade pip
pip install -r requirements.txt

No macOS, dependendo da instalação do Python, pode ser necessário usar python3 e pip3 no lugar de python e pip.

Passos adicionais para o backend
Após instalar as dependências:

Tenha o MySQL Server instalado e em execução.
Crie o banco checkai (ver seção Banco de Dados).
Configure as variáveis de ambiente no .env (ver seção abaixo).
Crie as tabelas:

bash   python criar_tabelas.py

Suba a API:

bash   python -m uvicorn api.main:app --reload

Variáveis de Ambiente
As variáveis sensíveis ficam em um arquivo .env na raiz do projeto, que nunca deve ser versionado. O arquivo .env.example serve como modelo.
Exemplo de conteúdo do .env (utilize valores próprios):
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
Para gerar uma chave secreta forte para o JWT:
bashpython -c "import secrets; print(secrets.token_hex(32))"
A chave da Google Fact Check Tools API permanece em arquivo próprio (ver seção a seguir).

Configuração da Chave da Google Fact Check Tools API
O pipeline do Google Fact Check precisa de uma chave de API.
Crie um arquivo chamado:
textgoogle-factcheck-api-key.env
Na raiz do projeto, com o seguinte conteúdo:
envGOOGLE_FACTCHECK_API_KEY=SUA_CHAVE_AQUI
O arquivo .env.example serve apenas como modelo:
envGOOGLE_FACTCHECK_API_KEY=COLE_SUA_CHAVE_AQUI

Nunca envie o arquivo google-factcheck-api-key.env para o GitHub.


Como Executar os Notebooks
Após instalar as dependências, abra o projeto no VS Code ou execute:
bashjupyter notebook
Os notebooks ficam em:
textsrc/
Ordem recomendada de execução completa do pipeline:
text── Coleta ──────────────────────────────────────────────────
1. src/coleta_google_check.ipynb
2. src/coleta_fontes_oficiais.ipynb
3. src/coleta_rss_noticias_reais.ipynb

── Curadoria ───────────────────────────────────────────────
4. src/curadoria_google_factcheck.ipynb
5. src/curadoria_fontes_oficiais.ipynb
6. src/curadoria_rss_noticias_reais.ipynb

── Montagem do dataset ─────────────────────────────────────
7. src/montagem_dataset_final_v1.ipynb
Os notebooks de curadoria sempre usam o arquivo raw mais recente de cada pipeline. O notebook de montagem sempre usa o arquivo curated mais recente de cada pipeline.

Metodologia de Confiabilidade do Dataset
A confiabilidade do dataset será construída a partir de quatro princípios:

Fonte rastreável: cada registro deve manter URL, origem ou endpoint de coleta.
Separação por origem: dados de fact-checking, dados oficiais e notícias reais ficam em pipelines diferentes.
Preservação do dado bruto: cada coleta gera um arquivo bruto novo, sem sobrescrever coletas anteriores.
Curadoria posterior: os registros só serão considerados prontos após limpeza, padronização e revisão.

Essa estratégia evita depender de dados gerados artificialmente e permite justificar academicamente a origem dos registros usados no treinamento.

Fluxo Planejado do Projeto
textColeta dos dados brutos
        ↓
Armazenamento em raw/
        ↓
Validação das fontes
        ↓
Limpeza e padronização
        ↓
Criação das camadas curated/
        ↓
Geração do dataset final
        ↓
Treinamento do modelo supervisionado
        ↓
Avaliação do desempenho
        ↓
Integração do modelo à API (endpoint de classificação)
        ↓
Uso do modelo para classificação via API

Próximos Passos

Treinar o modelo baseline com TF-IDF + Regressão Logística
Avaliar o baseline com acurácia, precisão, recall, F1-score e matriz de confusão
Integrar o modelo treinado ao endpoint /api/v1/classificar
Proteger rotas sensíveis da API exigindo token JWT válido
Expandir a base positiva com mais notícias reais curtas de fontes diversas
Buscar mais claims verificados como verdadeiros em fontes de fact-checking (aumentar os 26 atuais)
Montar o dataset_final_treino_v2 com maior volume e melhor equilíbrio de distribuição de tamanhos
Investigar uso das Fontes Oficiais como base de evidência/referência em versões futuras


Cuidados de Segurança
Este projeto utiliza chaves de API, credenciais de banco de dados e tokens de autenticação. Portanto:

Não envie arquivos .env (nem *.env) ao GitHub
Não exponha chaves de API, senhas de banco ou a JWT_SECRET_KEY em notebooks, scripts ou commits
Use .env.example apenas como modelo, sempre com valores fictícios
Senhas de usuários são sempre armazenadas como hash bcrypt, nunca em texto puro
Gere a JWT_SECRET_KEY de forma aleatória e mantenha-a fora do versionamento
Restrinja a chave da Google API para a Fact Check Tools API quando possível
Revogue e gere uma nova chave/segredo caso seja exposto acidentalmente
Evite versionar grandes volumes de dados brutos se isso dificultar o repositório


Finalidade Acadêmica
O CheckAI é um projeto desenvolvido com finalidade acadêmica para o Trabalho de Conclusão de Curso. O sistema não deve ser interpretado como uma ferramenta definitiva de checagem factual, mas como uma aplicação experimental para estudar coleta de dados, curadoria de dataset, aprendizado supervisionado, desenvolvimento de APIs seguras e classificação de textos políticos em português.