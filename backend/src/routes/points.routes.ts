import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getUserPointsBalance,
  getUserPointsTransactions,
} from '../controllers/points.controller';

const router = Router();

// Все маршруты для работы с баллами требуют аутентификации
router.use(authenticate);

// Получение текущего баланса баллов пользователя
router.get('/balance', getUserPointsBalance);

// Получение истории транзакций с баллами
router.get('/transactions', getUserPointsTransactions);

export default router;
