# API для управления блокировками пользователей

## Обзор

API предоставляет функционал для администраторов по управлению блокировками пользователей в системе. Все эндпоинты требуют аутентификации и роли администратора.

## Базовый URL

```
/api/user-blocks
```

## Аутентификация

Все запросы должны содержать JWT токен в заголовке Authorization:

```
Authorization: Bearer <jwt_token>
```

## Эндпоинты

### 1. Блокировка пользователя

**POST** `/api/user-blocks`

Блокирует пользователя в системе (временно или постоянно).

#### Тело запроса

```json
{
  "userId": "uuid",
  "reason": "string",
  "isPermanent": boolean,
  "endDate": "ISO datetime string" // только для временной блокировки
}
```

#### Параметры

- `userId` (обязательный) - UUID пользователя для блокировки
- `reason` (обязательный) - Причина блокировки (1-500 символов)
- `isPermanent` (опциональный) - Постоянная блокировка (по умолчанию false)
- `endDate` (условно обязательный) - Дата окончания блокировки в формате ISO (обязательно для временной блокировки)

#### Пример запроса

```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "reason": "Нарушение правил сообщества",
  "isPermanent": false,
  "endDate": "2024-12-31T23:59:59.000Z"
}
```

#### Ответ

```json
{
  "status": "success",
  "data": {
    "block": {
      "id": "uuid",
      "userId": "uuid",
      "reason": "string",
      "isPermanent": boolean,
      "startDate": "ISO datetime",
      "endDate": "ISO datetime | null",
      "isActive": true,
      "createdAt": "ISO datetime"
    },
    "user": {
      "id": "uuid",
      "email": "string",
      "profile": {}
    }
  },
  "message": "Пользователь успешно заблокирован"
}
```

### 2. Разблокировка пользователя

**DELETE** `/api/user-blocks/:id`

Разблокирует пользователя, деактивируя указанную блокировку.

#### Параметры URL

- `id` - UUID блокировки

#### Ответ

```json
{
  "status": "success",
  "data": {
    "block": {
      "id": "uuid",
      "userId": "uuid",
      "reason": "string",
      "isPermanent": boolean,
      "startDate": "ISO datetime",
      "endDate": "ISO datetime | null",
      "isActive": false,
      "updatedAt": "ISO datetime"
    },
    "user": {
      "id": "uuid",
      "email": "string",
      "profile": {}
    }
  },
  "message": "Пользователь успешно разблокирован"
}
```

### 3. Получение истории блокировок пользователя

**GET** `/api/user-blocks/user/:userId`

Получает историю всех блокировок конкретного пользователя.

#### Параметры URL

- `userId` - UUID пользователя

#### Параметры запроса

- `page` (опциональный) - Номер страницы (по умолчанию 1)
- `limit` (опциональный) - Количество записей на странице (по умолчанию 20)

#### Ответ

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "string",
      "profile": {}
    },
    "blocks": [
      {
        "id": "uuid",
        "reason": "string",
        "isPermanent": boolean,
        "startDate": "ISO datetime",
        "endDate": "ISO datetime | null",
        "isActive": boolean,
        "createdAt": "ISO datetime",
        "updatedAt": "ISO datetime"
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

### 4. Получение всех активных блокировок

**GET** `/api/user-blocks/active`

Получает список всех активных блокировок в системе.

#### Параметры запроса

- `page` (опциональный) - Номер страницы (по умолчанию 1)
- `limit` (опциональный) - Количество записей на странице (по умолчанию 20)

#### Ответ

```json
{
  "status": "success",
  "data": {
    "blocks": [
      {
        "id": "uuid",
        "userId": "uuid",
        "reason": "string",
        "isPermanent": boolean,
        "startDate": "ISO datetime",
        "endDate": "ISO datetime | null",
        "isActive": true,
        "createdAt": "ISO datetime",
        "updatedAt": "ISO datetime",
        "user": {
          "id": "uuid",
          "email": "string",
          "profile": {}
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

## Коды ошибок

- `400 Bad Request` - Неверные параметры запроса
- `401 Unauthorized` - Отсутствует или недействительный токен аутентификации
- `403 Forbidden` - Недостаточно прав (требуется роль администратора)
- `404 Not Found` - Пользователь или блокировка не найдены
- `500 Internal Server Error` - Внутренняя ошибка сервера

## Примеры ошибок

### Пользователь уже заблокирован

```json
{
  "status": "error",
  "message": "У пользователя уже есть активная блокировка"
}
```

### Блокировка не найдена

```json
{
  "status": "error",
  "message": "Блокировка не найдена"
}
```

### Недостаточно прав

```json
{
  "status": "error",
  "message": "Insufficient permissions"
}
```

## Интеграция с системой аутентификации

При попытке аутентификации заблокированного пользователя система автоматически проверяет наличие активных блокировок и возвращает ошибку:

```json
{
  "status": "error",
  "message": "Аккаунт заблокирован. Причина: Нарушение правил сообщества до 31.12.2024"
}
```

Для постоянных блокировок:

```json
{
  "status": "error",
  "message": "Аккаунт заблокирован. Причина: Серьезное нарушение (постоянная блокировка)"
}
```
