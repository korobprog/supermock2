import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestTimeSlots() {
  try {
    console.log('🔧 Добавление тестовых временных слотов...');

    // Найдем интервьюера
    const interviewer = await prisma.user.findFirst({
      where: { role: 'INTERVIEWER' },
    });

    if (!interviewer) {
      console.error('❌ Интервьюер не найден');
      return;
    }

    console.log(`👨‍💼 Найден интервьюер: ${interviewer.id}`);

    // Создаем слоты на завтра и послезавтра
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // 10:00

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    dayAfterTomorrow.setHours(14, 0, 0, 0); // 14:00

    const testSlots = [
      {
        interviewerId: interviewer.id,
        startTime: new Date(tomorrow),
        endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000), // +1 час
        specialization: 'Frontend разработка',
        status: 'AVAILABLE' as const,
      },
      {
        interviewerId: interviewer.id,
        startTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // +2 часа от первого
        endTime: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000), // +3 часа от первого
        specialization: 'Backend разработка',
        status: 'AVAILABLE' as const,
      },
      {
        interviewerId: interviewer.id,
        startTime: new Date(dayAfterTomorrow),
        endTime: new Date(dayAfterTomorrow.getTime() + 60 * 60 * 1000), // +1 час
        specialization: 'Fullstack разработка',
        status: 'AVAILABLE' as const,
      },
      {
        interviewerId: interviewer.id,
        startTime: new Date(dayAfterTomorrow.getTime() + 2 * 60 * 60 * 1000), // +2 часа
        endTime: new Date(dayAfterTomorrow.getTime() + 3 * 60 * 60 * 1000), // +3 часа
        specialization: 'Frontend разработка',
        status: 'AVAILABLE' as const,
      },
    ];

    console.log('📅 Создаем следующие слоты:');
    testSlots.forEach((slot, index) => {
      console.log(`${index + 1}. ${slot.specialization}`);
      console.log(`   Время: ${slot.startTime} - ${slot.endTime}`);
    });

    // Создаем слоты
    for (const slotData of testSlots) {
      const slot = await prisma.timeSlot.create({
        data: slotData,
        include: {
          interviewer: {
            include: {
              profile: true,
            },
          },
        },
      });
      console.log(`✅ Создан слот: ${slot.id} (${slot.specialization})`);
    }

    console.log('🎉 Тестовые слоты успешно добавлены!');

    // Проверим общее количество слотов
    const totalCount = await prisma.timeSlot.count();
    const availableCount = await prisma.timeSlot.count({
      where: { status: 'AVAILABLE' },
    });

    console.log(`📊 Общее количество слотов: ${totalCount}`);
    console.log(`📊 Доступные слоты: ${availableCount}`);
  } catch (error) {
    console.error('❌ Ошибка при добавлении тестовых слотов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestTimeSlots();
