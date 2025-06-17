"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPointsTransactions = exports.editUserPointsByAdmin = exports.getUserPointsTransactionsByAdmin = exports.getUserPointsBalanceByAdmin = exports.subtractPointsByAdmin = exports.addPointsByAdmin = exports.subtractPointsFromUser = exports.getUserPointsBalance = exports.addPointsToUser = void 0;
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
// Функция для начисления баллов пользователю
const addPointsToUser = (userId, amount, description) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pointsTransaction = yield database_1.prisma.pointsTransaction.create({
            data: {
                userId,
                amount,
                type: 'EARNED',
                description,
            },
        });
        return pointsTransaction;
    }
    catch (error) {
        console.error('Error adding points to user:', error);
        throw error;
    }
});
exports.addPointsToUser = addPointsToUser;
// Получение текущего баланса баллов пользователя
const getUserPointsBalance = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pointsTransactions = yield database_1.prisma.pointsTransaction.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
        });
        const currentBalance = pointsTransactions.reduce((sum, transaction) => {
            return transaction.type === 'EARNED'
                ? sum + transaction.amount
                : sum - transaction.amount;
        }, 0);
        res.json({ balance: currentBalance });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserPointsBalance = getUserPointsBalance;
// Функция для вычитания баллов у пользователя
const subtractPointsFromUser = (userId, amount, description) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pointsTransaction = yield database_1.prisma.pointsTransaction.create({
            data: {
                userId,
                amount,
                type: 'SPENT',
                description,
            },
        });
        return pointsTransaction;
    }
    catch (error) {
        console.error('Error subtracting points from user:', error);
        throw error;
    }
});
exports.subtractPointsFromUser = subtractPointsFromUser;
// Добавление баллов пользователю администратором
const addPointsByAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { amount, description } = req.body;
        if (!amount || amount <= 0) {
            throw new errors_1.BadRequestError('Количество баллов должно быть положительным числом');
        }
        if (!description || description.trim().length === 0) {
            throw new errors_1.BadRequestError('Описание транзакции обязательно');
        }
        // Проверяем, существует ли пользователь
        const user = yield database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.NotFoundError('Пользователь не найден');
        }
        const transaction = yield (0, exports.addPointsToUser)(userId, amount, `[Администратор] ${description}`);
        res.status(201).json({
            status: 'success',
            data: {
                transaction: {
                    id: transaction.id,
                    amount: transaction.amount,
                    type: transaction.type,
                    description: transaction.description,
                    createdAt: transaction.createdAt.toISOString(),
                },
            },
            message: 'Баллы успешно добавлены пользователю',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addPointsByAdmin = addPointsByAdmin;
// Вычитание баллов у пользователя администратором
const subtractPointsByAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { amount, description } = req.body;
        if (!amount || amount <= 0) {
            throw new errors_1.BadRequestError('Количество баллов должно быть положительным числом');
        }
        if (!description || description.trim().length === 0) {
            throw new errors_1.BadRequestError('Описание транзакции обязательно');
        }
        // Проверяем, существует ли пользователь
        const user = yield database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.NotFoundError('Пользователь не найден');
        }
        const transaction = yield (0, exports.subtractPointsFromUser)(userId, amount, `[Администратор] ${description}`);
        res.status(201).json({
            status: 'success',
            data: {
                transaction: {
                    id: transaction.id,
                    amount: transaction.amount,
                    type: transaction.type,
                    description: transaction.description,
                    createdAt: transaction.createdAt.toISOString(),
                },
            },
            message: 'Баллы успешно вычтены у пользователя',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.subtractPointsByAdmin = subtractPointsByAdmin;
// Получение баланса баллов пользователя администратором
const getUserPointsBalanceByAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        // Проверяем, существует ли пользователь
        const user = yield database_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
            },
        });
        if (!user) {
            throw new errors_1.NotFoundError('Пользователь не найден');
        }
        const pointsTransactions = yield database_1.prisma.pointsTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        const currentBalance = pointsTransactions.reduce((sum, transaction) => {
            return transaction.type === 'EARNED'
                ? sum + transaction.amount
                : sum - transaction.amount;
        }, 0);
        res.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    profile: user.profile,
                },
                balance: currentBalance,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserPointsBalanceByAdmin = getUserPointsBalanceByAdmin;
// Получение истории транзакций пользователя администратором
const getUserPointsTransactionsByAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        // Проверяем, существует ли пользователь
        const user = yield database_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
            },
        });
        if (!user) {
            throw new errors_1.NotFoundError('Пользователь не найден');
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [pointsTransactions, totalCount] = yield Promise.all([
            database_1.prisma.pointsTransaction.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            database_1.prisma.pointsTransaction.count({
                where: { userId },
            }),
        ]);
        const formattedTransactions = pointsTransactions.map((transaction) => ({
            id: transaction.id,
            amount: transaction.amount,
            type: transaction.type,
            description: transaction.description,
            createdAt: transaction.createdAt.toISOString(),
        }));
        res.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    profile: user.profile,
                },
                transactions: formattedTransactions,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / Number(limit)),
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserPointsTransactionsByAdmin = getUserPointsTransactionsByAdmin;
// Редактирование баллов пользователя администратором
const editUserPointsByAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { newBalance, description } = req.body;
        if (typeof newBalance !== 'number') {
            throw new errors_1.BadRequestError('Новый баланс должен быть числом');
        }
        if (!description || description.trim().length === 0) {
            throw new errors_1.BadRequestError('Описание изменения обязательно');
        }
        // Проверяем, существует ли пользователь
        const user = yield database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.NotFoundError('Пользователь не найден');
        }
        // Получаем текущий баланс
        const pointsTransactions = yield database_1.prisma.pointsTransaction.findMany({
            where: { userId },
        });
        const currentBalance = pointsTransactions.reduce((sum, transaction) => {
            return transaction.type === 'EARNED'
                ? sum + transaction.amount
                : sum - transaction.amount;
        }, 0);
        // Вычисляем разность
        const difference = newBalance - currentBalance;
        if (difference === 0) {
            return res.json({
                status: 'success',
                message: 'Баланс пользователя уже соответствует указанному значению',
                data: {
                    currentBalance,
                    newBalance,
                },
            });
        }
        // Создаем транзакцию для корректировки баланса
        const transaction = yield database_1.prisma.pointsTransaction.create({
            data: {
                userId,
                amount: Math.abs(difference),
                type: difference > 0 ? 'EARNED' : 'SPENT',
                description: `[Администратор] Корректировка баланса: ${description}`,
            },
        });
        res.json({
            status: 'success',
            data: {
                transaction: {
                    id: transaction.id,
                    amount: transaction.amount,
                    type: transaction.type,
                    description: transaction.description,
                    createdAt: transaction.createdAt.toISOString(),
                },
                previousBalance: currentBalance,
                newBalance,
                difference,
            },
            message: 'Баланс пользователя успешно изменен',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.editUserPointsByAdmin = editUserPointsByAdmin;
// Получение истории транзакций с баллами
const getUserPointsTransactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pointsTransactions = yield database_1.prisma.pointsTransaction.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
        });
        const formattedTransactions = pointsTransactions.map((transaction) => ({
            id: transaction.id,
            amount: transaction.amount,
            type: transaction.type,
            description: transaction.description,
            createdAt: transaction.createdAt.toISOString(),
        }));
        res.json(formattedTransactions);
    }
    catch (error) {
        next(error);
    }
});
exports.getUserPointsTransactions = getUserPointsTransactions;
