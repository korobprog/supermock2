import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';

// Mock data for development
const mockInterviews = [
  {
    id: 1,
    title: 'Frontend Developer Interview',
    date: '2025-06-14T10:00:00Z',
    status: 'completed',
    score: 85,
    interestCategory: 'PROGRAMMING',
  },
  {
    id: 2,
    title: 'React Specialist Interview',
    date: '2025-06-13T14:30:00Z',
    status: 'completed',
    score: 92,
    interestCategory: 'PROGRAMMING',
  },
  {
    id: 3,
    title: 'JavaScript Assessment',
    date: '2025-06-12T09:15:00Z',
    status: 'completed',
    score: 78,
    interestCategory: 'PROGRAMMING',
  },
  {
    id: 4,
    title: 'QA Testing Interview',
    date: '2025-06-11T11:00:00Z',
    status: 'completed',
    score: 88,
    interestCategory: 'TESTING',
  },
  {
    id: 5,
    title: 'Data Analysis Interview',
    date: '2025-06-10T15:00:00Z',
    status: 'completed',
    score: 91,
    interestCategory: 'ANALYTICS_DATA_SCIENCE',
  },
];

const mockFeedback = [
  {
    id: 1,
    interviewId: 1,
    content: 'Отличное понимание React hooks и state management',
    date: '2025-06-14T11:00:00Z',
    rating: 5,
  },
  {
    id: 2,
    interviewId: 2,
    content: 'Хорошие знания TypeScript, но нужно улучшить алгоритмы',
    date: '2025-06-13T15:30:00Z',
    rating: 4,
  },
  {
    id: 3,
    interviewId: 3,
    content: 'Базовые знания JavaScript в порядке, рекомендуется изучить ES6+',
    date: '2025-06-12T10:15:00Z',
    rating: 3,
  },
];

export const getInterviews = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { showAll } = req.query;

    // Получаем профиль пользователя с интересом
    const userProfile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      include: {
        interest: true,
      },
    });

    let filteredInterviews = mockInterviews;

    // Фильтруем интервью по интересу пользователя, если интерес указан и showAll не установлен
    if (userProfile?.interest && showAll !== 'true') {
      filteredInterviews = mockInterviews.filter(
        (interview) =>
          interview.interestCategory === userProfile.interest!.category
      );
    }

    // В реальном приложении здесь будет запрос к базе данных
    // const interviews = await prisma.interview.findMany({
    //   where: {
    //     userId: req.user.id,
    //     ...(userProfile?.interest && showAll !== 'true' && {
    //       specialization: { contains: userProfile.interest.category }
    //     })
    //   },
    //   orderBy: { createdAt: 'desc' }
    // });

    res.json({
      interviews: filteredInterviews,
      userInterest: userProfile?.interest?.category || null,
      isFiltered: userProfile?.interest && showAll !== 'true',
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};

export const getInterviewById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    // Находим интервью по ID
    const interview = mockInterviews.find(
      (interview) => interview.id === parseInt(id)
    );

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // В реальном приложении здесь будет запрос к базе данных
    // const interview = await prisma.interview.findUnique({
    //   where: {
    //     id: parseInt(id),
    //     userId: req.user.id
    //   }
    // });

    res.json(interview);
  } catch (error) {
    console.error('Error fetching interview:', error);
    res.status(500).json({ error: 'Failed to fetch interview' });
  }
};

export const getInterviewScores = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    // Находим интервью по ID
    const interview = mockInterviews.find(
      (interview) => interview.id === parseInt(id)
    );

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Возвращаем детальные оценки для интервью
    const scores = {
      interviewId: interview.id,
      totalScore: interview.score,
      categories: [
        {
          name: 'Технические навыки',
          score: Math.floor(interview.score * 0.4),
        },
        { name: 'Коммуникация', score: Math.floor(interview.score * 0.3) },
        { name: 'Решение задач', score: Math.floor(interview.score * 0.3) },
      ],
      feedback: mockFeedback.filter((f) => f.interviewId === interview.id),
    };

    // В реальном приложении здесь будет запрос к базе данных
    // const scores = await prisma.interviewScore.findMany({
    //   where: {
    //     interviewId: parseInt(id),
    //     interview: { userId: req.user.id }
    //   }
    // });

    res.json(scores);
  } catch (error) {
    console.error('Error fetching interview scores:', error);
    res.status(500).json({ error: 'Failed to fetch interview scores' });
  }
};

export const getInterviewFeedback = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // В реальном приложении здесь будет запрос к базе данных
    // const feedback = await prisma.feedback.findMany({
    //   where: {
    //     interview: { userId: req.user.id }
    //   },
    //   orderBy: { createdAt: 'desc' }
    // });

    res.json(mockFeedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

export const createInterview = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { title, date, description } = req.body;

    console.log('Получены данные для создания интервью:', req.body);

    // В реальном приложении здесь будет создание интервью в базе данных
    const newInterview = {
      id: mockInterviews.length + 1,
      title,
      date: date || new Date().toISOString(),
      status: 'scheduled',
      score: 0, // Начальный балл для нового интервью
      interestCategory: 'PROGRAMMING', // По умолчанию
    };

    // Добавляем новое интервью в массив
    mockInterviews.push(newInterview);

    console.log('Создано новое интервью:', newInterview);

    res.status(201).json(newInterview);
  } catch (error) {
    console.error('Error creating interview:', error);
    res.status(500).json({ error: 'Failed to create interview' });
  }
};

export const updateInterview = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { title, date, description } = req.body;

    console.log('Обновление интервью:', id, req.body);

    // Находим интервью по ID
    const interviewIndex = mockInterviews.findIndex(
      (interview) => interview.id === parseInt(id)
    );

    if (interviewIndex === -1) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Обновляем интервью
    mockInterviews[interviewIndex] = {
      ...mockInterviews[interviewIndex],
      title,
      date: date || mockInterviews[interviewIndex].date,
    };

    console.log('Интервью обновлено:', mockInterviews[interviewIndex]);

    res.json(mockInterviews[interviewIndex]);
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({ error: 'Failed to update interview' });
  }
};

export const deleteInterview = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    console.log('Удаление интервью:', id);

    // Находим индекс интервью
    const interviewIndex = mockInterviews.findIndex(
      (interview) => interview.id === parseInt(id)
    );

    if (interviewIndex === -1) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Удаляем интервью
    const deletedInterview = mockInterviews.splice(interviewIndex, 1)[0];

    console.log('Интервью удалено:', deletedInterview);

    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Error deleting interview:', error);
    res.status(500).json({ error: 'Failed to delete interview' });
  }
};
