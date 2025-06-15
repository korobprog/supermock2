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
const env_1 = __importDefault(require("./config/env"));
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const interview_routes_1 = __importDefault(require("./routes/interview.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const errors_1 = require("./utils/errors");
const rateLimiter_1 = require("./middleware/rateLimiter");
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
// Apply rate limiter to all routes
app.use(rateLimiter_1.rateLimiter);
// API Routes with prefix
app.use(`${env_1.default.API_PREFIX}/users`, user_routes_1.default);
app.use(`${env_1.default.API_PREFIX}/interviews`, interview_routes_1.default);
app.use(`${env_1.default.API_PREFIX}/notifications`, notification_routes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env_1.default.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
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
