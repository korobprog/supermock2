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
exports.redis = void 0;
exports.testConnection = testConnection;
const redis_1 = require("redis");
const env_1 = __importDefault(require("./env"));
// Create Redis client
const redis = (0, redis_1.createClient)({
    url: env_1.default.REDIS_URL,
});
exports.redis = redis;
// Handle Redis events
redis.on('error', (err) => console.error('❌ Redis Client Error:', err));
redis.on('connect', () => console.log('✅ Redis Client Connected'));
redis.on('ready', () => console.log('✅ Redis Client Ready'));
redis.on('end', () => console.log('Redis Client Connection Ended'));
// Test Redis connection
function testConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redis.connect();
            yield redis.ping();
            console.log('✅ Redis connection successful');
        }
        catch (error) {
            console.error('❌ Redis connection failed:', error);
            process.exit(1);
        }
    });
}
