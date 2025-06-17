import { Router } from 'express';
import {
  getInterviews,
  getInterviewById,
  getInterviewScores,
  getInterviewFeedback,
  getAllInterviewScores,
  getAllInterviewFeedback,
  createInterview,
  updateInterview,
  deleteInterview,
  getInterviewQuestions,
  createInterviewQuestion,
  createInterviewAnswer,
  createInterviewResult,
  getInterviewResult,
  createInterviewScore,
  getInterviewTemplates,
  createInterviewFromTemplate,
  completeInterview,
  createInterviewFeedback,
  deleteInterviewFeedback,
} from '../controllers/interview.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createInterviewSchema,
  updateInterviewSchema,
  createInterviewQuestionSchema,
  createInterviewAnswerSchema,
  createInterviewScoreSchema,
  createInterviewResultSchema,
  createInterviewFeedbackSchema,
  createInterviewFromTemplateSchema,
  getInterviewsParamsSchema,
  interviewIdParamSchema,
  questionIdParamSchema,
  templateIdParamSchema,
  feedbackIdParamSchema,
} from '../schemas/interview.schema';
import { z } from 'zod';

const router = Router();

// All interview routes require authentication
router.use(authenticate);

// Analytics routes (должны быть перед параметрическими роутами)
router.get('/scores', getAllInterviewScores);
router.get('/feedback', getAllInterviewFeedback);

// Interview routes
router.get(
  '/',
  validate(z.object({ query: getInterviewsParamsSchema })),
  getInterviews
);
router.get(
  '/:id',
  validate(z.object({ params: interviewIdParamSchema })),
  getInterviewById
);
router.get(
  '/:id/scores',
  validate(z.object({ params: interviewIdParamSchema })),
  getInterviewScores
);

router.post(
  '/',
  validate(z.object({ body: createInterviewSchema })),
  createInterview
);
router.patch(
  '/:id',
  validate(
    z.object({
      params: interviewIdParamSchema,
      body: updateInterviewSchema,
    })
  ),
  updateInterview
);
router.delete(
  '/:id',
  validate(z.object({ params: interviewIdParamSchema })),
  deleteInterview
);

// Маршрут для завершения собеседования
router.post(
  '/:id/complete',
  validate(z.object({ params: interviewIdParamSchema })),
  completeInterview
);

// Interview questions routes
router.get(
  '/:id/questions',
  validate(z.object({ params: interviewIdParamSchema })),
  getInterviewQuestions
);
router.post(
  '/:id/questions',
  validate(
    z.object({
      params: interviewIdParamSchema,
      body: createInterviewQuestionSchema,
    })
  ),
  createInterviewQuestion
);

// Interview answers routes
router.post(
  '/questions/:questionId/answers',
  validate(
    z.object({
      params: questionIdParamSchema,
      body: createInterviewAnswerSchema,
    })
  ),
  createInterviewAnswer
);

// Interview results routes
router.get(
  '/:id/result',
  validate(z.object({ params: interviewIdParamSchema })),
  getInterviewResult
);
router.post(
  '/:id/result',
  validate(
    z.object({
      params: interviewIdParamSchema,
      body: createInterviewResultSchema,
    })
  ),
  createInterviewResult
);

// Interview scores routes
router.post(
  '/:id/scores',
  validate(
    z.object({
      params: interviewIdParamSchema,
      body: createInterviewScoreSchema,
    })
  ),
  createInterviewScore
);

// Interview templates routes
router.get('/templates', getInterviewTemplates);
router.post(
  '/templates/:templateId/create',
  validate(
    z.object({
      params: templateIdParamSchema,
      body: createInterviewFromTemplateSchema,
    })
  ),
  createInterviewFromTemplate
);

// Feedback routes
router.post(
  '/feedback',
  validate(z.object({ body: createInterviewFeedbackSchema })),
  createInterviewFeedback
);
router.delete(
  '/feedback/:id',
  validate(z.object({ params: feedbackIdParamSchema })),
  deleteInterviewFeedback
);

export default router;
