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
function addTestTimeSlots() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('🔧 Добавление тестовых временных слотов...');
            // Найдем интервьюера
            const interviewer = yield prisma.user.findFirst({
                where: { role: 'INTERVIEWER' },
            });
            if (!interviewer) {
                console.error('❌ Интервьюер не найден');
                return;
            }
            console.log(`👨‍💼 Найден интервьюер: ${interviewer.id}`);
            // Создаем слоты на завтра и послезавтра
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(10, 0, 0, 0); // 10:00
            const dayAfterTomorrow = new Date();
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
            dayAfterTomorrow.setHours(14, 0, 0, 0); // 14:00
            const testSlots = [
                {
                    interviewerId: interviewer.id,
                    startTime: new Date(tomorrow),
                    endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000), // +1 час
                    specialization: 'Frontend разработка',
                    status: 'AVAILABLE',
                },
                {
                    interviewerId: interviewer.id,
                    startTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // +2 часа от первого
                    endTime: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000), // +3 часа от первого
                    specialization: 'Backend разработка',
                    status: 'AVAILABLE',
                },
                {
                    interviewerId: interviewer.id,
                    startTime: new Date(dayAfterTomorrow),
                    endTime: new Date(dayAfterTomorrow.getTime() + 60 * 60 * 1000), // +1 час
                    specialization: 'Fullstack разработка',
                    status: 'AVAILABLE',
                },
                {
                    interviewerId: interviewer.id,
                    startTime: new Date(dayAfterTomorrow.getTime() + 2 * 60 * 60 * 1000), // +2 часа
                    endTime: new Date(dayAfterTomorrow.getTime() + 3 * 60 * 60 * 1000), // +3 часа
                    specialization: 'Frontend разработка',
                    status: 'AVAILABLE',
                },
            ];
            console.log('📅 Создаем следующие слоты:');
            testSlots.forEach((slot, index) => {
                console.log(`${index + 1}. ${slot.specialization}`);
                console.log(`   Время: ${slot.startTime} - ${slot.endTime}`);
            });
            // Создаем слоты
            for (const slotData of testSlots) {
                const slot = yield prisma.timeSlot.create({
                    data: slotData,
                    include: {
                        interviewer: {
                            include: {
                                profile: true,
                            },
                        },
                    },
                });
                console.log(`✅ Создан слот: ${slot.id} (${slot.specialization})`);
            }
            console.log('🎉 Тестовые слоты успешно добавлены!');
            // Проверим общее количество слотов
            const totalCount = yield prisma.timeSlot.count();
            const availableCount = yield prisma.timeSlot.count({
                where: { status: 'AVAILABLE' },
            });
            console.log(`📊 Общее количество слотов: ${totalCount}`);
            console.log(`📊 Доступные слоты: ${availableCount}`);
        }
        catch (error) {
            console.error('❌ Ошибка при добавлении тестовых слотов:', error);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
addTestTimeSlots();
