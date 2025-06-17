# API для управления баллами пользователей (Администратор)

## Обзор

Данные методы доступны только пользователям с ролью `ADMIN` и позволяют управлять баллами пользователей.

## Базовый URL

```
/api/points/admin
```

## Методы

### 1. Добавление баллов пользователю

**POST** `/api/points/admin/:userId/add`

**Описание:** Добавляет указанное количество баллов пользователю.

**Параметры:**

- `userId` (path) - ID пользователя

**Тело запроса:**

```json
{
  "amount": 100,
  "description": "Бонус за активность"
}
```

**Ответ:**

```json
{
  "status": "success",
  "data": {
    "transaction": {
      "id": "transaction_id",
      "amount": 100,
      "type": "EARNED",
      "description": "[Администратор] Бонус за активность",
      "createdAt": "2025-06-16T19:00:00.000Z"
    }
  },
  "message": "Баллы успешно добавлены пользователю"
}
```

### 2. Вычитание баллов у пользователя

**POST** `/api/points/admin/:userId/subtract`

**Описание:** Вычитает указанное количество баллов у пользователя.

**Параметры:**

- `userId` (path) - ID пользователя

**Тело запроса:**

```json
{
  "amount": 50,
  "description": "Штраф за нарушение"
}
```

**Ответ:**

```json
{
  "status": "success",
  "data": {
    "transaction": {
      "id": "transaction_id",
      "amount": 50,
      "type": "SPENT",
      "description": "[Администратор] Штраф за нарушение",
      "createdAt": "2025-06-16T19:00:00.000Z"
    }
  },
  "message": "Баллы успешно вычтены у пользователя"
}
```

### 3. Редактирование баллов пользователя

**PUT** `/api/points/admin/:userId/edit`

**Описание:** Устанавливает новый баланс баллов пользователя.

**Параметры:**

- `userId` (path) - ID пользователя

**Тело запроса:**

```json
{
  "newBalance": 500,
  "description": "Корректировка баланса"
}
```

**Ответ:**

```json
{
  "status": "success",
  "data": {
    "transaction": {
      "id": "transaction_id",
      "amount": 200,
      "type": "EARNED",
      "description": "[Администратор] Корректировка баланса: Корректировка баланса",
      "createdAt": "2025-06-16T19:00:00.000Z"
    },
    "previousBalance": 300,
    "newBalance": 500,
    "difference": 200
  },
  "message": "Баланс пользователя успешно изменен"
}
```

### 4. Получение баланса пользователя

**GET** `/api/points/admin/:userId/balance`

**Описание:** Получает текущий баланс баллов пользователя.

**Параметры:**

- `userId` (path) - ID пользователя

**Ответ:**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "profile": {
        "firstName": "Иван",
        "lastName": "Иванов"
      }
    },
    "balance": 500
  }
}
```

### 5. Получение истории транзакций пользователя

**GET** `/api/points/admin/:userId/transactions?page=1&limit=20`

**Описание:** Получает историю транзакций баллов пользователя с пагинацией.

**Параметры:**

- `userId` (path) - ID пользователя
- `page` (query, optional) - Номер страницы (по умолчанию: 1)
- `limit` (query, optional) - Количество записей на странице (по умолчанию: 20)

**Ответ:**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "profile": {
        "firstName": "Иван",
        "lastName": "Иванов"
      }
    },
    "transactions": [
      {
        "id": "transaction_id",
        "amount": 100,
        "type": "EARNED",
        "description": "[Администратор] Бонус за активность",
        "createdAt": "2025-06-16T19:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

## Авторизация

Все методы требуют:

1. Аутентификации (Bearer token в заголовке Authorization)
2. Роли администратора (ADMIN)

## Коды ошибок

- `400` - Неверные параметры запроса
- `401` - Не авторизован или недостаточно прав
- `404` - Пользователь не найден
- `500` - Внутренняя ошибка сервера
