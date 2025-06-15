# Mock Interview Application

Приложение для проведения mock-интервью с поддержкой локальной разработки и Docker.

## Быстрый старт

### 🚀 Локальная разработка (рекомендуется)

```bash
git clone <repository-url>
cd SuperMosk2
./start-dev.sh
```

### 🐳 Docker (продакшн-версия)

```bash
./start-docker.sh
```

## Технологии

- **Frontend**: React + Vite + TypeScript + Material-UI
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL
- **Cache**: Redis

## Адреса

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3000
- **Database**: localhost:5432
- **Redis**: localhost:6379

## Документация

Подробные инструкции по разработке смотрите в [DEVELOPMENT.md](./DEVELOPMENT.md)

## Структура проекта

```
SuperMosk2/
├── frontend/           # React приложение
├── backend/            # Node.js API
├── start-dev.sh        # Скрипт локальной разработки
├── start-docker.sh     # Скрипт Docker запуска
└── DEVELOPMENT.md      # Подробная документация
```

## Требования

- Node.js 18+
- Docker & Docker Compose
- npm 8+

## Лицензия

ISC
