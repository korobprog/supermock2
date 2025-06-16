import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    console.log('Проверка пользователей и их ролей...');

    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
    });

    console.log('Найденные пользователи:');
    users.forEach((user, index) => {
      console.log(
        `${index + 1}. Email: ${user.email}, Role: ${user.role}, ID: ${user.id}`
      );
      if (user.profile) {
        console.log(
          `   Имя: ${user.profile.firstName} ${user.profile.lastName}`
        );
      }
    });

    // Проверяем, есть ли администратор
    const adminUsers = users.filter((user) => user.role === 'ADMIN');

    if (adminUsers.length === 0) {
      console.log(
        '\nАдминистраторов не найдено. Создаем администратора из первого пользователя...'
      );

      if (users.length > 0) {
        const updatedUser = await prisma.user.update({
          where: { id: users[0].id },
          data: { role: 'ADMIN' },
        });

        console.log(`Пользователь ${updatedUser.email} теперь администратор!`);
      } else {
        console.log(
          'Нет пользователей в системе для назначения администратором.'
        );
      }
    } else {
      console.log(`\nНайдено администраторов: ${adminUsers.length}`);
      adminUsers.forEach((admin) => {
        console.log(`- ${admin.email} (ID: ${admin.id})`);
      });
    }
  } catch (error) {
    console.error('Ошибка при проверке пользователей:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
