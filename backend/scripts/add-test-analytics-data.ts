import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestAnalyticsData() {
  try {
    console.log('Добавление тестовых данных для аналитики...');

    // Получаем существующих пользователей
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
    });

    if (users.length < 2) {
      console.log('Недостаточно пользователей для создания тестовых данных');
      return;
    }

    const interviewer = users[0];
    const participant = users[1];

    // Создаем несколько завершенных интервью с разными датами
    const interviews = [];
    const dates = [
      new Date('2024-12-01'),
      new Date('2024-12-15'),
      new Date('2025-01-01'),
      new Date('2025-01-15'),
      new Date('2025-02-01'),
    ];

    for (let i = 0; i < dates.length; i++) {
      const interview = await prisma.interview.create({
        data: {
          title: `Тестовое интервью ${i + 1}`,
          description: `Описание тестового интервью ${i + 1}`,
          specialization: 'PROGRAMMING',
          interviewerId: interviewer.id,
          participantId: participant.id,
          status: 'COMPLETED',
          scheduledAt: dates[i],
          duration: 60,
          videoLink: 'https://meet.google.com/test',
          createdAt: dates[i],
        },
      });

      interviews.push(interview);

      // Добавляем оценки для каждого интервью
      const scores = [
        { criteriaName: 'Технические навыки', score: 70 + i * 5 },
        { criteriaName: 'Коммуникация', score: 75 + i * 3 },
        { criteriaName: 'Решение задач', score: 80 + i * 2 },
      ];

      for (const scoreData of scores) {
        await prisma.interviewScore.create({
          data: {
            interviewId: interview.id,
            criteriaName: scoreData.criteriaName,
            score: scoreData.score,
            comment: `Комментарий для ${scoreData.criteriaName}`,
          },
        });
      }

      // Добавляем результат интервью
      const totalScore = Math.round(
        scores.reduce((sum, s) => sum + s.score, 0) / scores.length
      );

      await prisma.interviewResult.create({
        data: {
          interviewId: interview.id,
          totalScore,
          decision: totalScore >= 80 ? 'HIRE' : 'CONSIDER',
          summary: `Общий результат интервью: ${totalScore} баллов`,
        },
      });

      // Добавляем отзыв
      await prisma.interviewFeedback.create({
        data: {
          interviewId: interview.id,
          content: `Отзыв о тестовом интервью ${
            i + 1
          }. Кандидат показал хорошие результаты.`,
          rating: Math.min(5, Math.floor(totalScore / 20) + 1),
        },
      });

      console.log(`Создано интервью ${i + 1} с общим баллом ${totalScore}`);
    }

    console.log('Тестовые данные для аналитики успешно добавлены!');
  } catch (error) {
    console.error('Ошибка при добавлении тестовых данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestAnalyticsData();
