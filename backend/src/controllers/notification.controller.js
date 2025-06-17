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
exports.markAdminNotificationAsRead = exports.getUserAdminNotifications = exports.sendAdminNotification = exports.createNotification = exports.markNotificationAsRead = exports.getNotifications = void 0;
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
// Mock data for development
const mockNotifications = [
    {
        id: 1,
        message: 'Новое интервью запланировано на завтра в 10:00',
        date: '2025-06-14T08:00:00Z',
        type: 'interview',
        read: false,
    },
    {
        id: 2,
        message: 'Получена обратная связь по интервью Frontend Developer',
        date: '2025-06-13T16:30:00Z',
        type: 'feedback',
        read: false,
    },
    {
        id: 3,
        message: 'Ваш профиль был успешно обновлен',
        date: '2025-06-12T12:15:00Z',
        type: 'profile',
        read: true,
    },
    {
        id: 4,
        message: 'Напоминание: интервью через 1 час',
        date: '2025-06-11T09:00:00Z',
        type: 'reminder',
        read: true,
    },
];
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // В реальном приложении здесь будет запрос к базе данных
        // const notifications = await prisma.notification.findMany({
        //   where: { userId: req.user.id },
        //   orderBy: { createdAt: 'desc' }
        // });
        res.json(mockNotifications);
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});
exports.getNotifications = getNotifications;
const markNotificationAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // В реальном приложении здесь будет обновление в базе данных
        // const notification = await prisma.notification.update({
        //   where: {
        //     id: parseInt(id),
        //     userId: req.user.id
        //   },
        //   data: { read: true }
        // });
        const notification = mockNotifications.find((n) => n.id === parseInt(id));
        if (notification) {
            notification.read = true;
            res.json(notification);
        }
        else {
            res.status(404).json({ error: 'Notification not found' });
        }
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});
exports.markNotificationAsRead = markNotificationAsRead;
const createNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message, type } = req.body;
        // В реальном приложении здесь будет создание уведомления в базе данных
        const newNotification = {
            id: mockNotifications.length + 1,
            message,
            type,
            date: new Date().toISOString(),
            read: false,
            userId: req.user.id,
        };
        res.status(201).json(newNotification);
    }
    catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'Failed to create notification' });
    }
});
exports.createNotification = createNotification;
// Send admin notification to user (admin only)
const sendAdminNotification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { message } = req.body;
        // Check if target user exists
        const targetUser = yield database_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
            },
        });
        if (!targetUser) {
            throw new errors_1.NotFoundError('User not found');
        }
        // Create admin notification
        const adminNotification = yield database_1.prisma.adminNotification.create({
            data: {
                userId,
                message,
            },
        });
        res.status(201).json({
            status: 'success',
            data: {
                notification: adminNotification,
                targetUser: {
                    id: targetUser.id,
                    email: targetUser.email,
                    profile: targetUser.profile,
                },
            },
            message: 'Admin notification sent successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.sendAdminNotification = sendAdminNotification;
// Get admin notifications for user
const getUserAdminNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const notifications = yield database_1.prisma.adminNotification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json({
            status: 'success',
            data: {
                notifications,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserAdminNotifications = getUserAdminNotifications;
// Mark admin notification as read
const markAdminNotificationAsRead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;
        // Find and update the notification
        const notification = yield database_1.prisma.adminNotification.findFirst({
            where: {
                id: notificationId,
                userId,
            },
        });
        if (!notification) {
            throw new errors_1.NotFoundError('Notification not found');
        }
        const updatedNotification = yield database_1.prisma.adminNotification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
        res.json({
            status: 'success',
            data: {
                notification: updatedNotification,
            },
            message: 'Notification marked as read',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.markAdminNotificationAsRead = markAdminNotificationAsRead;
