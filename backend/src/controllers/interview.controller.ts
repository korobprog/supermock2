import { Request, Response } from 'express';
import { prisma } from '../config/database';

// Константы для системы баллов
const INTERVIEWER_REWARD = 1; // Баллы за проведение собеседования

export const getInterviews = async (req: Request, res: Response) => {
  try {
    const { showAll, status, specialization } = req.query;

    // Получаем профиль пользователя с интересом
    const userProfile = await prisma.profile.findUnique({
      where: { userId: req.user!.id },
      include: {
        interest: true,
      },
    });

    // Базовые условия фильтрации
    const whereConditions: any = {};

    // Проверяем права доступа - пользователь может видеть интервью где он интервьюер или участник
    whereConditions.OR = [
      { interviewerId: req.user!.id },
      { participantId: req.user!.id },
    ];

    // Фильтрация по статусу
    if (status) {
      whereConditions.status = status;
    }

    // Фильтрация по специализации
    if (specialization) {
      whereConditions.specialization = { contains: specialization as string };
    }

    // Фильтруем по интересу пользователя, если интерес указан и showAll не установлен
    if (userProfile?.interest && showAll !== 'true' && !specialization) {
      whereConditions.specialization = {
        contains: userProfile.interest.category,
      };
    }

    const interviews = await prisma.interview.findMany({
      where: whereConditions,
      include: {
        interviewer: {
          include: {
            profile: true,
          },
        },
        participant: {
          include: {
            profile: true,
          },
        },
        feedback: true,
        scores: true,
        result: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      interviews,
      userInterest: userProfile?.interest?.category || null,
      isFiltered:
        userProfile?.interest && showAll !== 'true' && !specialization,
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};

export const getInterviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const interview = await prisma.interview.findFirst({
      where: {
        id,
        OR: [{ interviewerId: req.user!.id }, { participantId: req.user!.id }],
      },
      include: {
        interviewer: {
          include: {
            profile: true,
          },
        },
        participant: {
          include: {
            profile: true,
          },
        },
        feedback: true,
        scores: true,
        questions: {
          include: {
            answer: true,
          },
          orderBy: { order: 'asc' },
        },
        result: true,
      },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json(interview);
  } catch (error) {
    console.error('Error fetching interview:', error);
    res.status(500).json({ error: 'Failed to fetch interview' });
  }
};

export const getInterviewScores = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const interview = await prisma.interview.findFirst({
      where: {
        id,
        OR: [{ interviewerId: req.user!.id }, { participantId: req.user!.id }],
      },
      include: {
        scores: true,
        feedback: true,
        result: true,
      },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Вычисляем общий балл из всех оценок
    const totalScore =
      interview.result?.totalScore ||
      (interview.scores.length > 0
        ? Math.round(
            interview.scores.reduce((sum, score) => sum + score.score, 0) /
              interview.scores.length
          )
        : 0);

    const scores = {
      interviewId: interview.id,
      totalScore,
      categories: interview.scores.map((score) => ({
        name: score.criteriaName,
        score: score.score,
        comment: score.comment,
      })),
      feedback: interview.feedback,
      result: interview.result,
    };

    res.json(scores);
  } catch (error) {
    console.error('Error fetching interview scores:', error);
    res.status(500).json({ error: 'Failed to fetch interview scores' });
  }
};

export const getInterviewFeedback = async (req: Request, res: Response) => {
  try {
    const feedback = await prisma.interviewFeedback.findMany({
      where: {
        interview: {
          OR: [
            { interviewerId: req.user!.id },
            { participantId: req.user!.id },
          ],
        },
      },
      include: {
        interview: {
          include: {
            interviewer: {
              include: {
                profile: true,
              },
            },
            participant: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

export const createInterview = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      specialization,
      scheduledAt,
      duration,
      videoLink,
    } = req.body;

    console.log('Получены данные для создания интервью:', req.body);

    const newInterview = await prisma.interview.create({
      data: {
        title,
        description: description || '',
        specialization: specialization || 'PROGRAMMING',
        interviewerId: req.user!.id,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        duration: duration || 60,
        videoLink: videoLink || null,
      },
      include: {
        interviewer: {
          include: {
            profile: true,
          },
        },
        participant: {
          include: {
            profile: true,
          },
        },
      },
    });

    console.log('Создано новое интервью:', newInterview);

    res.status(201).json(newInterview);
  } catch (error) {
    console.error('Error creating interview:', error);
    res.status(500).json({ error: 'Failed to create interview' });
  }
};

export const updateInterview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      specialization,
      scheduledAt,
      duration,
      status,
      participantId,
      videoLink,
    } = req.body;

    console.log('Обновление интервью:', id, req.body);

    // Проверяем, что пользователь имеет право обновлять это интервью
    const existingInterview = await prisma.interview.findFirst({
      where: {
        id,
        interviewerId: req.user!.id, // Только интервьюер может обновлять интервью
      },
    });

    if (!existingInterview) {
      return res
        .status(404)
        .json({ error: 'Interview not found or access denied' });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (specialization !== undefined)
      updateData.specialization = specialization;
    if (scheduledAt !== undefined)
      updateData.scheduledAt = new Date(scheduledAt);
    if (duration !== undefined) updateData.duration = duration;
    if (status !== undefined) updateData.status = status;
    if (participantId !== undefined) updateData.participantId = participantId;
    if (videoLink !== undefined) updateData.videoLink = videoLink;

    const updatedInterview = await prisma.interview.update({
      where: { id },
      data: updateData,
      include: {
        interviewer: {
          include: {
            profile: true,
          },
        },
        participant: {
          include: {
            profile: true,
          },
        },
      },
    });

    console.log('Интервью обновлено:', updatedInterview);

    res.json(updatedInterview);
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({ error: 'Failed to update interview' });
  }
};

export const deleteInterview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log('Удаление интервью:', id);

    // Проверяем, что пользователь имеет право удалять это интервью
    const existingInterview = await prisma.interview.findFirst({
      where: {
        id,
        interviewerId: req.user!.id, // Только интервьюер может удалять интервью
      },
    });

    if (!existingInterview) {
      return res
        .status(404)
        .json({ error: 'Interview not found or access denied' });
    }

    await prisma.interview.delete({
      where: { id },
    });

    console.log('Интервью удалено:', id);

    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Error deleting interview:', error);
    res.status(500).json({ error: 'Failed to delete interview' });
  }
};

// Новые функции для работы с вопросами интервью
export const getInterviewQuestions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const interview = await prisma.interview.findFirst({
      where: {
        id,
        OR: [{ interviewerId: req.user!.id }, { participantId: req.user!.id }],
      },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const questions = await prisma.interviewQuestion.findMany({
      where: { interviewId: id },
      include: {
        answer: true,
      },
      orderBy: { order: 'asc' },
    });

    res.json(questions);
  } catch (error) {
    console.error('Error fetching interview questions:', error);
    res.status(500).json({ error: 'Failed to fetch interview questions' });
  }
};

export const createInterviewQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, order } = req.body;

    // Проверяем, что пользователь является интервьюером
    const interview = await prisma.interview.findFirst({
      where: {
        id,
        interviewerId: req.user!.id,
      },
    });

    if (!interview) {
      return res
        .status(404)
        .json({ error: 'Interview not found or access denied' });
    }

    const question = await prisma.interviewQuestion.create({
      data: {
        interviewId: id,
        content,
        order: order || 1,
      },
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating interview question:', error);
    res.status(500).json({ error: 'Failed to create interview question' });
  }
};

export const createInterviewAnswer = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const { content, score, comment } = req.body;

    // Проверяем, что вопрос существует и пользователь имеет доступ к интервью
    const question = await prisma.interviewQuestion.findFirst({
      where: {
        id: questionId,
        interview: {
          OR: [
            { interviewerId: req.user!.id },
            { participantId: req.user!.id },
          ],
        },
      },
      include: {
        interview: true,
      },
    });

    if (!question) {
      return res
        .status(404)
        .json({ error: 'Question not found or access denied' });
    }

    const answer = await prisma.interviewAnswer.create({
      data: {
        questionId,
        content,
        score,
        comment,
      },
    });

    res.status(201).json(answer);
  } catch (error) {
    console.error('Error creating interview answer:', error);
    res.status(500).json({ error: 'Failed to create interview answer' });
  }
};

export const createInterviewResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { totalScore, decision, summary } = req.body;

    // Проверяем, что пользователь является интервьюером
    const interview = await prisma.interview.findFirst({
      where: {
        id,
        interviewerId: req.user!.id,
      },
    });

    if (!interview) {
      return res
        .status(404)
        .json({ error: 'Interview not found or access denied' });
    }

    const result = await prisma.interviewResult.upsert({
      where: { interviewId: id },
      update: {
        totalScore,
        decision,
        summary,
      },
      create: {
        interviewId: id,
        totalScore,
        decision,
        summary,
      },
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating interview result:', error);
    res.status(500).json({ error: 'Failed to create interview result' });
  }
};

export const getInterviewResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const interview = await prisma.interview.findFirst({
      where: {
        id,
        OR: [{ interviewerId: req.user!.id }, { participantId: req.user!.id }],
      },
      include: {
        result: true,
      },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json(interview.result);
  } catch (error) {
    console.error('Error fetching interview result:', error);
    res.status(500).json({ error: 'Failed to fetch interview result' });
  }
};

export const createInterviewScore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { criteriaName, score, comment } = req.body;

    // Проверяем, что пользователь является интервьюером
    const interview = await prisma.interview.findFirst({
      where: {
        id,
        interviewerId: req.user!.id,
      },
    });

    if (!interview) {
      return res
        .status(404)
        .json({ error: 'Interview not found or access denied' });
    }

    const interviewScore = await prisma.interviewScore.create({
      data: {
        interviewId: id,
        criteriaName,
        score,
        comment,
      },
    });

    res.status(201).json(interviewScore);
  } catch (error) {
    console.error('Error creating interview score:', error);
    res.status(500).json({ error: 'Failed to create interview score' });
  }
};

