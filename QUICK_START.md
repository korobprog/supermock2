# Быстрый старт Mock Interview Application

## 🚀 Локальная разработка (1 команда)

```bash
./start-dev.sh
```

**Что происходит:**

- Проверяются зависимости (Node.js, Docker)
- Устанавливаются npm пакеты
- Запускается PostgreSQL и Redis в Docker
- Применяются миграции БД
- Заполняется база тестовыми данными
- Запускается бэкенд (порт 3000) и фронтенд (порт 5174)

## 🐳 Docker продакшн (1 команда)

```bash
./start-docker.sh
```

**Что происходит:**

- Собираются Docker образы
- Запускаются все сервисы в контейнерах
- Применяются миграции
- Заполняется база данными

## 🛑 Остановка

```bash
./stop-dev.sh          # Остановка локальной разработки
docker-compose down     # Остановка Docker
```

## 📱 Адреса

- **Фронтенд**: http://localhost:5174
- **API**: http://localhost:3000
- **База данных**: localhost:5432
- **Redis**: localhost:6379

## 📚 Подробная документация

Смотрите [DEVELOPMENT.md](./DEVELOPMENT.md) для детальных инструкций.

## ⚡ Альтернативные команды

```bash
# Через npm
npm run start:dev       # = ./start-dev.sh
npm run start:docker    # = ./start-docker.sh
npm run dev:stop        # = ./stop-dev.sh

# Ручной запуск компонентов
npm run dev:db:detach   # Только база данных
npm run dev:backend     # Только бэкенд
npm run dev:frontend    # Только фронтенд
```

## 🔧 Требования

- Node.js 18+
- Docker & Docker Compose
- npm 8+

---

**Готово! Приложение должно быть доступно через несколько минут. 🎉**
