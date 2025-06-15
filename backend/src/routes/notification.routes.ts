import { Router } from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  createNotification,
} from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Notification routes
router.get('/', getNotifications as any);
router.patch('/:id/read', markNotificationAsRead as any);
router.post('/', createNotification as any);

export default router;
