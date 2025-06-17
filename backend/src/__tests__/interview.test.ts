import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import userRoutes from '../routes/user.routes';
import interviewRoutes from '../routes/interview.routes';
import notificationRoutes from '../routes/notification.routes';
import { errorHandler } from '../utils/errors';

const prisma = new PrismaClient();

// Создаем тестовое приложение
const createTestApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api/users', userRoutes);
  app.use('/api/interviews', interviewRoutes);
  app.use('/api/notifications', notificationRoutes);

  app.use(errorHandler);

  return app;
};

// Мок данные для тестов
const mockInterviewer = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  email: 'interviewer@example.com',
  password: 'hashedpassword123',
};

const mockParticipant = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  email: 'participant@example.com',
  password: 'hashedpassword123',
};

// Генерация JWT токена для тестов
const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '1h',
  });
};

describe('Interview API Tests', () => {
  let app: express.Application;
  let interviewerToken: string;
  let participantToken: string;
  let createdInterviewId: string;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    // Создаем тестовых пользователей
    await prisma.user.create({
      data: {
        ...mockInterviewer,
        profile: {
          create: {
            firstName: 'Interviewer',
            lastName: 'User',
            specialization: 'PROGRAMMING',
            bio: 'Test interviewer bio',
          },
        },
      },
    });

    await prisma.user.create({
      data: {
        ...mockParticipant,
        profile: {
          create: {
            firstName: 'Participant',
            lastName: 'User',
            specialization: 'PROGRAMMING',
            bio: 'Test participant bio',
          },
        },
      },
    });

    // Генерируем токены
    interviewerToken = generateToken(mockInterviewer.id);
    participantToken = generateToken(mockParticipant.id);
  });

  describe('GET /interviews', () => {
    it('должен возвращать список интервью для авторизованного пользователя', async () => {
      // Создаем тестовое интервью
      const interview = await prisma.interview.create({
        data: {
          title: 'Test Interview',
          description: 'Test Description',
          specialization: 'PROGRAMMING',
          interviewerId: mockInterviewer.id,
          participantId: mockParticipant.id,
          scheduledAt: new Date(),
          duration: 60,
        },
      });

      const response = await request(app)
        .get('/api/interviews')
        .set('Authorization', `Bearer ${interviewerToken}`)
        .expect(200);

      expect(response.body.interviews).toHaveLength(1);
      expect(response.body.interviews[0].title).toBe('Test Interview');
      expect(response.body.interviews[0].id).toBe(interview.id);
    });

    it('должен фильтровать интервью по статусу', async () => {
      await prisma.interview.createMany({
        data: [
          {
            title: 'Scheduled Interview',
            description: 'Test Description',
            specialization: 'PROGRAMMING',
            interviewerId: mockInterviewer.id,
            status: 'SCHEDULED',
            scheduledAt: new Date(),
            duration: 60,
          },
          {
            title: 'Completed Interview',
            description: 'Test Description',
            specialization: 'PROGRAMMING',
            interviewerId: mockInterviewer.id,
            status: 'COMPLETED',
            scheduledAt: new Date(),
            duration: 60,
          },
        ],
      });

      const response = await request(app)
        .get('/api/interviews?status=SCHEDULED')
        .set('Authorization', `Bearer ${interviewerToken}`)
        .expect(200);

      expect(response.body.interviews).toHaveLength(1);
      expect(response.body.interviews[0].status).toBe('SCHEDULED');
    });

    it('должен возвращать 401 для неавторизованного пользователя', async () => {
      await request(app).get('/api/interviews').expect(401);
    });
  });

  describe('POST /interviews', () => {
    it('должен создавать новое интервью с валидными данными', async () => {
      const interviewData = {
        title: 'New Interview',
        description: 'New Interview Description',
        specialization: 'PROGRAMMING',
        scheduledAt: new Date().toISOString(),
        duration: 90,
      };

      const response = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${interviewerToken}`)
        .send(interviewData)
        .expect(201);

      expect(response.body.title).toBe(interviewData.title);
      expect(response.body.description).toBe(interviewData.description);
      expect(response.body.interviewerId).toBe(mockInterviewer.id);

      createdInterviewId = response.body.id;

      // Проверяем, что интервью создано в базе данных
      const dbInterview = await prisma.interview.findUnique({
        where: { id: response.body.id },
      });
      expect(dbInterview).toBeTruthy();
    });

    it('должен возвращать ошибку валидации для невалидных данных', async () => {
      const invalidData = {
        title: 'AB', // Слишком короткое название
        description: 'Short', // Слишком короткое описание
        duration: 5, // Слишком короткая продолжительность
      };

      await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${interviewerToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /interviews/:id', () => {
    beforeEach(async () => {
      const interview = await prisma.interview.create({
        data: {
          title: 'Test Interview',
          description: 'Test Description',
          specialization: 'PROGRAMMING',
          interviewerId: mockInterviewer.id,
          participantId: mockParticipant.id,
          scheduledAt: new Date(),
          duration: 60,
        },
      });
      createdInterviewId = interview.id;
    });

    it('должен возвращать интервью по ID для интервьюера', async () => {
      const response = await request(app)
        .get(`/api/interviews/${createdInterviewId}`)
        .set('Authorization', `Bearer ${interviewerToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdInterviewId);
      expect(response.body.title).toBe('Test Interview');
      expect(response.body.interviewer).toBeTruthy();
      expect(response.body.participant).toBeTruthy();
    });

    it('должен возвращать интервью по ID для участника', async () => {
      const response = await request(app)
        .get(`/api/interviews/${createdInterviewId}`)
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdInterviewId);
    });

    it('должен возвращать 404 для несуществующего интервью', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';

      await request(app)
        .get(`/api/interviews/${nonExistentId}`)
        .set('Authorization', `Bearer ${interviewerToken}`)
        .expect(404);
    });
  });

  describe('PATCH /interviews/:id', () => {
    beforeEach(async () => {
      const interview = await prisma.interview.create({
        data: {
          title: 'Test Interview',
          description: 'Test Description',
          specialization: 'PROGRAMMING',
          interviewerId: mockInterviewer.id,
          scheduledAt: new Date(),
          duration: 60,
        },
      });
      createdInterviewId = interview.id;
    });

    it('должен обновлять интервью для интервьюера', async () => {
      const updateData = {
        title: 'Updated Interview',
        status: 'IN_PROGRESS',
        participantId: mockParticipant.id,
      };

      const response = await request(app)
        .patch(`/api/interviews/${createdInterviewId}`)
        .set('Authorization', `Bearer ${interviewerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe('Updated Interview');
      expect(response.body.status).toBe('IN_PROGRESS');
      expect(response.body.participantId).toBe(mockParticipant.id);
    });

    it('должен запрещать обновление для участника', async () => {
      const updateData = {
        title: 'Updated Interview',
      };

      await request(app)
        .patch(`/api/interviews/${createdInterviewId}`)
        .set('Authorization', `Bearer ${participantToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /interviews/:id', () => {
    beforeEach(async () => {
      const interview = await prisma.interview.create({
        data: {
          title: 'Test Interview',
          description: 'Test Description',
          specialization: 'PROGRAMMING',
          interviewerId: mockInterviewer.id,
          scheduledAt: new Date(),
          duration: 60,
        },
      });
      createdInterviewId = interview.id;
    });

    it('должен удалять интервью для интервьюера', async () => {
      await request(app)
        .delete(`/api/interviews/${createdInterviewId}`)
        .set('Authorization', `Bearer ${interviewerToken}`)
        .expect(200);

      // Проверяем, что интервью удалено из базы данных
      const deletedInterview = await prisma.interview.findUnique({
        where: { id: createdInterviewId },
      });
      expect(deletedInterview).toBeNull();
    });

    it('должен запрещать удаление для участника', async () => {
      await request(app)
        .delete(`/api/interviews/${createdInterviewId}`)
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(404);
    });
  });

  describe('POST /interviews/:id/questions', () => {
    beforeEach(async () => {
      const interview = await prisma.interview.create({
        data: {
          title: 'Test Interview',
          description: 'Test Description',
          specialization: 'PROGRAMMING',
          interviewerId: mockInterviewer.id,
          scheduledAt: new Date(),
          duration: 60,
        },
      });
      createdInterviewId = interview.id;
    });

    it('должен создавать вопрос для интервью', async () => {
      const questionData = {
        content: 'What is your experience with JavaScript?',
        order: 1,
      };

      const response = await request(app)
        .post(`/api/interviews/${createdInterviewId}/questions`)
        .set('Authorization', `Bearer ${interviewerToken}`)
        .send(questionData)
        .expect(201);

      expect(response.body.content).toBe(questionData.content);
      expect(response.body.order).toBe(questionData.order);
      expect(response.body.interviewId).toBe(createdInterviewId);
    });

    it('должен возвращать ошибку валидации для невалидных данных', async () => {
      const invalidData = {
        content: 'Hi?', // Слишком короткий вопрос
        order: 0, // Неверный порядок
      };

      await request(app)
        .post(`/api/interviews/${createdInterviewId}/questions`)
        .set('Authorization', `Bearer ${interviewerToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('POST /interviews/:id/scores', () => {
    beforeEach(async () => {
      const interview = await prisma.interview.create({
        data: {
          title: 'Test Interview',
          description: 'Test Description',
          specialization: 'PROGRAMMING',
          interviewerId: mockInterviewer.id,
          scheduledAt: new Date(),
          duration: 60,
        },
      });
      createdInterviewId = interview.id;
    });

    it('должен создавать оценку для интервью', async () => {
      const scoreData = {
        criteriaName: 'Technical Skills',
        score: 8,
        comment: 'Good technical knowledge',
      };

      const response = await request(app)
        .post(`/api/interviews/${createdInterviewId}/scores`)
        .set('Authorization', `Bearer ${interviewerToken}`)
        .send(scoreData)
        .expect(201);

      expect(response.body.criteriaName).toBe(scoreData.criteriaName);
      expect(response.body.score).toBe(scoreData.score);
      expect(response.body.comment).toBe(scoreData.comment);
    });

    it('должен возвращать ошибку для оценки вне диапазона', async () => {
      const invalidData = {
        criteriaName: 'Technical Skills',
        score: 15, // Оценка больше 10
      };

      await request(app)
        .post(`/api/interviews/${createdInterviewId}/scores`)
        .set('Authorization', `Bearer ${interviewerToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('POST /interviews/:id/result', () => {
    beforeEach(async () => {
      const interview = await prisma.interview.create({
        data: {
          title: 'Test Interview',
          description: 'Test Description',
          specialization: 'PROGRAMMING',
          interviewerId: mockInterviewer.id,
          scheduledAt: new Date(),
          duration: 60,
        },
      });
      createdInterviewId = interview.id;
    });

    it('должен создавать результат интервью', async () => {
      const resultData = {
        totalScore: 85,
        decision: 'HIRE',
        summary: 'Excellent candidate with strong technical skills',
      };

      const response = await request(app)
        .post(`/api/interviews/${createdInterviewId}/result`)
        .set('Authorization', `Bearer ${interviewerToken}`)
        .send(resultData)
        .expect(201);

      expect(response.body.totalScore).toBe(resultData.totalScore);
      expect(response.body.decision).toBe(resultData.decision);
      expect(response.body.summary).toBe(resultData.summary);
    });

    it('должен обновлять существующий результат', async () => {
      // Создаем первый результат
      await request(app)
        .post(`/api/interviews/${createdInterviewId}/result`)
        .set('Authorization', `Bearer ${interviewerToken}`)
        .send({
          totalScore: 70,
          decision: 'CONSIDER',
          summary: 'Initial assessment',
        });

      // Обновляем результат
      const updatedData = {
        totalScore: 90,
        decision: 'HIRE',
        summary: 'Updated assessment - strong candidate',
      };

      const response = await request(app)
        .post(`/api/interviews/${createdInterviewId}/result`)
        .set('Authorization', `Bearer ${interviewerToken}`)
        .send(updatedData)
        .expect(201);

      expect(response.body.totalScore).toBe(updatedData.totalScore);
      expect(response.body.decision).toBe(updatedData.decision);
    });
  });

  describe('GET /interviews/:id/scores', () => {
    beforeEach(async () => {
      const interview = await prisma.interview.create({
        data: {
          title: 'Test Interview',
          description: 'Test Description',
          specialization: 'PROGRAMMING',
          interviewerId: mockInterviewer.id,
          participantId: mockParticipant.id,
          scheduledAt: new Date(),
          duration: 60,
        },
      });
      createdInterviewId = interview.id;

      // Создаем тестовые оценки
      await prisma.interviewScore.createMany({
        data: [
          {
            interviewId: createdInterviewId,
            criteriaName: 'Technical Skills',
            score: 8,
            comment: 'Good technical knowledge',
          },
          {
            interviewId: createdInterviewId,
            criteriaName: 'Communication',
            score: 9,
            comment: 'Excellent communication',
          },
        ],
      });
    });

    it('должен возвращать оценки интервью', async () => {
      const response = await request(app)
        .get(`/api/interviews/${createdInterviewId}/scores`)
        .set('Authorization', `Bearer ${interviewerToken}`)
        .expect(200);

      expect(response.body.interviewId).toBe(createdInterviewId);
      expect(response.body.categories).toHaveLength(2);
      expect(response.body.totalScore).toBe(9); // Среднее от 8 и 9
    });
  });
});
