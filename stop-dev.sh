#!/bin/bash

# Скрипт для остановки локальной разработки
# Mock Interview Application - Stop Local Development Script

echo "🛑 Остановка Mock Interview App (локальная разработка)..."

# Остановка Docker контейнеров для разработки
echo "🐳 Остановка PostgreSQL и Redis..."
docker-compose -f docker-compose.dev.yml down

# Проверка и остановка процессов Node.js
echo "🔍 Поиск и остановка процессов Node.js..."

# Поиск процессов на портах приложения
BACKEND_PID=$(lsof -ti:3000 2>/dev/null)
FRONTEND_PID=$(lsof -ti:5174 2>/dev/null)

if [ ! -z "$BACKEND_PID" ]; then
    echo "🔧 Остановка бэкенда (PID: $BACKEND_PID)..."
    kill -TERM $BACKEND_PID 2>/dev/null || kill -KILL $BACKEND_PID 2>/dev/null
fi

if [ ! -z "$FRONTEND_PID" ]; then
    echo "📱 Остановка фронтенда (PID: $FRONTEND_PID)..."
    kill -TERM $FRONTEND_PID 2>/dev/null || kill -KILL $FRONTEND_PID 2>/dev/null
fi

# Дополнительная проверка процессов ts-node-dev и vite
echo "🧹 Очистка оставшихся процессов разработки..."
pkill -f "ts-node-dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Проверка что порты освободились
sleep 2

BACKEND_CHECK=$(lsof -ti:3000 2>/dev/null)
FRONTEND_CHECK=$(lsof -ti:5174 2>/dev/null)

if [ -z "$BACKEND_CHECK" ] && [ -z "$FRONTEND_CHECK" ]; then
    echo "✅ Все процессы успешно остановлены"
else
    echo "⚠️  Некоторые процессы могут быть еще активны:"
    [ ! -z "$BACKEND_CHECK" ] && echo "   - Порт 3000 занят (PID: $BACKEND_CHECK)"
    [ ! -z "$FRONTEND_CHECK" ] && echo "   - Порт 5174 занят (PID: $FRONTEND_CHECK)"
    echo "   Попробуйте остановить их вручную или перезагрузить систему"
fi

echo "🏁 Остановка завершена!"