# 1. Imagem base com Python 3.12
FROM python:3.12-slim

# 2. Variáveis de ambiente
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 3. Define o diretório de trabalho
WORKDIR /app

# 4. Instala as dependências
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 5. Expõe a porta do Jupyter Lab
EXPOSE 8888

# O comando para iniciar a aplicação será definido no docker-compose.yml