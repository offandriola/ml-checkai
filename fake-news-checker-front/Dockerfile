# 1. Imagem base com Node.js
FROM node:22-alpine

# 2. Define o diretório de trabalho
WORKDIR /app

# 3. Instala as dependências
COPY package*.json ./
RUN npm install

# 4. Copia o código do frontend
COPY . .

# 5. Expõe a porta do servidor de desenvolvimento
EXPOSE 3000

# 6. Comando para iniciar (o --host é crucial para funcionar no Docker)
CMD ["npm", "run", "dev", "--", "--host"]
