import { Router } from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  createNotification,
  sendAdminNotification,
  getUserAdminNotifications,
  markAdminNotificationAsRead,
} from '../controllers/notification.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { sendAdminNotificationSchema } from '../schemas/user.schema';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Notification routes
router.get('/', getNotifications as any);
router.patch('/:id/read', markNotificationAsRead as any);
router.post('/', createNotification as any);

// Admin notification routes
router.post(
  '/admin/:userId',
  authorize('ADMIN'),
  validate(sendAdminNotificationSchema),
  sendAdminNotification as any
);

// User admin notification routes
router.get('/admin', getUserAdminNotifications as any);
router.patch('/admin/:notificationId/read', markAdminNotificationAsRead as any);

export default router;
