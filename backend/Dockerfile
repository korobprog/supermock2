FROM node:18-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Копируем .env.docker как .env для Docker окружения
COPY .env.docker .env

CMD ["npm", "run", "dev"]