---
sidebar_position: 2
---

# Guia de Instalação

Este guia te leva do zero até o projeto rodando na sua máquina. Não se preocupe se você nunca programou — vamos passo a passo.

## O que você vai precisar

Antes de começar, instale estes dois programas:

### 1. Docker Desktop

O Docker é como uma "caixa mágica" que empacota todo o projeto (banco de dados, servidor, interface) para rodar de forma isolada na sua máquina, sem precisar instalar Python, Node.js, MySQL, etc. separadamente.

- **Windows/Mac**: Baixe em [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) e instale normalmente
- **Linux**: Siga as instruções em [docs.docker.com/engine/install](https://docs.docker.com/engine/install/)

:::tip[Como verificar se está instalado]

Abra o terminal (Prompt de Comando no Windows, Terminal no Mac/Linux) e digite:
```bash
docker --version
```
Se aparecer algo como `Docker version 24.0.7`, está tudo certo.

:::

### 2. Git

O Git é a ferramenta que permite baixar o código do projeto.

- **Windows**: Baixe em [git-scm.com](https://git-scm.com/download/win)
- **Mac**: Já vem instalado. Se não tiver, execute `xcode-select --install` no Terminal
- **Linux**: Execute `sudo apt install git` (Ubuntu/Debian) ou `sudo dnf install git` (Fedora)

### 3. GNU Make (opcional, mas recomendado)

O `make` simplifica os comandos do Docker. Sem ele, você precisará digitar os comandos completos do Docker Compose.

- **Windows** (PowerShell como administrador):
  ```powershell
  winget install GnuWin32.Make
  ```
- **Mac**: Já vem com o Xcode. Se não tiver: `xcode-select --install`
- **Linux**: `sudo apt install build-essential` (Ubuntu/Debian)

## Passo 1: Baixar o projeto

Abra o terminal e execute:

```bash
git clone https://github.com/offandriola/ml-checkai.git
cd ml-checkai
```

Isso cria uma pasta `ml-checkai` com todo o código do projeto.

## Passo 2: Configurar as variáveis de ambiente

O projeto precisa de um arquivo `.env` com configurações como senhas do banco de dados e chaves de API.

```bash
cp .env.example .env
```

Agora abra o arquivo `.env` em qualquer editor de texto e preencha a variável `JWT_SECRET_KEY`. Você pode gerar uma chave segura executando:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

:::info[Se não tiver Python instalado]

Não se preocupe — qualquer texto longo e aleatório funciona. Por exemplo, copie e cole isto:
```
JWT_SECRET_KEY=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
```

:::
### Variáveis do `.env` explicadas

| Variável | O que é | Valor padrão |
|----------|---------|-------------|
| `MYSQL_DATABASE` | Nome do banco de dados | `checkai` |
| `MYSQL_USER` | Usuário do banco | `user` |
| `MYSQL_PASSWORD` | Senha do banco | `password` |
| `MYSQL_ROOT_PASSWORD` | Senha do administrador do banco | `rootpassword` |
| `MYSQL_PORT` | Porta do banco na sua máquina | `3306` |
| `API_PORT` | Porta da API na sua máquina | `8000` |
| `API_DEBUG` | Ativa modo de desenvolvimento | `true` |
| `JWT_SECRET_KEY` | Chave secreta para tokens de login | **(preencha!)** |
| `SERPER_API_KEY` | Chave da API Serper.dev (busca web) | **(opcional)** |

:::tip[Sobre a SERPER_API_KEY]

A busca de fontes na web só funciona com esta chave. Você pode obter uma gratuitamente em [serper.dev](https://serper.dev/). Sem ela, o projeto funciona normalmente, mas sem buscar fontes na internet.

:::
## Passo 3: Subir o projeto

Com o Docker Desktop aberto e rodando, execute na pasta do projeto:

```bash
make up
```

**Ou, se não tiver o `make` instalado:**

```bash
docker-compose up --build -d
```

:::caution[Primeira execução]

A primeira vez demora mais (5-15 minutos) porque o Docker precisa baixar as imagens base (Python, Node.js, MySQL) e instalar todas as dependências. As próximas vezes são muito mais rápidas.

:::
## Passo 4: Acessar os serviços

Após a inicialização, abra no navegador:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | [http://localhost:3000](http://localhost:3000) | Interface visual do CheckAI |
| **API (Swagger)** | [http://localhost:8000/docs](http://localhost:8000/docs) | Documentação interativa da API |
| **Jupyter Lab** | [http://localhost:8888](http://localhost:8888) | Notebooks do modelo de ML |

## Comandos úteis do dia a dia

Se você instalou o `make`, pode usar estes atalhos:

| Comando | O que faz |
|---------|-----------|
| `make up` | Inicia todos os serviços |
| `make down` | Para e remove os containers (dados do banco são preservados) |
| `make stop` | Pausa os containers sem removê-los |
| `make logs` | Mostra os logs de todos os serviços em tempo real |
| `make logs-backend` | Mostra apenas os logs do backend |
| `make shell-backend` | Abre um terminal dentro do container do backend |
| `make migrate` | Cria as tabelas no banco de dados |
| `make help` | Lista todos os comandos disponíveis |

**Sem o `make`**, use os equivalentes do Docker Compose:

```bash
docker-compose up --build -d    # Iniciar
docker-compose down             # Parar
docker-compose logs -f          # Ver logs
docker-compose exec backend sh  # Terminal no backend
```

## Problemas comuns

### Porta 3306 já em uso

Se você já tem MySQL instalado na sua máquina, a porta 3306 pode estar ocupada.

**Solução:** Abra o `.env` e mude a porta:
```env
MYSQL_PORT=3307
```

### Docker não encontrado

Certifique-se de que o **Docker Desktop** está aberto e rodando (ícone na barra de tarefas).

### Erro de permissão no Linux

Se receber erros de permissão ao rodar o Docker:
```bash
sudo usermod -aG docker $USER
```
Depois, faça logout e login novamente.

### Container do backend reiniciando em loop

Verifique os logs para entender o erro:
```bash
make logs-backend
```

Geralmente é um problema de conexão com o banco. Espere o MySQL terminar de inicializar (~30 segundos) e tente novamente.
