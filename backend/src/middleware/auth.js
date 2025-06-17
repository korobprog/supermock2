"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const env_1 = __importDefault(require("../config/env"));
const errors_1 = require("../utils/errors");
const user_block_controller_1 = require("../controllers/user-block.controller");
// Authentication middleware
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('🔍 [AUTH DEBUG] Authentication middleware called for:', req.method, req.path);
        console.log('🔍 [AUTH DEBUG] Full URL:', req.url);
        console.log('🔍 [AUTH DEBUG] Headers:', {
            authorization: req.headers.authorization ? 'Bearer [TOKEN]' : 'Missing',
            'content-type': req.headers['content-type'],
        });
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
            console.log('❌ [AUTH DEBUG] No valid authorization header');
            throw new errors_1.UnauthorizedError('No token provided');
        }
        const token = authHeader.split(' ')[1];
        console.log('✅ [AUTH DEBUG] Token found, verifying...');
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, env_1.default.JWT_SECRET);
        // Check if user exists
        const user = yield database_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true },
        });
        if (!user) {
            throw new errors_1.UnauthorizedError('User not found');
        }
        // Check if user is blocked (skip for admin routes to allow admins to manage blocks)
        if (!req.path.startsWith('/user-blocks')) {
            const activeBlock = yield (0, user_block_controller_1.checkUserBlock)(user.id);
            if (activeBlock) {
                throw new errors_1.UnauthorizedError(`Аккаунт заблокирован. Причина: ${activeBlock.reason}${activeBlock.isPermanent
                    ? ' (постоянная блокировка)'
                    : ` до ${(_a = activeBlock.endDate) === null || _a === void 0 ? void 0 : _a.toLocaleDateString('ru-RU')}`}`);
            }
        }
        // Attach user to request
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new errors_1.UnauthorizedError('Invalid token'));
        }
        else {
            next(error);
        }
    }
});
exports.authenticate = authenticate;
// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errors_1.UnauthorizedError('User not authenticated'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errors_1.UnauthorizedError('Insufficient permissions'));
        }
        next();
    };
};
exports.authorize = authorize;
