# CheckAI — Pipeline de Dados e API para Classificação de Conteúdos Políticos

O **CheckAI** é um projeto acadêmico de TCC voltado à construção de uma base de dados, de um modelo de classificação supervisionada e de uma **API RESTful** para análise de conteúdos políticos em português. O objetivo é apoiar a identificação inicial de afirmações, manchetes ou notícias curtas com possível caráter **verdadeiro** ou **falso**, a partir de dados coletados de fontes públicas, rastreáveis e verificáveis.

Este repositório contém os três principais componentes do projeto:
*   `fake-news-checker-front`: A interface de usuário (frontend).
*   `fake-news-checker-back`: A API RESTful (backend) construída com FastAPI.
*   `fake-news-checker-model`: Os notebooks para coleta de dados e treinamento do modelo de Machine Learning.

---

## Como Rodar o Projeto com Docker

A maneira mais fácil e recomendada de executar o projeto completo é usando Docker e Docker Compose, que garantem um ambiente consistente para todos os desenvolvedores.

### 1. Pré-requisitos

Antes de começar, garanta que você tenha os seguintes softwares instalados:

*   **Docker e Docker Compose:** Essencial para criar e orquestrar os containers. Instale aqui.
*   **GNU Make:** Usado para simplificar os comandos do Docker.

    *   **Windows:** Se você não tiver o `make` instalado, pode usar o `winget` no PowerShell (como administrador):
        ```powershell
        winget install GnuWin32.Make
        ```
        Após a instalação, feche e reabra seu terminal.
    *   **macOS:** O `make` geralmente vem com as Ferramentas de Linha de Comando do Xcode. Execute `xcode-select --install`.
    *   **Linux:** Instale via gerenciador de pacotes. Ex: `sudo apt-get install build-essential` (Debian/Ubuntu) ou `sudo dnf groupinstall "Development Tools"` (Fedora/CentOS).

### 2. Configuração Inicial

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd ml-checkai
    ```

2.  **Crie o arquivo de ambiente:**
    O projeto usa um arquivo `.env` na raiz para configurar as variáveis de ambiente. Copie o arquivo de exemplo:
    ```bash
    # No Windows (PowerShell):
    cp .env.example .env

    # No macOS/Linux:
    cp .env.example .env
    ```
    **Importante:** Abra o arquivo `.env` e preencha a variável `JWT_SECRET_KEY`. Você pode gerar uma chave segura executando o seguinte comando no seu terminal:
    ```bash
    python -c "import secrets; print(secrets.token_hex(32))"
    ```
    Copie e cole o resultado no seu arquivo `.env`.

### 3. Subindo o Ambiente

Com tudo configurado, abra um terminal na raiz do projeto e execute:

```bash
make up
```

Este comando irá construir as imagens Docker, baixar o MySQL e iniciar todos os serviços em background. Aguarde alguns minutos na primeira execução.

### 4. Acessando os Serviços

Após a inicialização, os serviços estarão disponíveis nos seguintes endereços:

*   **Frontend:** http://localhost:5173
*   **Backend (API Docs):** http://localhost:8000/docs
*   **Notebooks (Jupyter Lab):** http://localhost:8888
*   **Banco de Dados (MySQL):** Acessível em `localhost:3306` por um cliente de banco de dados (DBeaver, DataGrip, etc.). Use as credenciais do seu arquivo `.env`.

### Comandos Úteis do Makefile

O `Makefile` oferece atalhos para gerenciar o ambiente Docker:

*   `make up`: Sobe todos os serviços em background.
*   `make down`: Para e remove os containers e redes. O volume do banco de dados é preservado. Para apagar também os dados, use `docker-compose down -v`.
*   `make stop`: Apenas para os containers, sem removê-los.
*   `make logs`: Exibe os logs de todos os serviços em tempo real.
*   `make logs-backend`: Exibe os logs apenas do backend.
*   `make shell-backend`: Abre um terminal interativo dentro do container do backend. Útil para depuração.
*   `make migrate`: Executa o script que cria as tabelas no banco de dados.

Para ver todos os comandos disponíveis, execute `make help`.

### Troubleshooting

#### Erro: `bind: Only one usage of each socket address... is normally permitted.` ao rodar `make up`

Este erro acontece quando a porta `3306` (padrão do MySQL) já está sendo usada por outro processo em sua máquina, geralmente uma instalação local do MySQL Server que não está rodando via Docker.

**Solução Rápida:**

1.  Abra o arquivo `.env` na raiz do projeto.
2.  Altere a porta do MySQL que será exposta na sua máquina para uma que esteja livre, como `3307`:

    ```env
    MYSQL_PORT=3307
    ```
3.  Rode `make up` novamente.

Após essa alteração, para se conectar ao banco de dados a partir de um cliente como DBeaver ou DataGrip, você deverá usar a porta `3307` em vez da `3306`. O backend e os notebooks se conectarão automaticamente sem precisar de nenhuma outra mudança.