#!/bin/bash

# Скрипт для запуска проекта в режиме локальной разработки
# Mock Interview Application - Local Development Startup Script

echo "🚀 Запуск Mock Interview App в режиме локальной разработки..."

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Пожалуйста, установите Node.js версии 18 или выше."
    exit 1
fi

# Проверка наличия npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не установлен. Пожалуйста, установите npm."
    exit 1
fi

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Пожалуйста, установите Docker для запуска базы данных."
    exit 1
fi

# Проверка наличия Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Пожалуйста, установите Docker Compose."
    exit 1
fi

echo "✅ Все необходимые инструменты установлены"

# Установка зависимостей если нужно
if [ ! -d "node_modules" ] || [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm run install:all
fi

# Запуск базы данных и Redis в Docker
echo "🐳 Запуск PostgreSQL и Redis в Docker..."
npm run dev:db:detach

# Ожидание запуска базы данных
echo "⏳ Ожидание запуска базы данных..."
sleep 10

# Проверка подключения к базе данных
echo "🔍 Проверка подключения к базе данных..."
cd backend

# Применение миграций
echo "🗄️ Применение миграций базы данных..."
npx prisma migrate dev --name init 2>/dev/null || echo "Миграции уже применены"

# Заполнение базы данных тестовыми данными
echo "🌱 Заполнение базы данных тестовыми данными..."
npx prisma db seed 2>/dev/null || echo "База данных уже заполнена"

cd ..

echo "🎉 Настройка завершена! Запуск приложения..."

# Запуск приложения
npm run dev

echo "🏁 Приложение запущено!"
echo "📱 Фронтенд: http://localhost:5174"
echo "🔧 Бэкенд API: http://localhost:3000"
echo "🗄️ База данных: localhost:5432"
echo "🔴 Redis: localhost:6379"
echo ""
echo "Для остановки нажмите Ctrl+C"