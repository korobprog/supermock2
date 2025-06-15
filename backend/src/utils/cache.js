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
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
const redis_1 = require("../config/redis");
class CacheService {
    constructor() {
        this.defaultTTL = 3600; // 1 hour in seconds
        this.defaultPrefix = 'cache:';
    }
    /**
     * Set a value in cache
     */
    set(key_1, value_1) {
        return __awaiter(this, arguments, void 0, function* (key, value, options = {}) {
            const { ttl = this.defaultTTL, prefix = this.defaultPrefix } = options;
            const fullKey = `${prefix}${key}`;
            try {
                const serializedValue = JSON.stringify(value);
                yield redis_1.redis.set(fullKey, serializedValue, { EX: ttl });
            }
            catch (error) {
                console.error('Cache set error:', error);
                // Don't throw - caching errors shouldn't break the application
            }
        });
    }
    /**
     * Get a value from cache
     */
    get(key_1) {
        return __awaiter(this, arguments, void 0, function* (key, options = {}) {
            const { prefix = this.defaultPrefix } = options;
            const fullKey = `${prefix}${key}`;
            try {
                const value = yield redis_1.redis.get(fullKey);
                if (!value)
                    return null;
                return JSON.parse(value);
            }
            catch (error) {
                console.error('Cache get error:', error);
                return null;
            }
        });
    }
    /**
     * Delete a value from cache
     */
    del(key_1) {
        return __awaiter(this, arguments, void 0, function* (key, options = {}) {
            const { prefix = this.defaultPrefix } = options;
            const fullKey = `${prefix}${key}`;
            try {
                yield redis_1.redis.del(fullKey);
            }
            catch (error) {
                console.error('Cache delete error:', error);
            }
        });
    }
    /**
     * Clear all cache entries with a specific prefix
     */
    clearByPrefix() {
        return __awaiter(this, arguments, void 0, function* (prefix = this.defaultPrefix) {
            try {
                const keys = yield redis_1.redis.keys(`${prefix}*`);
                if (keys.length > 0) {
                    yield redis_1.redis.del(keys);
                }
            }
            catch (error) {
                console.error('Cache clear error:', error);
            }
        });
    }
    /**
     * Get or set cache value
     * If value is not in cache, it will be fetched using the provided function
     */
    getOrSet(key_1, fetchFn_1) {
        return __awaiter(this, arguments, void 0, function* (key, fetchFn, options = {}) {
            const cachedValue = yield this.get(key, options);
            if (cachedValue !== null) {
                return cachedValue;
            }
            const value = yield fetchFn();
            yield this.set(key, value, options);
            return value;
        });
    }
}
exports.cacheService = new CacheService();
