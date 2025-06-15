import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import env from '../src/config/env';

const prisma = new PrismaClient();

async function makeUserAdmin(email: string) {
  try {
    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (existingUser) {
      // Если пользователь существует, обновляем его роль на ADMIN
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: Role.ADMIN },
        include: { profile: true },
      });

      console.log(`✅ Пользователь ${email} успешно назначен администратором`);
      console.log('Обновленный пользователь:', {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        profile: updatedUser.profile,
      });
    } else {
      // Если пользователь не существует, создаем нового с ролью ADMIN
      const defaultPassword = await bcrypt.hash(
        'admin123',
        env.PASSWORD_SALT_ROUNDS
      );

      const newUser = await prisma.user.create({
        data: {
          email,
          password: defaultPassword,
          role: Role.ADMIN,
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
  } catch (error) {
    console.error('❌ Ошибка при назначении администратора:', error);
    throw error;
  }
}

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Укажите email пользователя');
    console.log('Использование: npm run make-admin <email>');
    process.exit(1);
  }

  await makeUserAdmin(email);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
