FROM node:20-alpine

WORKDIR /app

RUN npm install -g expo-cli

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8081

# Comando para arrancar en modo web para desarrollo
CMD ["npx", "expo", "start", "--web", "--port", "8081"]