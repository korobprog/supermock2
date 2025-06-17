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
const prisma = new client_1.PrismaClient();
function checkAdminUser() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Проверка пользователей и их ролей...');
            const users = yield prisma.user.findMany({
                include: {
                    profile: true,
                },
            });
            console.log('Найденные пользователи:');
            users.forEach((user, index) => {
                console.log(`${index + 1}. Email: ${user.email}, Role: ${user.role}, ID: ${user.id}`);
                if (user.profile) {
                    console.log(`   Имя: ${user.profile.firstName} ${user.profile.lastName}`);
                }
            });
            // Проверяем, есть ли администратор
            const adminUsers = users.filter((user) => user.role === 'ADMIN');
            if (adminUsers.length === 0) {
                console.log('\nАдминистраторов не найдено. Создаем администратора из первого пользователя...');
                if (users.length > 0) {
                    const updatedUser = yield prisma.user.update({
                        where: { id: users[0].id },
                        data: { role: 'ADMIN' },
                    });
                    console.log(`Пользователь ${updatedUser.email} теперь администратор!`);
                }
                else {
                    console.log('Нет пользователей в системе для назначения администратором.');
                }
            }
            else {
                console.log(`\nНайдено администраторов: ${adminUsers.length}`);
                adminUsers.forEach((admin) => {
                    console.log(`- ${admin.email} (ID: ${admin.id})`);
                });
            }
        }
        catch (error) {
            console.error('Ошибка при проверке пользователей:', error);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
checkAdminUser();
