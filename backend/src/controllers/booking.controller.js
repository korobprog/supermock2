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
exports.getInterviewerBookings = exports.confirmBooking = exports.cancelBooking = exports.getBookingById = exports.getBookings = exports.createBooking = void 0;
const database_1 = require("../config/database");
// Константы для системы баллов
const BOOKING_COST = 10; // Стоимость бронирования в баллах
const REFUND_HOURS_THRESHOLD = 24; // Часы до начала для полного возврата
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slotId } = req.body;
        // Проверяем, что временной слот существует и доступен
        const timeSlot = yield database_1.prisma.timeSlot.findUnique({
            where: { id: slotId },
            include: {
                interviewer: {
                    include: {
                        profile: true,
                    },
                },
                booking: true,
            },
        });
        if (!timeSlot) {
            return res.status(404).json({ error: 'Временной слот не найден' });
        }
        if (timeSlot.status !== 'AVAILABLE') {
            return res.status(400).json({ error: 'Временной слот недоступен' });
        }
        if (timeSlot.booking) {
            return res.status(400).json({ error: 'Временной слот уже забронирован' });
        }
        // Проверяем, что пользователь не бронирует свой собственный слот
        if (timeSlot.interviewerId === req.user.id) {
            return res.status(400).json({
                error: 'Нельзя забронировать собственный временной слот',
            });
        }
        // Проверяем, что слот в будущем
        if (timeSlot.startTime <= new Date()) {
            return res.status(400).json({
                error: 'Нельзя забронировать прошедший временной слот',
            });
        }
        // Получаем баланс баллов пользователя
        const pointsTransactions = yield database_1.prisma.pointsTransaction.findMany({
            where: { userId: req.user.id },
        });
        const currentPoints = pointsTransactions.reduce((sum, transaction) => {
            return transaction.type === 'EARNED'
                ? sum + transaction.amount
                : sum - transaction.amount;
        }, 0);
        if (currentPoints < BOOKING_COST) {
            return res.status(400).json({
                error: `Недостаточно баллов. Требуется: ${BOOKING_COST}, доступно: ${currentPoints}`,
            });
        }
        // Создаем бронирование в транзакции
        const result = yield database_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Создаем бронирование
            const booking = yield tx.booking.create({
                data: {
                    slotId,
                    candidateId: req.user.id,
                    pointsSpent: BOOKING_COST,
                    status: 'CREATED',
                },
                include: {
                    slot: {
                        include: {
                            interviewer: {
                                include: {
                                    profile: true,
                                },
                            },
                        },
                    },
                    candidate: {
                        include: {
                            profile: true,
                        },
                    },
                },
            });
            // Обновляем статус временного слота
            yield tx.timeSlot.update({
                where: { id: slotId },
                data: { status: 'BOOKED' },
            });
            // Списываем баллы
            yield tx.pointsTransaction.create({
                data: {
                    userId: req.user.id,
                    amount: BOOKING_COST,
                    type: 'SPENT',
                    description: `Бронирование собеседования на ${timeSlot.startTime.toLocaleString()}`,
                },
            });
            // Создаем уведомления
            yield tx.bookingNotification.createMany({
                data: [
                    {
                        userId: req.user.id,
                        bookingId: booking.id,
                        type: 'CREATION',
                    },
                    {
                        userId: timeSlot.interviewerId,
                        bookingId: booking.id,
                        type: 'CREATION',
                    },
                ],
            });
            return booking;
        }));
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});
exports.createBooking = createBooking;
const getBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, specialization, startDate, endDate } = req.query;
        const whereConditions = {
            candidateId: req.user.id,
        };
        // Фильтрация по статусу
        if (status) {
            whereConditions.status = status;
        }
        // Фильтрация по специализации (точное совпадение)
        if (specialization) {
            whereConditions.slot = {
                specialization: specialization,
            };
        }
        // Фильтрация по датам
        if (startDate || endDate) {
            whereConditions.slot = Object.assign(Object.assign({}, whereConditions.slot), { startTime: {} });
            if (startDate) {
                whereConditions.slot.startTime.gte = new Date(startDate);
            }
            if (endDate) {
                whereConditions.slot.startTime.lte = new Date(endDate);
            }
        }
        const bookings = yield database_1.prisma.booking.findMany({
            where: whereConditions,
            include: {
                slot: {
                    include: {
                        interviewer: {
                            include: {
                                profile: true,
                            },
                        },
                    },
                },
                candidate: {
                    include: {
                        profile: true,
                    },
                },
                interview: true,
                notifications: {
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(bookings);
    }
    catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});
exports.getBookings = getBookings;
const getBookingById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const booking = yield database_1.prisma.booking.findFirst({
            where: {
                id,
                OR: [
                    { candidateId: req.user.id },
                    { slot: { interviewerId: req.user.id } },
                ],
            },
            include: {
                slot: {
                    include: {
                        interviewer: {
                            include: {
                                profile: true,
                            },
                        },
                    },
                },
                candidate: {
                    include: {
                        profile: true,
                    },
                },
                interview: {
                    include: {
                        feedback: true,
                        scores: true,
                        result: true,
                    },
                },
                notifications: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!booking) {
            return res.status(404).json({ error: 'Бронирование не найдено' });
        }
        res.json(booking);
    }
    catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
});
exports.getBookingById = getBookingById;
const cancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        // Проверяем, что бронирование существует и принадлежит пользователю
        const booking = yield database_1.prisma.booking.findFirst({
            where: {
                id,
                candidateId: req.user.id,
            },
            include: {
                slot: true,
            },
        });
        if (!booking) {
            return res.status(404).json({
                error: 'Бронирование не найдено или доступ запрещен',
            });
        }
        if (booking.status === 'CANCELLED') {
            return res.status(400).json({ error: 'Бронирование уже отменено' });
        }
        if (booking.status === 'COMPLETED') {
            return res
                .status(400)
                .json({ error: 'Нельзя отменить завершенное бронирование' });
        }
        // Проверяем, что бронирование еще не началось
        if (booking.slot.startTime <= new Date()) {
            return res.status(400).json({
                error: 'Нельзя отменить бронирование после начала собеседования',
            });
        }
        // Вычисляем возврат баллов
        const hoursUntilStart = (booking.slot.startTime.getTime() - new Date().getTime()) /
            (1000 * 60 * 60);
        const refundAmount = hoursUntilStart >= REFUND_HOURS_THRESHOLD
            ? booking.pointsSpent
            : Math.floor(booking.pointsSpent * 0.5); // 50% возврат при отмене менее чем за 24 часа
        // Отменяем бронирование в транзакции
        const result = yield database_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Обновляем статус бронирования
            const updatedBooking = yield tx.booking.update({
                where: { id },
                data: { status: 'CANCELLED' },
                include: {
                    slot: {
                        include: {
                            interviewer: {
                                include: {
                                    profile: true,
                                },
                            },
                        },
                    },
                    candidate: {
                        include: {
                            profile: true,
                        },
                    },
                },
            });
            // Освобождаем временной слот
            yield tx.timeSlot.update({
                where: { id: booking.slotId },
                data: { status: 'AVAILABLE' },
            });
            // Возвращаем баллы
            if (refundAmount > 0) {
                yield tx.pointsTransaction.create({
                    data: {
                        userId: req.user.id,
                        amount: refundAmount,
                        type: 'REFUNDED',
                        description: `Возврат за отмену бронирования${reason ? `: ${reason}` : ''}`,
                    },
                });
            }
            // Создаем уведомления об отмене
            yield tx.bookingNotification.createMany({
                data: [
                    {
                        userId: req.user.id,
                        bookingId: booking.id,
                        type: 'CANCELLATION',
                    },
                    {
                        userId: booking.slot.interviewerId,
                        bookingId: booking.id,
                        type: 'CANCELLATION',
                    },
                ],
            });
            return updatedBooking;
        }));
        res.json(Object.assign(Object.assign({}, result), { refundAmount, message: `Бронирование отменено. Возвращено баллов: ${refundAmount}` }));
    }
    catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
});
exports.cancelBooking = cancelBooking;
const confirmBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Проверяем, что бронирование существует и пользователь является интервьюером
        const booking = yield database_1.prisma.booking.findFirst({
            where: {
                id,
                slot: { interviewerId: req.user.id },
            },
            include: {
                slot: true,
            },
        });
        if (!booking) {
            return res.status(404).json({
                error: 'Бронирование не найдено или доступ запрещен',
            });
        }
        if (booking.status !== 'CREATED') {
            return res.status(400).json({
                error: 'Можно подтвердить только новые бронирования',
            });
        }
        // Подтверждаем бронирование в транзакции
        const result = yield database_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Обновляем статус бронирования
            const updatedBooking = yield tx.booking.update({
                where: { id },
                data: { status: 'CONFIRMED' },
                include: {
                    slot: {
                        include: {
                            interviewer: {
                                include: {
                                    profile: true,
                                },
                            },
                        },
                    },
                    candidate: {
                        include: {
                            profile: true,
                        },
                    },
                },
            });
            // Создаем интервью на основе бронирования
            const interview = yield tx.interview.create({
                data: {
                    title: `Собеседование: ${booking.slot.specialization}`,
                    description: `Собеседование по специализации ${booking.slot.specialization}`,
                    specialization: booking.slot.specialization,
                    interviewerId: booking.slot.interviewerId,
                    participantId: booking.candidateId,
                    scheduledAt: booking.slot.startTime,
                    duration: Math.floor((booking.slot.endTime.getTime() -
                        booking.slot.startTime.getTime()) /
                        (1000 * 60)),
                    videoLink: `https://meet.example.com/interview-${booking.id}`, // Генерируем ссылку на видеозвонок
                },
            });
            // Связываем бронирование с интервью
            yield tx.booking.update({
                where: { id },
                data: { interviewId: interview.id },
            });
            // Создаем уведомления о подтверждении
            yield tx.bookingNotification.createMany({
                data: [
                    {
                        userId: booking.candidateId,
                        bookingId: booking.id,
                        type: 'CONFIRMATION',
                    },
                    {
                        userId: req.user.id,
                        bookingId: booking.id,
                        type: 'CONFIRMATION',
                    },
                ],
            });
            return Object.assign(Object.assign({}, updatedBooking), { interview });
        }));
        res.json(result);
    }
    catch (error) {
        console.error('Error confirming booking:', error);
        res.status(500).json({ error: 'Failed to confirm booking' });
    }
});
exports.confirmBooking = confirmBooking;
const getInterviewerBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, specialization, startDate, endDate } = req.query;
        const whereConditions = {
            slot: { interviewerId: req.user.id },
        };
        // Фильтрация по статусу
        if (status) {
            whereConditions.status = status;
        }
        // Фильтрация по специализации (точное совпадение)
        if (specialization) {
            whereConditions.slot.specialization = specialization;
        }
        // Фильтрация по датам
        if (startDate || endDate) {
            whereConditions.slot.startTime = {};
            if (startDate) {
                whereConditions.slot.startTime.gte = new Date(startDate);
            }
            if (endDate) {
                whereConditions.slot.startTime.lte = new Date(endDate);
            }
        }
        const bookings = yield database_1.prisma.booking.findMany({
            where: whereConditions,
            include: {
                slot: {
                    include: {
                        interviewer: {
                            include: {
                                profile: true,
                            },
                        },
                    },
                },
                candidate: {
                    include: {
                        profile: true,
                    },
                },
                interview: true,
                notifications: {
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(bookings);
    }
    catch (error) {
        console.error('Error fetching interviewer bookings:', error);
        res.status(500).json({ error: 'Failed to fetch interviewer bookings' });
    }
});
exports.getInterviewerBookings = getInterviewerBookings;
