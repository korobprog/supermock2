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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = __importDefault(require("./config/env"));
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const interview_routes_1 = __importDefault(require("./routes/interview.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const points_routes_1 = __importDefault(require("./routes/points.routes"));
const user_block_routes_1 = __importDefault(require("./routes/user-block.routes"));
const errors_1 = require("./utils/errors");
const rateLimiter_1 = require("./middleware/rateLimiter");
// Создаем папки для загрузки файлов при старте сервера
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
const avatarsDir = path_1.default.join(uploadsDir, 'avatars');
if (!fs_1.default.existsSync(uploadsDir)) {
    console.log('📁 Creating uploads directory...');
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs_1.default.existsSync(avatarsDir)) {
    console.log('📁 Creating avatars directory...');
    fs_1.default.mkdirSync(avatarsDir, { recursive: true });
}
// Create Express application
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Получаем разрешенные origins из переменной окружения или используем значения по умолчанию
        const corsOrigins = env_1.default.CORS_ORIGIN.split(',').map((o) => o.trim());
        const defaultOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://localhost:5176',
            'http://localhost:5177',
            'http://localhost:5178',
            'http://localhost:5179',
            'http://localhost:5180',
        ];
        const allowedOrigins = corsOrigins.length > 1 ? corsOrigins : defaultOrigins;
        // Разрешить запросы без origin (например, мобильные приложения)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Статическая раздача загруженных файлов
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Apply rate limiter to all routes
app.use(rateLimiter_1.rateLimiter);
// Middleware для логирования всех запросов
app.use((req, res, next) => {
    console.log(`🔍 [REQUEST DEBUG] ${req.method} ${req.url}`);
    console.log(`🔍 [REQUEST DEBUG] Headers:`, req.headers);
    console.log(`🔍 [REQUEST DEBUG] Content-Type:`, req.headers['content-type']);
    console.log(`🔍 [REQUEST DEBUG] Authorization:`, req.headers.authorization ? 'Present' : 'Missing');
    next();
});
// Middleware для отслеживания обработки маршрутов
app.use((req, res, next) => {
    console.log(`🔍 [ROUTE DEBUG] Processing route: ${req.method} ${req.url}`);
    next();
});
// API Routes with prefix
console.log('🔍 [ROUTES DEBUG] API_PREFIX:', env_1.default.API_PREFIX);
console.log('🔍 [ROUTES DEBUG] Registering user routes at:', `${env_1.default.API_PREFIX}/users`);
console.log('🔍 [ROUTES DEBUG] Full avatar endpoint will be:', `${env_1.default.API_PREFIX}/users/avatar`);
// Middleware для отладки маршрутов перед их регистрацией
app.use((req, res, next) => {
    console.log(`🔍 [ROUTE MATCH DEBUG] Checking route: ${req.method} ${req.originalUrl}`);
    next();
});
// Добавляем логирование для каждого подключаемого роутера
app.use(`${env_1.default.API_PREFIX}/users`, (req, res, next) => {
    console.log(`🔍 [USER ROUTES DEBUG] User routes middleware hit: ${req.method} ${req.originalUrl}`);
    console.log(`🔍 [USER ROUTES DEBUG] Path after prefix: ${req.path}`);
    console.log(`🔍 [USER ROUTES DEBUG] URL: ${req.url}`);
    next();
}, user_routes_1.default);
app.use(`${env_1.default.API_PREFIX}/interviews`, interview_routes_1.default);
app.use(`${env_1.default.API_PREFIX}/notifications`, notification_routes_1.default);
app.use(`${env_1.default.API_PREFIX}/points`, points_routes_1.default);
app.use(`${env_1.default.API_PREFIX}/user-blocks`, user_block_routes_1.default);
app.use(`${env_1.default.API_PREFIX}`, booking_routes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env_1.default.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
    });
});
// Middleware для отлова всех необработанных маршрутов
app.use('*', (req, res, next) => {
    console.log(`❌ [404 DEBUG] Unhandled route: ${req.method} ${req.originalUrl}`);
    console.log(`❌ [404 DEBUG] Base URL: ${req.baseUrl}`);
    console.log(`❌ [404 DEBUG] Path: ${req.path}`);
    console.log(`❌ [404 DEBUG] URL: ${req.url}`);
    console.log(`❌ [404 DEBUG] Headers:`, req.headers);
    res.status(404).json({
        status: 'error',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        debug: {
            method: req.method,
            originalUrl: req.originalUrl,
            baseUrl: req.baseUrl,
            path: req.path,
            url: req.url,
        },
    });
});
// Error handling middleware
app.use(errors_1.errorHandler);
// Start server
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Test database connection
            yield (0, database_1.testConnection)();
            // Test Redis connection
            yield (0, redis_1.testConnection)();
            // Start Express server
            app.listen(env_1.default.PORT, () => {
                console.log(`🚀 Server running on port ${env_1.default.PORT} in ${env_1.default.NODE_ENV} mode`);
                console.log(`📝 API Documentation available at ${env_1.default.API_PREFIX}/docs`);
            });
        }
        catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    });
}
// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
// Start the server
startServer();
