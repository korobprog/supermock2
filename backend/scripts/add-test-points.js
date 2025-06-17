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
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function addTestPoints() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // ID пользователя из логов
            const userId = '757780a7-95ef-4bdf-a687-680f5dc0163d';
            console.log('🔍 Добавляем тестовые баллы для пользователя:', userId);
            // Проверяем, существует ли пользователь
            const user = yield prisma.user.findUnique({
                where: { id: userId },
                include: { profile: true },
            });
            if (!user) {
                console.error('❌ Пользователь не найден:', userId);
                return;
            }
            console.log('✅ Пользователь найден:', user.email);
            // Добавляем несколько тестовых транзакций
            const transactions = [
                {
                    userId,
                    amount: 100,
                    type: 'EARNED',
                    description: 'Регистрационный бонус',
                },
                {
                    userId,
                    amount: 50,
                    type: 'EARNED',
                    description: 'Заполнение профиля',
                },
                {
                    userId,
                    amount: 25,
                    type: 'SPENT',
                    description: 'Бронирование интервью',
                },
            ];
            for (const transaction of transactions) {
                const created = yield prisma.pointsTransaction.create({
                    data: transaction,
                });
                console.log(`✅ Создана транзакция: ${transaction.type} ${transaction.amount} - ${transaction.description}`);
            }
            // Проверяем итоговый баланс
            const allTransactions = yield prisma.pointsTransaction.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });
            const balance = allTransactions.reduce((sum, t) => {
                return t.type === 'EARNED' ? sum + t.amount : sum - t.amount;
            }, 0);
            console.log('🎯 Итоговый баланс:', balance, 'баллов');
            console.log('📊 Всего транзакций:', allTransactions.length);
        }
        catch (error) {
            console.error('❌ Ошибка при добавлении тестовых баллов:', error);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
addTestPoints();
