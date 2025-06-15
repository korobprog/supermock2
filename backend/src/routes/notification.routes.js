"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All notification routes require authentication
router.use(auth_1.authenticate);
// Notification routes
router.get('/', notification_controller_1.getNotifications);
router.patch('/:id/read', notification_controller_1.markNotificationAsRead);
router.post('/', notification_controller_1.createNotification);
exports.default = router;
