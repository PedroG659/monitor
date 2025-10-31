FROM node:18-alpine

# Define diretório de trabalho
WORKDIR /usr/src/app

# Copia arquivos do projeto
COPY package*.json ./
RUN npm install

COPY . .

# Expõe a porta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "server.js"]
