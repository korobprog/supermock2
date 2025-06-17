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
exports.checkUserBlock = exports.getAllActiveBlocks = exports.getUserBlocks = exports.unblockUser = exports.blockUser = void 0;
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
// Блокировка пользователя
const blockUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId, reason, isPermanent, endDate } = req.body;
        if (!userId || !reason) {
            throw new errors_1.BadRequestError('ID пользователя и причина блокировки обязательны');
        }
        if (!isPermanent && !endDate) {
            throw new errors_1.BadRequestError('Для временной блокировки необходимо указать дату окончания');
        }
        if (isPermanent && endDate) {
            throw new errors_1.BadRequestError('Для постоянной блокировки не нужно указывать дату окончания');
        }
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
        // Проверяем, нет ли уже активной блокировки
        const existingActiveBlock = yield database_1.prisma.userBlock.findFirst({
            where: {
                userId,
                isActive: true,
            },
        });
        if (existingActiveBlock) {
            throw new errors_1.BadRequestError('У пользователя уже есть активная блокировка');
        }
        // Создаем блокировку
        const userBlock = yield database_1.prisma.userBlock.create({
            data: {
                userId,
                reason,
                isPermanent: isPermanent || false,
                endDate: isPermanent ? null : new Date(endDate),
            },
        });
        res.status(201).json({
            status: 'success',
            data: {
                block: {
                    id: userBlock.id,
                    userId: userBlock.userId,
                    reason: userBlock.reason,
                    isPermanent: userBlock.isPermanent,
                    startDate: userBlock.startDate.toISOString(),
                    endDate: ((_a = userBlock.endDate) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                    isActive: userBlock.isActive,
                    createdAt: userBlock.createdAt.toISOString(),
                },
                user: {
                    id: user.id,
                    email: user.email,
                    profile: user.profile,
                },
            },
            message: 'Пользователь успешно заблокирован',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.blockUser = blockUser;
// Разблокировка пользователя
const unblockUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        // Находим блокировку
        const userBlock = yield database_1.prisma.userBlock.findUnique({
            where: { id },
            include: {
                user: {
                    include: {
                        profile: true,
                    },
                },
            },
        });
        if (!userBlock) {
            throw new errors_1.NotFoundError('Блокировка не найдена');
        }
        if (!userBlock.isActive) {
            throw new errors_1.BadRequestError('Блокировка уже неактивна');
        }
        // Деактивируем блокировку
        const updatedBlock = yield database_1.prisma.userBlock.update({
            where: { id },
            data: {
                isActive: false,
                updatedAt: new Date(),
            },
        });
        res.json({
            status: 'success',
            data: {
                block: {
                    id: updatedBlock.id,
                    userId: updatedBlock.userId,
                    reason: updatedBlock.reason,
                    isPermanent: updatedBlock.isPermanent,
                    startDate: updatedBlock.startDate.toISOString(),
                    endDate: ((_a = updatedBlock.endDate) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                    isActive: updatedBlock.isActive,
                    updatedAt: updatedBlock.updatedAt.toISOString(),
                },
                user: {
                    id: userBlock.user.id,
                    email: userBlock.user.email,
                    profile: userBlock.user.profile,
                },
            },
            message: 'Пользователь успешно разблокирован',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.unblockUser = unblockUser;
// Получение истории блокировок пользователя
const getUserBlocks = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const [userBlocks, totalCount] = yield Promise.all([
            database_1.prisma.userBlock.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            database_1.prisma.userBlock.count({
                where: { userId },
            }),
        ]);
        const formattedBlocks = userBlocks.map((block) => {
            var _a;
            return ({
                id: block.id,
                reason: block.reason,
                isPermanent: block.isPermanent,
                startDate: block.startDate.toISOString(),
                endDate: ((_a = block.endDate) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                isActive: block.isActive,
                createdAt: block.createdAt.toISOString(),
                updatedAt: block.updatedAt.toISOString(),
            });
        });
        res.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    profile: user.profile,
                },
                blocks: formattedBlocks,
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
exports.getUserBlocks = getUserBlocks;
// Получение всех активных блокировок
const getAllActiveBlocks = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const [activeBlocks, totalCount] = yield Promise.all([
            database_1.prisma.userBlock.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { isPermanent: true },
                        {
                            isPermanent: false,
                            endDate: {
                                gt: new Date(),
                            },
                        },
                    ],
                },
                include: {
                    user: {
                        include: {
                            profile: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            database_1.prisma.userBlock.count({
                where: {
                    isActive: true,
                    OR: [
                        { isPermanent: true },
                        {
                            isPermanent: false,
                            endDate: {
                                gt: new Date(),
                            },
                        },
                    ],
                },
            }),
        ]);
        const formattedBlocks = activeBlocks.map((block) => {
            var _a;
            return ({
                id: block.id,
                userId: block.userId,
                reason: block.reason,
                isPermanent: block.isPermanent,
                startDate: block.startDate.toISOString(),
                endDate: ((_a = block.endDate) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                isActive: block.isActive,
                createdAt: block.createdAt.toISOString(),
                updatedAt: block.updatedAt.toISOString(),
                user: {
                    id: block.user.id,
                    email: block.user.email,
                    profile: block.user.profile,
                },
            });
        });
        res.json({
            status: 'success',
            data: {
                blocks: formattedBlocks,
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
exports.getAllActiveBlocks = getAllActiveBlocks;
// Проверка активной блокировки пользователя (вспомогательная функция)
const checkUserBlock = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const activeBlock = yield database_1.prisma.userBlock.findFirst({
        where: {
            userId,
            isActive: true,
            OR: [
                { isPermanent: true },
                {
                    isPermanent: false,
                    endDate: {
                        gt: new Date(),
                    },
                },
            ],
        },
    });
    return activeBlock;
});
exports.checkUserBlock = checkUserBlock;
