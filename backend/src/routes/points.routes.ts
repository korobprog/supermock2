import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getUserPointsBalance,
  getUserPointsTransactions,
  addPointsByAdmin,
  subtractPointsByAdmin,
  editUserPointsByAdmin,
  getUserPointsBalanceByAdmin,
  getUserPointsTransactionsByAdmin,
} from '../controllers/points.controller';

const router = Router();

// Все маршруты для работы с баллами требуют аутентификации
router.use(authenticate);

// Пользовательские маршруты
// Получение текущего баланса баллов пользователя
router.get('/balance', getUserPointsBalance);

// Получение истории транзакций с баллами
router.get('/transactions', getUserPointsTransactions);

// Административные маршруты (только для администраторов)
// Добавление баллов пользователю
router.post('/admin/:userId/add', authorize('ADMIN'), addPointsByAdmin);

// Вычитание баллов у пользователя
router.post(
  '/admin/:userId/subtract',
  authorize('ADMIN'),
  subtractPointsByAdmin
);

// Редактирование баллов пользователя (установка нового баланса)
router.put('/admin/:userId/edit', authorize('ADMIN'), editUserPointsByAdmin);

// Получение баланса баллов пользователя администратором
router.get(
  '/admin/:userId/balance',
  authorize('ADMIN'),
  getUserPointsBalanceByAdmin
);

// Получение истории транзакций пользователя администратором
router.get(
  '/admin/:userId/transactions',
  authorize('ADMIN'),
  getUserPointsTransactionsByAdmin
);

export default router;
