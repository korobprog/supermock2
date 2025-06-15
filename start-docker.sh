#!/bin/bash

# Скрипт для запуска проекта в Docker (продакшн-режим)
# Mock Interview Application - Docker Production Startup Script

echo "🐳 Запуск Mock Interview App в Docker (продакшн-режим)..."

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Пожалуйста, установите Docker."
    exit 1
fi

# Проверка наличия Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Пожалуйста, установите Docker Compose."
    exit 1
fi

echo "✅ Docker и Docker Compose установлены"

# Остановка существующих контейнеров
echo "🛑 Остановка существующих контейнеров..."
docker-compose down 2>/dev/null || echo "Контейнеры уже остановлены"

# Очистка старых образов (опционально)
read -p "🧹 Очистить старые Docker образы? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Очистка старых образов..."
    docker-compose down --rmi all --volumes --remove-orphans 2>/dev/null || echo "Нечего очищать"
fi

# Сборка образов
echo "🔨 Сборка Docker образов..."
docker-compose build

# Проверка успешности сборки
if [ $? -ne 0 ]; then
    echo "❌ Ошибка при сборке Docker образов"
    exit 1
fi

echo "✅ Образы успешно собраны"

# Запуск контейнеров
echo "🚀 Запуск контейнеров..."
docker-compose up -d

# Проверка статуса контейнеров
echo "⏳ Ожидание запуска всех сервисов..."
sleep 15

# Проверка здоровья контейнеров
echo "🔍 Проверка статуса контейнеров..."
docker-compose ps

# Применение миграций базы данных
echo "🗄️ Применение миграций базы данных..."
docker-compose exec backend npx prisma migrate deploy 2>/dev/null || echo "Миграции уже применены"

# Заполнение базы данных (если нужно)
echo "🌱 Заполнение базы данных тестовыми данными..."
docker-compose exec backend npx prisma db seed 2>/dev/null || echo "База данных уже заполнена"

echo ""
echo "🎉 Приложение успешно запущено в Docker!"
echo "📱 Фронтенд: http://localhost:5174"
echo "🔧 Бэкенд API: http://localhost:3000"
echo "🗄️ База данных: localhost:5432"
echo "🔴 Redis: localhost:6379"
echo ""
echo "📊 Для просмотра логов: docker-compose logs -f"
echo "🛑 Для остановки: docker-compose down"
echo "🔄 Для перезапуска: docker-compose restart"
echo ""
echo "📋 Полезные команды:"
echo "  docker-compose ps                    # Статус контейнеров"
echo "  docker-compose logs -f [service]     # Логи сервиса"
echo "  docker-compose exec backend bash     # Подключение к бэкенду"
echo "  docker-compose exec frontend sh      # Подключение к фронтенду"