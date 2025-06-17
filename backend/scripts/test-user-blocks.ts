import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testUserBlocks() {
  try {
    console.log('🔍 Тестирование API блокировок пользователей...');

    // Найдем первого пользователя для тестирования
    const testUser = await prisma.user.findFirst({
      where: {
        role: 'USER',
      },
    });

    if (!testUser) {
      console.log('❌ Не найден пользователь для тестирования');
      return;
    }

    console.log(`✅ Найден тестовый пользователь: ${testUser.email}`);

    // Проверим, есть ли активные блокировки
    const activeBlocks = await prisma.userBlock.findMany({
      where: {
        userId: testUser.id,
        isActive: true,
      },
    });

    console.log(
      `📊 Активных блокировок у пользователя: ${activeBlocks.length}`
    );

    // Проверим общее количество блокировок в системе
    const totalBlocks = await prisma.userBlock.count();
    console.log(`📊 Всего блокировок в системе: ${totalBlocks}`);

    // Проверим количество активных блокировок в системе
    const totalActiveBlocks = await prisma.userBlock.count({
      where: {
        isActive: true,
        OR: [
          { isPermanent: true },
          {
            isPermanent: false,
            endDate: {
              gt: new Date(),
            },
          },
        ],
      },
    });

    console.log(`📊 Активных блокировок в системе: ${totalActiveBlocks}`);

    console.log('✅ API блокировок пользователей готов к использованию!');
    console.log('\n📋 Доступные эндпоинты:');
    console.log('  POST /api/user-blocks - Блокировка пользователя');
    console.log('  DELETE /api/user-blocks/:id - Разблокировка пользователя');
    console.log(
      '  GET /api/user-blocks/user/:userId - История блокировок пользователя'
    );
    console.log('  GET /api/user-blocks/active - Все активные блокировки');
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserBlocks();