export const getInterviewTemplates = async (req: Request, res: Response) => {
  try {
    const { specialization } = req.query;

    const whereConditions: any = {};
    if (specialization) {
      whereConditions.specialization = { contains: specialization as string };
    }

    const templates = await prisma.interviewTemplate.findMany({
      where: whereConditions,
      include: {
        criteria: {
          include: {
            evaluationCriteria: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(templates);
  } catch (error) {
    console.error('Error fetching interview templates:', error);
    res.status(500).json({ error: 'Failed to fetch interview templates' });
  }
};

export const createInterviewFromTemplate = async (
  req: Request,
  res: Response
) => {
  try {
    const { templateId } = req.params;
    const { title, scheduledAt, duration, participantId } = req.body;

    // Получаем шаблон с критериями оценки
    const template = await prisma.interviewTemplate.findUnique({
      where: { id: templateId },
      include: {
        criteria: {
          include: {
            evaluationCriteria: true,
          },
        },
      },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Создаем интервью на основе шаблона
    const interview = await prisma.interview.create({
      data: {
        title: title || template.name,
        description: template.description,
        specialization: template.specialization,
        interviewerId: req.user!.id,
        participantId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        duration: duration || 60,
        videoLink: 'https://meet.google.com/new', // Временная ссылка, должна быть заменена
      },
      include: {
        interviewer: {
          include: {
            profile: true,
          },
        },
        participant: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Создаем заготовки оценок на основе критериев шаблона
    const scorePromises = template.criteria.map((criteria) =>
      prisma.interviewScore.create({
        data: {
          interviewId: interview.id,
          criteriaName: criteria.evaluationCriteria.name,
          score: 0,
          comment: criteria.evaluationCriteria.description,
        },
      })
    );

    await Promise.all(scorePromises);

    res.status(201).json(interview);
  } catch (error) {
    console.error('Error creating interview from template:', error);
    res.status(500).json({ error: 'Failed to create interview from template' });
  }
};

// Функция завершения собеседования с начислением баллов интервьюеру
export const completeInterview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Проверяем, что пользователь является интервьюером
    const interview = await prisma.interview.findFirst({
      where: {
        id,
        interviewerId: req.user!.id,
      },
      include: {
        booking: true,
      },
    });

    if (!interview) {
      return res
        .status(404)
        .json({ error: 'Собеседование не найдено или доступ запрещен' });
    }

    if (interview.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Собеседование уже завершено' });
    }

    if (interview.status === 'CANCELLED') {
      return res
        .status(400)
        .json({ error: 'Нельзя завершить отмененное собеседование' });
    }

    // Завершаем собеседование в транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Обновляем статус собеседования
      const updatedInterview = await tx.interview.update({
        where: { id },
        data: { status: 'COMPLETED' },
        include: {
          interviewer: {
            include: {
              profile: true,
            },
          },
          participant: {
            include: {
              profile: true,
            },
          },
          feedback: true,
          scores: true,
          result: true,
        },
      });

      // Начисляем баллы интервьюеру
      await tx.pointsTransaction.create({
        data: {
          userId: req.user!.id,
          amount: INTERVIEWER_REWARD,
          type: 'EARNED',
          description: `Проведение собеседования: ${interview.title}`,
        },
      });

      // Обновляем статус связанного бронирования, если оно есть
      if (interview.booking) {
        await tx.booking.update({
          where: { id: interview.booking.id },
          data: { status: 'COMPLETED' },
        });
      }

      return updatedInterview;
    });

    res.json({
      ...result,
      message: `Собеседование завершено. Начислено баллов: ${INTERVIEWER_REWARD}`,
    });
  } catch (error) {
    console.error('Error completing interview:', error);
    res.status(500).json({ error: 'Failed to complete interview' });
  }
};

// Функция получения баланса баллов пользователя
export const getUserPointsBalance = async (req: Request, res: Response) => {
  try {
    const pointsTransactions = await prisma.pointsTransaction.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    const currentBalance = pointsTransactions.reduce((sum, transaction) => {
      return transaction.type === 'EARNED'
        ? sum + transaction.amount
        : sum - transaction.amount;
    }, 0);

    res.json({
      balance: currentBalance,
      transactions: pointsTransactions,
    });
  } catch (error) {
    console.error('Error fetching user points balance:', error);
    res.status(500).json({ error: 'Failed to fetch points balance' });
  }
};

// Функция для получения всех оценок пользователя для аналитики
export const getAllInterviewScores = async (req: Request, res: Response) => {
  try {
    // Проверяем роль пользователя
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    let whereCondition: any = {
      status: 'COMPLETED',
    };

    // Если пользователь не администратор, фильтруем по его участию
    if (user?.role !== 'ADMIN') {
      whereCondition.OR = [
        { interviewerId: req.user!.id },
        { participantId: req.user!.id },
      ];
    }

    const interviews = await prisma.interview.findMany({
      where: whereCondition,
      include: {
        scores: true,
        result: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const scores = interviews.map((interview) => {
      const totalScore =
        interview.result?.totalScore ||
        (interview.scores.length > 0
          ? Math.round(
              interview.scores.reduce((sum, score) => sum + score.score, 0) /
                interview.scores.length
            )
          : 0);

      return {
        id: interview.id,
        interviewId: interview.id,
        score: totalScore,
        date: interview.createdAt.toISOString().split('T')[0], // Форматируем дату для графика
      };
    });

    res.json(scores);
  } catch (error) {
    console.error('Error fetching all interview scores:', error);
    res.status(500).json({ error: 'Failed to fetch interview scores' });
  }
};

// Функция для получения всех отзывов пользователя для аналитики
export const getAllInterviewFeedback = async (req: Request, res: Response) => {
  try {
    // Проверяем роль пользователя
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    let whereCondition: any = {};

    // Если пользователь не администратор, фильтруем по его участию
    if (user?.role !== 'ADMIN') {
      whereCondition.interview = {
        OR: [{ interviewerId: req.user!.id }, { participantId: req.user!.id }],
      };
    }

    const feedback = await prisma.interviewFeedback.findMany({
      where: whereCondition,
      include: {
        interview: {
          include: {
            interviewer: {
              include: {
                profile: true,
              },
            },
            participant: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedFeedback = feedback.map((item) => ({
      id: item.id,
      interviewId: item.interviewId,
      content: item.content,
      date: item.createdAt.toISOString().split('T')[0],
    }));

    res.json(formattedFeedback);
  } catch (error) {
    console.error('Error fetching all feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

// Функции для работы с отзывами
export const createInterviewFeedback = async (req: Request, res: Response) => {
  try {
    const { interviewId, content, rating } = req.body;

    // Проверяем, что интервью существует и пользователь имеет к нему доступ
    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        OR: [{ interviewerId: req.user!.id }, { participantId: req.user!.id }],
      },
    });

    if (!interview) {
      return res
        .status(404)
        .json({ error: 'Interview not found or access denied' });
    }

    // Проверяем, что отзыв еще не существует
    const existingFeedback = await prisma.interviewFeedback.findUnique({
      where: { interviewId },
    });

    if (existingFeedback) {
      return res
        .status(400)
        .json({ error: 'Feedback already exists for this interview' });
    }

    const feedback = await prisma.interviewFeedback.create({
      data: {
        interviewId,
        content,
        rating,
      },
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ error: 'Failed to create feedback' });
  }
};

export const deleteInterviewFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Проверяем, что отзыв существует и пользователь имеет к нему доступ
    const feedback = await prisma.interviewFeedback.findFirst({
      where: {
        id,
        interview: {
          OR: [
            { interviewerId: req.user!.id },
            { participantId: req.user!.id },
          ],
        },
      },
    });

    if (!feedback) {
      return res
        .status(404)
        .json({ error: 'Feedback not found or access denied' });
    }

    await prisma.interviewFeedback.delete({
      where: { id },
    });

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
};
