"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const user_block_controller_1 = require("../controllers/user-block.controller");
const user_block_schema_1 = require("../schemas/user-block.schema");
const router = (0, express_1.Router)();
// Все маршруты для работы с блокировками требуют аутентификации
router.use(auth_1.authenticate);
// Все маршруты доступны только администраторам
router.use((0, auth_1.authorize)('ADMIN'));
// Блокировка пользователя
router.post('/', (0, validate_1.validate)(user_block_schema_1.blockUserSchema), user_block_controller_1.blockUser);
// Разблокировка пользователя
router.delete('/:id', (0, validate_1.validate)(user_block_schema_1.unblockUserSchema), user_block_controller_1.unblockUser);
// Получение истории блокировок пользователя
router.get('/user/:userId', (0, validate_1.validate)(user_block_schema_1.getUserBlocksSchema), user_block_controller_1.getUserBlocks);
// Получение всех активных блокировок
router.get('/active', (0, validate_1.validate)(user_block_schema_1.getAllActiveBlocksSchema), user_block_controller_1.getAllActiveBlocks);
exports.default = router;
