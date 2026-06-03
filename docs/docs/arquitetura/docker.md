---
sidebar_position: 5
---

# Docker e Docker Compose

O projeto usa Docker para garantir que todos os desenvolvedores tenham exatamente o mesmo ambiente, independente do sistema operacional.

## O que é Docker?

Imagine que Docker é como uma "máquina virtual leve". Cada serviço (backend, frontend, banco de dados) roda em seu próprio container isolado, com todas as dependências já instaladas. Isso significa que você não precisa instalar Python, Node.js ou MySQL na sua máquina.

## Arquivo `docker-compose.yml`

O Docker Compose orquestra todos os containers. Aqui está o que cada serviço faz:

### Serviço `db` (MySQL)

```yaml
db:
  image: mysql:8.0
  container_name: checkai_db
  ports:
    - "${MYSQL_PORT:-3306}:3306"
  volumes:
    - checkai_db_data:/var/lib/mysql
```

- Usa a imagem oficial do MySQL 8.0
- A porta é configurável via `.env` (padrão: 3306)
- Os dados ficam no volume `checkai_db_data` (persistem entre reinicializações)
- Tem um healthcheck que verifica se o MySQL está pronto antes de liberar os outros serviços

### Serviço `backend` (FastAPI)

```yaml
backend:
  build:
    context: ./fake-news-checker-back
  depends_on:
    db:
      condition: service_healthy
  volumes:
    - ./fake-news-checker-back:/app
    - ./fake-news-checker-model/modelos:/modelos:ro
  command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- Construído a partir do `Dockerfile` em `fake-news-checker-back/`
- Só inicia depois que o banco estiver saudável
- O código-fonte é montado como volume → mudanças no código são refletidas imediatamente (hot-reload)
- Os modelos ML são montados como volume read-only (`ro`) em `/modelos`

### Serviço `frontend` (React + Vite)

```yaml
frontend:
  build:
    context: ./fake-news-checker-front
  depends_on:
    backend:
      condition: service_healthy
  volumes:
    - ./fake-news-checker-front:/app
    - /app/node_modules
```

- Construído a partir do `Dockerfile` em `fake-news-checker-front/`
- Só inicia depois que o backend estiver saudável
- O `node_modules` usa um volume anônimo para não conflitar com o host

### Serviço `notebooks` (Jupyter Lab)

```yaml
notebooks:
  build:
    context: ./fake-news-checker-model
  ports:
    - "8888:8888"
  volumes:
    - .:/app
  command: jupyter lab --ip=0.0.0.0 --port=8888 --allow-root --no-browser --token=''
```

- Monta toda a raiz do projeto em `/app`
- Jupyter Lab roda sem token de autenticação (acesso livre em desenvolvimento)
- Independente dos outros serviços

## Dockerfiles

Cada módulo tem seu próprio `Dockerfile`:

### Backend (`fake-news-checker-back/Dockerfile`)

1. Base: Python 3.12 slim
2. Instala dependências do `requirements.txt`
3. Copia o código-fonte
4. Expõe a porta 8000

### Frontend (`fake-news-checker-front/Dockerfile`)

1. Base: Node.js
2. Instala dependências do `package.json`
3. Copia o código-fonte
4. Inicia o servidor de desenvolvimento Vite

### Notebooks (`fake-news-checker-model/Dockerfile`)

1. Base: Python 3.12
2. Instala dependências científicas (pandas, scikit-learn, jupyter)
3. Configura o Jupyter Lab

## Comandos úteis

### Reconstruir imagens após mudanças no Dockerfile

```bash
make build
# ou
docker-compose build
```

### Ver o status dos containers

```bash
docker-compose ps
```

### Reiniciar apenas um serviço

```bash
docker-compose restart backend
```

### Limpar tudo (imagens, volumes, containers)

```bash
docker-compose down -v
docker system prune -a
```

:::danger[`docker system prune -a` remove **todas** as imagens Docker da sua máquina, não apenas as do CheckAI. Use com cuidado.]

:::