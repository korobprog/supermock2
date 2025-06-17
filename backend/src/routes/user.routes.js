"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const upload_1 = require("../middleware/upload");
const user_schema_1 = require("../schemas/user.schema");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', (0, validate_1.validate)(user_schema_1.registerSchema), user_controller_1.register);
router.post('/login', (0, validate_1.validate)(user_schema_1.loginSchema), user_controller_1.login);
router.get('/interests', user_controller_1.getInterests);
// Test route
router.get('/test', (req, res) => {
    console.log('🔍 [TEST ROUTE] Test route hit!');
    res.json({ message: 'Test route works!' });
});
// Protected routes
router.get('/me', auth_1.authenticate, user_controller_1.getCurrentUser);
router.patch('/profile', auth_1.authenticate, (0, validate_1.validate)(user_schema_1.updateProfileSchema), user_controller_1.updateProfile);
// Upload avatar route
console.log('🔍 [ROUTES DEBUG] Registering POST /avatar route');
// Полный маршрут для загрузки аватарки
router.post('/avatar', (req, res, next) => {
    console.log('🔍 [AVATAR ROUTE DEBUG] POST /avatar route hit!');
    console.log('🔍 [AVATAR ROUTE DEBUG] Request method:', req.method);
    console.log('🔍 [AVATAR ROUTE DEBUG] Request path:', req.path);
    console.log('🔍 [AVATAR ROUTE DEBUG] Request URL:', req.url);
    console.log('🔍 [AVATAR ROUTE DEBUG] Original URL:', req.originalUrl);
    console.log('🔍 [AVATAR ROUTE DEBUG] Base URL:', req.baseUrl);
    console.log('🔍 [AVATAR ROUTE DEBUG] Content-Type:', req.headers['content-type']);
    console.log('🔍 [AVATAR ROUTE DEBUG] Content-Length:', req.headers['content-length']);
    next();
}, (req, res, next) => {
    console.log('🔍 [AVATAR ROUTE DEBUG] Before authenticate middleware');
    next();
}, auth_1.authenticate, (req, res, next) => {
    console.log('🔍 [AVATAR ROUTE DEBUG] After authenticate middleware, before upload');
    console.log('🔍 [AVATAR ROUTE DEBUG] User authenticated:', req.user ? 'Yes' : 'No');
    next();
}, upload_1.uploadAvatar, (req, res, next) => {
    console.log('🔍 [AVATAR ROUTE DEBUG] After upload middleware, before error handler');
    next();
}, upload_1.handleUploadError, (req, res, next) => {
    console.log('🔍 [AVATAR ROUTE DEBUG] After error handler, before controller');
    next();
}, user_controller_1.uploadAvatar);
// Remove avatar route
router.delete('/avatar', auth_1.authenticate, user_controller_1.removeAvatar);
// Admin routes for interest management
router.post('/interests', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validate_1.validate)(user_schema_1.createInterestSchema), user_controller_1.createInterest);
router.put('/interests/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validate_1.validate)(user_schema_1.updateInterestSchema), user_controller_1.updateInterest);
router.delete('/interests/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validate_1.validate)(user_schema_1.deleteInterestSchema), user_controller_1.deleteInterest);
// Admin routes for user blocking
router.post('/:userId/block', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validate_1.validate)(user_schema_1.blockUserSchema), user_controller_1.blockUser);
router.delete('/:userId/block', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validate_1.validate)(user_schema_1.unblockUserSchema), user_controller_1.unblockUser);
router.get('/:userId/block-status', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validate_1.validate)(user_schema_1.checkUserBlockSchema), user_controller_1.checkUserBlockStatus);
exports.default = router;
