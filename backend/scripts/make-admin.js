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
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_1 = __importDefault(require("../src/config/env"));
const prisma = new client_1.PrismaClient();
function makeUserAdmin(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Проверяем, существует ли пользователь
            const existingUser = yield prisma.user.findUnique({
                where: { email },
                include: { profile: true },
            });
            if (existingUser) {
                // Если пользователь существует, обновляем его роль на ADMIN
                const updatedUser = yield prisma.user.update({
                    where: { email },
                    data: { role: client_1.Role.ADMIN },
                    include: { profile: true },
                });
                console.log(`✅ Пользователь ${email} успешно назначен администратором`);
                console.log('Обновленный пользователь:', {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    profile: updatedUser.profile,
                });
            }
            else {
                // Если пользователь не существует, создаем нового с ролью ADMIN
                const defaultPassword = yield bcrypt_1.default.hash('admin123', env_1.default.PASSWORD_SALT_ROUNDS);
                const newUser = yield prisma.user.create({
                    data: {
                        email,
                        password: defaultPassword,
                        role: client_1.Role.ADMIN,
                        profile: {
                            create: {
                                firstName: 'Admin',
                                lastName: 'User',
                                specialization: 'System Administration',
                                bio: 'System administrator',
                            },
                        },
                    },
                    include: { profile: true },
                });
                console.log(`✅ Создан новый пользователь-администратор ${email}`);
                console.log('⚠️  Временный пароль: admin123 (рекомендуется сменить)');
                console.log('Новый пользователь:', {
                    id: newUser.id,
                    email: newUser.email,
                    role: newUser.role,
                    profile: newUser.profile,
                });
            }
        }
        catch (error) {
            console.error('❌ Ошибка при назначении администратора:', error);
            throw error;
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const email = process.argv[2];
        if (!email) {
            console.error('❌ Укажите email пользователя');
            console.log('Использование: npm run make-admin <email>');
            process.exit(1);
        }
        yield makeUserAdmin(email);
    });
}
main()
    .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
