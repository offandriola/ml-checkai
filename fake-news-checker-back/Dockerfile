# 1. Imagem base com Python 3.12
FROM python:3.12-slim

# 2. Variáveis de ambiente para otimizar o Python no Docker
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 3. Define o diretório de trabalho dentro do container
WORKDIR /app

# 4. Instala as dependências
# Copia apenas o requirements.txt primeiro para aproveitar o cache do Docker
COPY requirements.txt .
RUN apt-get update && apt-get install -y curl tesseract-ocr tesseract-ocr-por && \
    pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 5. Copia o código da aplicação
# O .dockerignore vai garantir que arquivos desnecessários não sejam copiados
COPY . .

# 6. Expõe a porta que a API vai usar
EXPOSE 8000

# O comando para iniciar a aplicação será definido no docker-compose.yml
