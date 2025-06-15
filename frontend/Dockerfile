FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Копируем .env.docker как .env для Docker окружения
COPY .env.docker .env

EXPOSE 5174

CMD ["npm", "run", "dev", "--", "--config", "vite.config.docker.ts"]