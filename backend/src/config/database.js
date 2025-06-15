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
exports.prisma = void 0;
exports.testConnection = testConnection;
const client_1 = require("@prisma/client");
const env_1 = __importDefault(require("./env"));
// Create Prisma client instance
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: env_1.default.DATABASE_URL,
        },
    },
    log: env_1.default.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
exports.prisma = prisma;
// Test database connection
function testConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield prisma.$connect();
            console.log('✅ Database connection successful');
        }
        catch (error) {
            console.error('❌ Database connection failed:', error);
            process.exit(1);
        }
    });
}
