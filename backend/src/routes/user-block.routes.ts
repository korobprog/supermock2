import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  blockUser,
  unblockUser,
  getUserBlocks,
  getAllActiveBlocks,
} from '../controllers/user-block.controller';
import {
  blockUserSchema,
  unblockUserSchema,
  getUserBlocksSchema,
  getAllActiveBlocksSchema,
} from '../schemas/user-block.schema';

const router = Router();

// Все маршруты для работы с блокировками требуют аутентификации
router.use(authenticate);

// Все маршруты доступны только администраторам
router.use(authorize('ADMIN'));

// Блокировка пользователя
router.post('/', validate(blockUserSchema), blockUser);

// Разблокировка пользователя
router.delete('/:id', validate(unblockUserSchema), unblockUser);

// Получение истории блокировок пользователя
router.get('/user/:userId', validate(getUserBlocksSchema), getUserBlocks);

// Получение всех активных блокировок
router.get('/active', validate(getAllActiveBlocksSchema), getAllActiveBlocks);

export default router;
