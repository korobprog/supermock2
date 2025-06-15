# Руководство по разработке Mock Interview Application

## Обзор

Это приложение для проведения mock-интервью состоит из:

- **Фронтенд**: React + Vite + TypeScript + Material-UI
- **Бэкенд**: Node.js + Express + TypeScript + Prisma
- **База данных**: PostgreSQL
- **Кэш**: Redis

## Требования к системе

### Обязательные компоненты

- **Node.js** версии 18 или выше
- **npm** версии 8 или выше
- **Docker** и **Docker Compose** для запуска базы данных

### Проверка установленных компонентов

```bash
node --version    # должно быть >= 18.0.0
npm --version     # должно быть >= 8.0.0
docker --version
docker-compose --version
```

## Быстрый старт

### 🚀 Локальная разработка (рекомендуется)

Самый простой способ запустить проект для разработки:

```bash
# Клонирование и переход в директорию
git clone <repository-url>
cd SuperMosk2

# Запуск одной командой
./start-dev.sh
```

Скрипт автоматически:

- Проверит все зависимости
- Установит npm пакеты
- Запустит PostgreSQL и Redis в Docker
- Применит миграции базы данных
- Заполнит базу тестовыми данными
- Запустит фронтенд и бэкенд

### 🐳 Docker (для проверки продакшн-версии)

```bash
# Запуск в Docker
./start-docker.sh
```

## Ручная настройка локальной разработки

### 1. Установка зависимостей

```bash
# Установка всех зависимостей
npm run install:all

# Или по отдельности:
npm install                    # корневые зависимости
cd frontend && npm install     # фронтенд
cd ../backend && npm install   # бэкенд
```

### 2. Настройка базы данных

```bash
# Запуск PostgreSQL и Redis в Docker
npm run dev:db:detach

# Применение миграций
cd backend
npx prisma migrate dev

# Заполнение тестовыми данными
npx prisma db seed
```

### 3. Запуск приложения

```bash
# Из корневой директории - запуск всего сразу
npm run dev

# Или по отдельности в разных терминалах:
npm run dev:backend    # бэкенд на порту 3000
npm run dev:frontend   # фронтенд на порту 5174
```

## Структура проекта

```
SuperMosk2/
├── frontend/                 # React приложение
│   ├── src/
│   │   ├── pages/           # Страницы приложения
│   │   ├── utils/           # Утилиты (axios и др.)
│   │   └── ...
│   ├── .env.local           # Локальные переменные окружения
│   └── package.json
├── backend/                 # Node.js API
│   ├── src/
│   │   ├── controllers/     # Контроллеры
│   │   ├── routes/          # Маршруты
│   │   ├── middleware/      # Middleware
│   │   ├── utils/           # Утилиты
│   │   └── index.ts         # Точка входа
│   ├── prisma/              # Схема и миграции БД
│   ├── scripts/             # Скрипты (создание админа и др.)
│   ├── .env.local           # Локальные переменные окружения
│   └── package.json
├── docker-compose.yml       # Продакшн Docker конфигурация
├── docker-compose.dev.yml   # База данных для разработки
├── start-dev.sh            # Скрипт запуска локальной разработки
├── start-docker.sh         # Скрипт запуска в Docker
└── package.json            # Корневые скрипты
```

## Переменные окружения

