"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const points_controller_1 = require("../controllers/points.controller");
const router = (0, express_1.Router)();
// Все маршруты для работы с баллами требуют аутентификации
router.use(auth_1.authenticate);
// Пользовательские маршруты
// Получение текущего баланса баллов пользователя
router.get('/balance', points_controller_1.getUserPointsBalance);
// Получение истории транзакций с баллами
router.get('/transactions', points_controller_1.getUserPointsTransactions);
// Административные маршруты (только для администраторов)
// Добавление баллов пользователю
router.post('/admin/:userId/add', (0, auth_1.authorize)('ADMIN'), points_controller_1.addPointsByAdmin);
// Вычитание баллов у пользователя
router.post('/admin/:userId/subtract', (0, auth_1.authorize)('ADMIN'), points_controller_1.subtractPointsByAdmin);
// Редактирование баллов пользователя (установка нового баланса)
router.put('/admin/:userId/edit', (0, auth_1.authorize)('ADMIN'), points_controller_1.editUserPointsByAdmin);
// Получение баланса баллов пользователя администратором
router.get('/admin/:userId/balance', (0, auth_1.authorize)('ADMIN'), points_controller_1.getUserPointsBalanceByAdmin);
// Получение истории транзакций пользователя администратором
router.get('/admin/:userId/transactions', (0, auth_1.authorize)('ADMIN'), points_controller_1.getUserPointsTransactionsByAdmin);
exports.default = router;
