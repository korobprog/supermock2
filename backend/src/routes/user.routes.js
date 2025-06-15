"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const user_schema_1 = require("../schemas/user.schema");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', (0, validate_1.validate)(user_schema_1.registerSchema), user_controller_1.register);
router.post('/login', (0, validate_1.validate)(user_schema_1.loginSchema), user_controller_1.login);
// Protected routes
router.get('/me', auth_1.authenticate, user_controller_1.getCurrentUser);
router.patch('/profile', auth_1.authenticate, (0, validate_1.validate)(user_schema_1.updateProfileSchema), user_controller_1.updateProfile);
router.get('/interests', auth_1.authenticate, user_controller_1.getInterests);
exports.default = router;
