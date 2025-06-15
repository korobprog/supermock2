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
const client_1 = require("@prisma/client");
const redis_1 = require("../config/redis");
const prisma = new client_1.PrismaClient();
// Global setup
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Connect to test database
    yield prisma.$connect();
    // Connect to Redis
    yield redis_1.redis.connect();
    // Clear test data
    yield prisma.pointsTransaction.deleteMany();
    yield prisma.interview.deleteMany();
    yield prisma.profile.deleteMany();
    yield prisma.user.deleteMany();
}));
// Global teardown
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Disconnect from database
    yield prisma.$disconnect();
    // Disconnect from Redis
    yield redis_1.redis.disconnect();
}));
// Reset database between tests
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.pointsTransaction.deleteMany();
    yield prisma.interview.deleteMany();
    yield prisma.profile.deleteMany();
    yield prisma.user.deleteMany();
}));
