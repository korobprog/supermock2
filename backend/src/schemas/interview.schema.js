"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackIdParamSchema = exports.templateIdParamSchema = exports.questionIdParamSchema = exports.interviewIdParamSchema = exports.getInterviewsParamsSchema = exports.createInterviewFromTemplateSchema = exports.createInterviewTemplateSchema = exports.createInterviewResultSchema = exports.createInterviewFeedbackSchema = exports.createInterviewScoreSchema = exports.createInterviewAnswerSchema = exports.createInterviewQuestionSchema = exports.updateInterviewSchema = exports.createInterviewSchema = exports.InterviewDecisionEnum = exports.InterviewStatusEnum = void 0;
const zod_1 = require("zod");
// Enum для статуса интервью
exports.InterviewStatusEnum = zod_1.z.enum([
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
]);
// Enum для решения по результатам интервью
exports.InterviewDecisionEnum = zod_1.z.enum(['HIRE', 'REJECT', 'CONSIDER']);
// 1. Схема для создания нового интервью
exports.createInterviewSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Название должно содержать минимум 3 символа'),
    description: zod_1.z
        .string()
        .min(10, 'Описание должно содержать минимум 10 символов'),
    specialization: zod_1.z
        .string()
        .min(2, 'Специализация должна содержать минимум 2 символа'),
    scheduledAt: zod_1.z.string().datetime('Неверный формат даты и времени'),
    duration: zod_1.z
        .number()
        .min(15, 'Продолжительность должна быть минимум 15 минут'),
    videoLink: zod_1.z
        .string()
        .url('Неверный формат URL')
        .min(1, 'Ссылка на видеоконференцию обязательна'),
});
// 2. Схема для обновления интервью
exports.updateInterviewSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(3, 'Название должно содержать минимум 3 символа')
        .optional(),
    description: zod_1.z
        .string()
        .min(10, 'Описание должно содержать минимум 10 символов')
        .optional(),
    specialization: zod_1.z
        .string()
        .min(2, 'Специализация должна содержать минимум 2 символа')
        .optional(),
    status: exports.InterviewStatusEnum.optional(),
    scheduledAt: zod_1.z.string().datetime('Неверный формат даты и времени').optional(),
    duration: zod_1.z
        .number()
        .min(15, 'Продолжительность должна быть минимум 15 минут')
        .optional(),
    participantId: zod_1.z.string().uuid('Неверный формат UUID участника').optional(),
    videoLink: zod_1.z.string().url('Неверный формат URL').optional(),
});
// 3. Схема для создания вопроса интервью
exports.createInterviewQuestionSchema = zod_1.z.object({
    interviewId: zod_1.z.string().uuid('Неверный формат UUID интервью'),
    content: zod_1.z
        .string()
        .min(5, 'Содержание вопроса должно содержать минимум 5 символов'),
    order: zod_1.z.number().min(1, 'Порядок должен быть минимум 1'),
});
// 4. Схема для создания ответа на вопрос
exports.createInterviewAnswerSchema = zod_1.z.object({
    questionId: zod_1.z.string().uuid('Неверный формат UUID вопроса'),
    content: zod_1.z
        .string()
        .min(5, 'Содержание ответа должно содержать минимум 5 символов'),
    score: zod_1.z
        .number()
        .min(0, 'Оценка не может быть меньше 0')
        .max(10, 'Оценка не может быть больше 10'),
});
// 5. Схема для создания оценки интервью
exports.createInterviewScoreSchema = zod_1.z.object({
    interviewId: zod_1.z.string().uuid('Неверный формат UUID интервью'),
    criteriaName: zod_1.z
        .string()
        .min(2, 'Название критерия должно содержать минимум 2 символа'),
    score: zod_1.z
        .number()
        .min(0, 'Оценка не может быть меньше 0')
        .max(10, 'Оценка не может быть больше 10'),
    comment: zod_1.z.string().optional(),
});
// 6. Схема для создания обратной связи
exports.createInterviewFeedbackSchema = zod_1.z.object({
    interviewId: zod_1.z.string().uuid('Неверный формат UUID интервью'),
    content: zod_1.z
        .string()
        .min(10, 'Содержание обратной связи должно содержать минимум 10 символов'),
    rating: zod_1.z
        .number()
        .min(1, 'Рейтинг не может быть меньше 1')
        .max(5, 'Рейтинг не может быть больше 5'),
});
// 7. Схема для создания результата интервью
exports.createInterviewResultSchema = zod_1.z.object({
    interviewId: zod_1.z.string().uuid('Неверный формат UUID интервью'),
    totalScore: zod_1.z
        .number()
        .min(0, 'Общий балл не может быть меньше 0')
        .max(100, 'Общий балл не может быть больше 100'),
    decision: exports.InterviewDecisionEnum,
    summary: zod_1.z.string().min(10, 'Резюме должно содержать минимум 10 символов'),
});
// 8. Схема для создания шаблона интервью
exports.createInterviewTemplateSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(3, 'Название шаблона должно содержать минимум 3 символа'),
    description: zod_1.z
        .string()
        .min(10, 'Описание шаблона должно содержать минимум 10 символов'),
    specialization: zod_1.z
        .string()
        .min(2, 'Специализация должна содержать минимум 2 символа'),
    criteriaIds: zod_1.z.array(zod_1.z.string().uuid('Неверный формат UUID критерия')),
});
// 9. Схема для создания интервью из шаблона
exports.createInterviewFromTemplateSchema = zod_1.z.object({
    templateId: zod_1.z.string().uuid('Неверный формат UUID шаблона'),
    scheduledAt: zod_1.z.string().datetime('Неверный формат даты и времени'),
    duration: zod_1.z
        .number()
        .min(15, 'Продолжительность должна быть минимум 15 минут'),
});
// Типы для параметров запросов
// Параметры для получения списка интервью
exports.getInterviewsParamsSchema = zod_1.z.object({
    status: exports.InterviewStatusEnum.optional(),
    specialization: zod_1.z.string().optional(),
    showAll: zod_1.z.string().optional(),
});
// Параметр ID интервью
exports.interviewIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Неверный формат UUID интервью'),
});
// Параметр ID вопроса
exports.questionIdParamSchema = zod_1.z.object({
    questionId: zod_1.z.string().uuid('Неверный формат UUID вопроса'),
});
// Параметр ID шаблона
exports.templateIdParamSchema = zod_1.z.object({
    templateId: zod_1.z.string().uuid('Неверный формат UUID шаблона'),
});
// Параметр ID отзыва
exports.feedbackIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Неверный формат UUID отзыва'),
});
