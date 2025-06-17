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
function checkTimeSlots() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('🔍 Проверка временных слотов в базе данных...');
            // Общее количество слотов
            const totalCount = yield prisma.timeSlot.count();
            console.log(`📊 Общее количество слотов: ${totalCount}`);
            // Количество по статусам
            const availableCount = yield prisma.timeSlot.count({
                where: { status: 'AVAILABLE' },
            });
            const bookedCount = yield prisma.timeSlot.count({
                where: { status: 'BOOKED' },
            });
            const cancelledCount = yield prisma.timeSlot.count({
                where: { status: 'CANCELLED' },
            });
            console.log(`📊 Доступные слоты: ${availableCount}`);
            console.log(`📊 Забронированные слоты: ${bookedCount}`);
            console.log(`📊 Отмененные слоты: ${cancelledCount}`);
            // Показать несколько примеров слотов
            const sampleSlots = yield prisma.timeSlot.findMany({
                take: 5,
                include: {
                    interviewer: {
                        include: {
                            profile: true,
                        },
                    },
                    booking: {
                        include: {
                            candidate: {
                                include: {
                                    profile: true,
                                },
                            },
                            interview: true,
                        },
                    },
                },
            });
            console.log('📋 Примеры слотов:');
            sampleSlots.forEach((slot, index) => {
                var _a, _b, _c, _d;
                console.log(`${index + 1}. ID: ${slot.id}`);
                console.log(`   Статус: ${slot.status}`);
                console.log(`   Специализация: ${slot.specialization}`);
                console.log(`   Время: ${slot.startTime} - ${slot.endTime}`);
                console.log(`   Интервьюер: ${(_a = slot.interviewer.profile) === null || _a === void 0 ? void 0 : _a.firstName} ${(_b = slot.interviewer.profile) === null || _b === void 0 ? void 0 : _b.lastName}`);
                if (slot.booking) {
                    console.log(`   Бронирование: ${slot.booking.status}`);
                    console.log(`   Кандидат: ${(_c = slot.booking.candidate.profile) === null || _c === void 0 ? void 0 : _c.firstName} ${(_d = slot.booking.candidate.profile) === null || _d === void 0 ? void 0 : _d.lastName}`);
                }
                console.log('---');
            });
            // Проверим пользователей
            const usersCount = yield prisma.user.count();
            const interviewersCount = yield prisma.user.count({
                where: { role: 'INTERVIEWER' },
            });
            const candidatesCount = yield prisma.user.count({
                where: { role: 'USER' },
            });
            console.log(`👥 Общее количество пользователей: ${usersCount}`);
            console.log(`👨‍💼 Интервьюеры: ${interviewersCount}`);
            console.log(`👨‍💻 Кандидаты: ${candidatesCount}`);
        }
        catch (error) {
            console.error('❌ Ошибка при проверке данных:', error);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
checkTimeSlots();
