# Детальный план локального режима разработки

## 1. Общая архитектура решения

```mermaid
graph TD
    subgraph "Локальная разработка"
        A[Фронтенд<br>localhost:5174] --> B[Бэкенд<br>localhost:3000]
        B --> C[Docker контейнеры]
    end

    subgraph "Docker контейнеры"
        D[PostgreSQL<br>localhost:5432]
        E[Redis<br>localhost:6379]
    end

    B --> D
    B --> E

    subgraph "Продакшн режим (Docker)"
        F[Фронтенд контейнер] --> G[Бэкенд контейнер]
        G --> H[PostgreSQL контейнер]
        G --> I[Redis контейнер]
    end
```

## 2. Необходимые изменения в конфигурации

### 2.1. Модификация docker-compose.yml

Создадим два файла docker-compose:

- `docker-compose.dev.yml` - для локальной разработки (только PostgreSQL и Redis)
- `docker-compose.yml` - для полного развертывания в Docker (все компоненты)

### 2.2. Настройка переменных окружения

Необходимо обновить файлы `.env` и `.env.local` для корректной работы в локальном режиме:

- Обновить URL подключения к базе данных и Redis
- Настроить CORS для локальных портов

### 2.3. Скрипты для запуска

Добавим новые скрипты в package.json для удобного запуска:

- Скрипт для запуска только контейнеров с базой данных и Redis
- Скрипт для запуска фронтенда и бэкенда локально
- Скрипт для полного запуска в Docker

## 3. Пошаговый план реализации

### Шаг 1: Создание docker-compose.dev.yml

Создадим файл `docker-compose.dev.yml`, который будет содержать только сервисы PostgreSQL и Redis:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    ports:
      - '5432:5432'
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=mock_interview
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Шаг 2: Обновление файлов окружения

Обновим файлы `.env` и `.env.local` для бэкенда, чтобы они корректно указывали на локальные сервисы:

```
# Database Configuration (for local development)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mock_interview?schema=public

# Redis Configuration (for local development)
REDIS_URL=redis://localhost:6379
```

### Шаг 3: Создание скриптов для запуска

Добавим в корневой каталог проекта файл `package.json` со скриптами для удобного запуска:

```json
{
  "name": "mock-interview-app",
  "version": "1.0.0",
  "scripts": {
    "dev:db": "docker-compose -f docker-compose.dev.yml up",
    "dev:db:detach": "docker-compose -f docker-compose.dev.yml up -d",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "dev": "concurrently \"npm run dev:db:detach\" \"npm run dev:backend\" \"npm run dev:frontend\"",
    "docker:up": "docker-compose up",
    "docker:down": "docker-compose down",
    "docker:build": "docker-compose build"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

### Шаг 4: Обновление конфигурации Vite

Обновим `frontend/vite.config.ts` для лучшей работы в локальном режиме:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    // Убираем host: '0.0.0.0' для локальной разработки
    hmr: {
      port: 5174,
      host: 'localhost',
    },
  },
});
```

### Шаг 5: Создание README с инструкциями

Создадим файл `README.md` с подробными инструкциями по использованию локального режима разработки и Docker:

```markdown
# Mock Interview Application

## Режимы разработки

### Локальный режим разработки

1. Запустите базу данных и Redis в Docker:
```

npm run dev:db

```

2. Запустите бэкенд:
```

npm run dev:backend

```

3. Запустите фронтенд:
```

npm run dev:frontend

```

Или запустите все компоненты одной командой:
```

npm run dev

```

### Режим Docker (продакшн)

Для запуска всего приложения в Docker:
```

npm run docker:up

```

Для остановки:
```

npm run docker:down

```

Для пересборки:
```

npm run docker:build

```

```

## 4. Рекомендации по организации рабочего процесса

### 4.1. Начало работы

- Клонировать репозиторий
- Установить зависимости (`npm install` в корневой директории, а также в директориях frontend и backend)
- Запустить локальный режим разработки (`npm run dev`)

### 4.2. Разработка

- Работать с кодом как обычно, изменения будут автоматически применяться благодаря hot-reload
- При необходимости перезапускать только нужные компоненты

### 4.3. Тестирование в Docker

- Перед коммитом проверить работу в Docker (`npm run docker:build && npm run docker:up`)
- Убедиться, что все работает корректно в контейнерах

### 4.4. Переключение между режимами

- Для переключения между локальным режимом и Docker достаточно использовать соответствующие команды
- Перед переключением рекомендуется остановить все запущенные процессы
