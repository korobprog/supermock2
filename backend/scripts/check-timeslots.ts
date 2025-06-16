import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTimeSlots() {
  try {
    console.log('🔍 Проверка временных слотов в базе данных...');

    // Общее количество слотов
    const totalCount = await prisma.timeSlot.count();
    console.log(`📊 Общее количество слотов: ${totalCount}`);

    // Количество по статусам
    const availableCount = await prisma.timeSlot.count({
      where: { status: 'AVAILABLE' },
    });
    const bookedCount = await prisma.timeSlot.count({
      where: { status: 'BOOKED' },
    });
    const cancelledCount = await prisma.timeSlot.count({
      where: { status: 'CANCELLED' },
    });

    console.log(`📊 Доступные слоты: ${availableCount}`);
    console.log(`📊 Забронированные слоты: ${bookedCount}`);
    console.log(`📊 Отмененные слоты: ${cancelledCount}`);

    // Показать несколько примеров слотов
    const sampleSlots = await prisma.timeSlot.findMany({
      take: 5,
      include: {
        interviewer: {
          include: {
            profile: true,
          },
        },
        booking: {
          include: {
            candidate: {
              include: {
                profile: true,
              },
            },
            interview: true,
          },
        },
      },
    });

    console.log('📋 Примеры слотов:');
    sampleSlots.forEach((slot, index) => {
      console.log(`${index + 1}. ID: ${slot.id}`);
      console.log(`   Статус: ${slot.status}`);
      console.log(`   Специализация: ${slot.specialization}`);
      console.log(`   Время: ${slot.startTime} - ${slot.endTime}`);
      console.log(
        `   Интервьюер: ${slot.interviewer.profile?.firstName} ${slot.interviewer.profile?.lastName}`
      );
      if (slot.booking) {
        console.log(`   Бронирование: ${slot.booking.status}`);
        console.log(
          `   Кандидат: ${slot.booking.candidate.profile?.firstName} ${slot.booking.candidate.profile?.lastName}`
        );
      }
      console.log('---');
    });

    // Проверим пользователей
    const usersCount = await prisma.user.count();
    const interviewersCount = await prisma.user.count({
      where: { role: 'INTERVIEWER' },
    });
    const candidatesCount = await prisma.user.count({
      where: { role: 'USER' },
    });

    console.log(`👥 Общее количество пользователей: ${usersCount}`);
    console.log(`👨‍💼 Интервьюеры: ${interviewersCount}`);
    console.log(`👨‍💻 Кандидаты: ${candidatesCount}`);
  } catch (error) {
    console.error('❌ Ошибка при проверке данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTimeSlots();
