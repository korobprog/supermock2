import { z } from 'zod';

// Enum для статуса интервью
export const InterviewStatusEnum = z.enum([
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]);

// Enum для решения по результатам интервью
export const InterviewDecisionEnum = z.enum(['HIRE', 'REJECT', 'CONSIDER']);

// 1. Схема для создания нового интервью
export const createInterviewSchema = z.object({
  title: z.string().min(3, 'Название должно содержать минимум 3 символа'),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов'),
  specialization: z
    .string()
    .min(2, 'Специализация должна содержать минимум 2 символа'),
  scheduledAt: z.string().datetime('Неверный формат даты и времени'),
  duration: z
    .number()
    .min(15, 'Продолжительность должна быть минимум 15 минут'),
  videoLink: z
    .string()
    .url('Неверный формат URL')
    .min(1, 'Ссылка на видеоконференцию обязательна'),
});

// 2. Схема для обновления интервью
export const updateInterviewSchema = z.object({
  title: z
    .string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .optional(),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .optional(),
  specialization: z
    .string()
    .min(2, 'Специализация должна содержать минимум 2 символа')
    .optional(),
  status: InterviewStatusEnum.optional(),
  scheduledAt: z.string().datetime('Неверный формат даты и времени').optional(),
  duration: z
    .number()
    .min(15, 'Продолжительность должна быть минимум 15 минут')
    .optional(),
  participantId: z.string().uuid('Неверный формат UUID участника').optional(),
  videoLink: z.string().url('Неверный формат URL').optional(),
});

// 3. Схема для создания вопроса интервью
export const createInterviewQuestionSchema = z.object({
  interviewId: z.string().uuid('Неверный формат UUID интервью'),
  content: z
    .string()
    .min(5, 'Содержание вопроса должно содержать минимум 5 символов'),
  order: z.number().min(1, 'Порядок должен быть минимум 1'),
});

// 4. Схема для создания ответа на вопрос
export const createInterviewAnswerSchema = z.object({
  questionId: z.string().uuid('Неверный формат UUID вопроса'),
  content: z
    .string()
    .min(5, 'Содержание ответа должно содержать минимум 5 символов'),
  score: z
    .number()
    .min(0, 'Оценка не может быть меньше 0')
    .max(10, 'Оценка не может быть больше 10'),
});

// 5. Схема для создания оценки интервью
export const createInterviewScoreSchema = z.object({
  interviewId: z.string().uuid('Неверный формат UUID интервью'),
  criteriaName: z
    .string()
    .min(2, 'Название критерия должно содержать минимум 2 символа'),
  score: z
    .number()
    .min(0, 'Оценка не может быть меньше 0')
    .max(10, 'Оценка не может быть больше 10'),
  comment: z.string().optional(),
});

// 6. Схема для создания обратной связи
export const createInterviewFeedbackSchema = z.object({
  interviewId: z.string().uuid('Неверный формат UUID интервью'),
  content: z
    .string()
    .min(10, 'Содержание обратной связи должно содержать минимум 10 символов'),
  rating: z
    .number()
    .min(1, 'Рейтинг не может быть меньше 1')
    .max(5, 'Рейтинг не может быть больше 5'),
});

// 7. Схема для создания результата интервью
export const createInterviewResultSchema = z.object({
  interviewId: z.string().uuid('Неверный формат UUID интервью'),
  totalScore: z
    .number()
    .min(0, 'Общий балл не может быть меньше 0')
    .max(100, 'Общий балл не может быть больше 100'),
  decision: InterviewDecisionEnum,
  summary: z.string().min(10, 'Резюме должно содержать минимум 10 символов'),
});

// 8. Схема для создания шаблона интервью
export const createInterviewTemplateSchema = z.object({
  name: z
    .string()
    .min(3, 'Название шаблона должно содержать минимум 3 символа'),
  description: z
    .string()
    .min(10, 'Описание шаблона должно содержать минимум 10 символов'),
  specialization: z
    .string()
    .min(2, 'Специализация должна содержать минимум 2 символа'),
  criteriaIds: z.array(z.string().uuid('Неверный формат UUID критерия')),
});

// 9. Схема для создания интервью из шаблона
export const createInterviewFromTemplateSchema = z.object({
  templateId: z.string().uuid('Неверный формат UUID шаблона'),
  scheduledAt: z.string().datetime('Неверный формат даты и времени'),
  duration: z
    .number()
    .min(15, 'Продолжительность должна быть минимум 15 минут'),
});

// Типы для параметров запросов

// Параметры для получения списка интервью
export const getInterviewsParamsSchema = z.object({
  status: InterviewStatusEnum.optional(),
  specialization: z.string().optional(),
  showAll: z.string().optional(),
});

// Параметр ID интервью
export const interviewIdParamSchema = z.object({
  id: z.string().uuid('Неверный формат UUID интервью'),
});

// Параметр ID вопроса
export const questionIdParamSchema = z.object({
  questionId: z.string().uuid('Неверный формат UUID вопроса'),
});

// Параметр ID шаблона
export const templateIdParamSchema = z.object({
  templateId: z.string().uuid('Неверный формат UUID шаблона'),
});

// Параметр ID отзыва
export const feedbackIdParamSchema = z.object({
  id: z.string().uuid('Неверный формат UUID отзыва'),
});

// Экспорт типов для использования в контроллерах
export type CreateInterviewData = z.infer<typeof createInterviewSchema>;
export type UpdateInterviewData = z.infer<typeof updateInterviewSchema>;
export type CreateInterviewQuestionData = z.infer<
  typeof createInterviewQuestionSchema
>;
export type CreateInterviewAnswerData = z.infer<
  typeof createInterviewAnswerSchema
>;
export type CreateInterviewScoreData = z.infer<
  typeof createInterviewScoreSchema
>;
export type CreateInterviewFeedbackData = z.infer<
  typeof createInterviewFeedbackSchema
>;
export type CreateInterviewResultData = z.infer<
  typeof createInterviewResultSchema
>;
export type CreateInterviewTemplateData = z.infer<
  typeof createInterviewTemplateSchema
>;
export type CreateInterviewFromTemplateData = z.infer<
  typeof createInterviewFromTemplateSchema
>;
export type GetInterviewsParams = z.infer<typeof getInterviewsParamsSchema>;
export type InterviewIdParam = z.infer<typeof interviewIdParamSchema>;
export type QuestionIdParam = z.infer<typeof questionIdParamSchema>;
export type TemplateIdParam = z.infer<typeof templateIdParamSchema>;
export type FeedbackIdParam = z.infer<typeof feedbackIdParamSchema>;
