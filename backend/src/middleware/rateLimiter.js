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
exports.rateLimiter = void 0;
const redis_1 = require("../config/redis");
const env_1 = __importDefault(require("../config/env"));
const rateLimiter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const windowMs = env_1.default.RATE_LIMIT_WINDOW_MS;
    const maxRequests = env_1.default.RATE_LIMIT_MAX_REQUESTS;
    // Get client IP
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `ratelimit:${ip}`;
    try {
        // Get current request count
        const current = yield redis_1.redis.get(key);
        const count = current ? parseInt(current) : 0;
        if (count >= maxRequests) {
            return res.status(429).json({
                error: 'Too many requests',
                message: `Please try again after ${windowMs / 1000} seconds`,
                retryAfter: windowMs / 1000,
            });
        }
        // Increment request count
        yield redis_1.redis.incr(key);
        // Set expiry if this is the first request
        if (count === 0) {
            yield redis_1.redis.expire(key, windowMs / 1000);
        }
        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count - 1));
        res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000 + windowMs / 1000));
        next();
    }
    catch (error) {
        console.error('Rate limiter error:', error);
        // If Redis fails, allow the request to proceed
        next();
    }
});
exports.rateLimiter = rateLimiter;
