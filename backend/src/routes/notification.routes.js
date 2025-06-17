"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const user_schema_1 = require("../schemas/user.schema");
const router = (0, express_1.Router)();
// All notification routes require authentication
router.use(auth_1.authenticate);
// Notification routes
router.get('/', notification_controller_1.getNotifications);
router.patch('/:id/read', notification_controller_1.markNotificationAsRead);
router.post('/', notification_controller_1.createNotification);
// Admin notification routes
router.post('/admin/:userId', (0, auth_1.authorize)('ADMIN'), (0, validate_1.validate)(user_schema_1.sendAdminNotificationSchema), notification_controller_1.sendAdminNotification);
// User admin notification routes
router.get('/admin', notification_controller_1.getUserAdminNotifications);
router.patch('/admin/:notificationId/read', notification_controller_1.markAdminNotificationAsRead);
exports.default = router;