### Backend (.env.local)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mock_interview?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="1d"
CORS_ORIGIN="http://localhost:5174"
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:3000
VITE_API_PREFIX=/api/v1
VITE_NODE_ENV=development
VITE_DEBUG=true
```

## Доступные скрипты

### Корневые скрипты (package.json)

```bash
npm run dev                 # Запуск всего приложения
npm run dev:setup          # Полная настройка с нуля
npm run dev:db             # Запуск только БД
npm run dev:db:detach      # Запуск БД в фоне
npm run dev:db:stop        # Остановка БД
npm run dev:frontend       # Запуск только фронтенда
npm run dev:backend        # Запуск только бэкенда
npm run docker:up          # Запуск в Docker
npm run docker:down        # Остановка Docker
npm run install:all        # Установка всех зависимостей
npm run clean              # Очистка Docker контейнеров
```

### Backend скрипты

```bash
npm run dev                # Разработка с hot reload
npm run dev:local          # Разработка с явным NODE_ENV
npm run build              # Сборка TypeScript
npm run start              # Запуск продакшн версии
npm run test               # Запуск тестов
npm run test:watch         # Тесты в watch режиме
npm run make-admin         # Создание администратора
npm run db:migrate         # Применение миграций
npm run db:seed            # Заполнение тестовыми данными
npm run db:reset           # Сброс базы данных
npm run db:studio          # Prisma Studio
```

### Frontend скрипты

```bash
npm run dev                # Разработка с hot reload
npm run dev:local          # Разработка с доступом по сети
npm run build              # Сборка для продакшн
npm run preview            # Предварительный просмотр сборки
npm run lint               # Проверка кода
npm run lint:fix           # Исправление ошибок линтера
npm run type-check         # Проверка типов TypeScript
```

## Адреса сервисов

### Локальная разработка

- **Фронтенд**: http://localhost:5174
- **Бэкенд API**: http://localhost:3000
- **API документация**: http://localhost:3000/api/v1
- **База данных**: localhost:5432
- **Redis**: localhost:6379
- **Prisma Studio**: http://localhost:5555 (после `npm run db:studio`)

### Docker

- **Фронтенд**: http://localhost:5174
- **Бэкенд API**: http://localhost:3000
- **База данных**: localhost:5432
- **Redis**: localhost:6379

## Работа с базой данных

### Миграции

```bash
cd backend

# Создание новой миграции
npx prisma migrate dev --name migration_name

# Применение миграций в продакшн
npx prisma migrate deploy

# Сброс базы данных
npx prisma migrate reset
```

### Prisma Studio

```bash
cd backend
npx prisma studio
# Откроется http://localhost:5555
```

### Создание администратора

```bash
cd backend
npm run make-admin
# Следуйте инструкциям в консоли
```

## Отладка

### Логи приложения

```bash
# Логи локальной разработки
# Смотрите в консоли где запущены процессы

# Логи Docker
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Подключение к контейнерам

```bash
# Подключение к бэкенду
docker-compose exec backend bash

# Подключение к фронтенду
docker-compose exec frontend sh

# Подключение к базе данных
docker-compose exec postgres psql -U postgres -d mock_interview
```

### Проверка состояния

```bash
# Статус Docker контейнеров
docker-compose ps

# Проверка портов
netstat -tulpn | grep :3000
netstat -tulpn | grep :5174
netstat -tulpn | grep :5432
```

## Тестирование

### Backend тесты

```bash
cd backend
npm test                    # Запуск всех тестов
npm run test:watch          # Тесты в watch режиме
```

### Frontend тесты

```bash
cd frontend
npm test                    # Запуск тестов (если настроены)
```

## Производительность

### Анализ сборки фронтенда

```bash
cd frontend
npm run build
npm run preview
```

### Мониторинг ресурсов

```bash
# Использование Docker ресурсов
docker stats

# Размер образов
docker images
```

## Решение проблем

### Проблемы с портами

```bash
# Проверка занятых портов
sudo lsof -i :3000
sudo lsof -i :5174
sudo lsof -i :5432

# Остановка процессов
sudo kill -9 <PID>
```

### Проблемы с Docker

```bash
# Полная очистка
npm run clean:all
docker system prune -a

# Пересборка образов
docker-compose build --no-cache
```

### Проблемы с базой данных

```bash
# Сброс базы данных
cd backend
npx prisma migrate reset

# Пересоздание базы
npm run dev:db:stop
docker volume rm supermosk2_postgres_data
npm run dev:db:detach
```

### Проблемы с зависимостями

```bash
# Очистка node_modules
rm -rf node_modules frontend/node_modules backend/node_modules
rm package-lock.json frontend/package-lock.json backend/package-lock.json

# Переустановка
npm run install:all
```

## Полезные команды

### Git hooks (рекомендуется)

```bash
# Перед коммитом
npm run lint:fix
npm run type-check
npm test
```

### Обновление зависимостей

```bash
# Проверка устаревших пакетов
npm outdated
cd frontend && npm outdated
cd backend && npm outdated

# Обновление
npm update
```

### Бэкап базы данных

```bash
# Создание дампа
docker-compose exec postgres pg_dump -U postgres mock_interview > backup.sql

# Восстановление
docker-compose exec -T postgres psql -U postgres mock_interview < backup.sql
```

## Контакты и поддержка

При возникновении проблем:

1. Проверьте этот файл DEVELOPMENT.md
2. Посмотрите логи приложения
3. Проверьте issues в репозитории
4. Создайте новый issue с описанием проблемы

---

**Удачной разработки! 🚀**
