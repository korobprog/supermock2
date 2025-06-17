import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestPoints() {
  try {
    // ID пользователя из логов
    const userId = '757780a7-95ef-4bdf-a687-680f5dc0163d';

    console.log('🔍 Добавляем тестовые баллы для пользователя:', userId);

    // Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      console.error('❌ Пользователь не найден:', userId);
      return;
    }

    console.log('✅ Пользователь найден:', user.email);

    // Добавляем несколько тестовых транзакций
    const transactions = [
      {
        userId,
        amount: 100,
        type: 'EARNED' as const,
        description: 'Регистрационный бонус',
      },
      {
        userId,
        amount: 50,
        type: 'EARNED' as const,
        description: 'Заполнение профиля',
      },
      {
        userId,
        amount: 25,
        type: 'SPENT' as const,
        description: 'Бронирование интервью',
      },
    ];

    for (const transaction of transactions) {
      const created = await prisma.pointsTransaction.create({
        data: transaction,
      });
      console.log(
        `✅ Создана транзакция: ${transaction.type} ${transaction.amount} - ${transaction.description}`
      );
    }

    // Проверяем итоговый баланс
    const allTransactions = await prisma.pointsTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const balance = allTransactions.reduce((sum, t) => {
      return t.type === 'EARNED' ? sum + t.amount : sum - t.amount;
    }, 0);

    console.log('🎯 Итоговый баланс:', balance, 'баллов');
    console.log('📊 Всего транзакций:', allTransactions.length);
  } catch (error) {
    console.error('❌ Ошибка при добавлении тестовых баллов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestPoints();
