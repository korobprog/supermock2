"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Environment variable schema
const envSchema = zod_1.z.object({
    // Server
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().transform(Number).default('3000'),
    // Database
    DATABASE_URL: zod_1.z.string(),
    // Redis
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379'),
    // JWT
    JWT_SECRET: zod_1.z.string(),
    JWT_EXPIRES_IN: zod_1.z.string().default('1d'),
    JWT_REFRESH_SECRET: zod_1.z.string(),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    // CORS
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:5174'),
    // Security
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().transform(Number).default('900000'),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().transform(Number).default('100'),
    PASSWORD_SALT_ROUNDS: zod_1.z.string().transform(Number).default('10'),
    // Logging
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('debug'),
    LOG_FORMAT: zod_1.z.enum(['dev', 'combined']).default('dev'),
    // API
    API_PREFIX: zod_1.z.string().default('/api/v1'),
    API_TIMEOUT: zod_1.z.string().transform(Number).default('30000'),
    // Email (optional for future use)
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().transform(Number).optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    EMAIL_FROM: zod_1.z.string().optional(),
});
// Parse and validate environment variables
const env = envSchema.parse(process.env);
exports.default = env;
