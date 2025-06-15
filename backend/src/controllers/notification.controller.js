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
exports.createNotification = exports.markNotificationAsRead = exports.getNotifications = void 0;
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
