"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const interview_controller_1 = require("../controllers/interview.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const interview_schema_1 = require("../schemas/interview.schema");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// All interview routes require authentication
router.use(auth_1.authenticate);
// Analytics routes (должны быть перед параметрическими роутами)
router.get('/scores', interview_controller_1.getAllInterviewScores);
router.get('/feedback', interview_controller_1.getAllInterviewFeedback);
// Interview routes
router.get('/', (0, validate_1.validate)(zod_1.z.object({ query: interview_schema_1.getInterviewsParamsSchema })), interview_controller_1.getInterviews);
router.get('/:id', (0, validate_1.validate)(zod_1.z.object({ params: interview_schema_1.interviewIdParamSchema })), interview_controller_1.getInterviewById);
router.get('/:id/scores', (0, validate_1.validate)(zod_1.z.object({ params: interview_schema_1.interviewIdParamSchema })), interview_controller_1.getInterviewScores);
router.post('/', (0, validate_1.validate)(zod_1.z.object({ body: interview_schema_1.createInterviewSchema })), interview_controller_1.createInterview);
router.patch('/:id', (0, validate_1.validate)(zod_1.z.object({
    params: interview_schema_1.interviewIdParamSchema,
    body: interview_schema_1.updateInterviewSchema,
})), interview_controller_1.updateInterview);
router.delete('/:id', (0, validate_1.validate)(zod_1.z.object({ params: interview_schema_1.interviewIdParamSchema })), interview_controller_1.deleteInterview);
// Маршрут для завершения собеседования
router.post('/:id/complete', (0, validate_1.validate)(zod_1.z.object({ params: interview_schema_1.interviewIdParamSchema })), interview_controller_1.completeInterview);
// Interview questions routes
router.get('/:id/questions', (0, validate_1.validate)(zod_1.z.object({ params: interview_schema_1.interviewIdParamSchema })), interview_controller_1.getInterviewQuestions);
router.post('/:id/questions', (0, validate_1.validate)(zod_1.z.object({
    params: interview_schema_1.interviewIdParamSchema,
    body: interview_schema_1.createInterviewQuestionSchema,
})), interview_controller_1.createInterviewQuestion);
// Interview answers routes
router.post('/questions/:questionId/answers', (0, validate_1.validate)(zod_1.z.object({
    params: interview_schema_1.questionIdParamSchema,
    body: interview_schema_1.createInterviewAnswerSchema,
})), interview_controller_1.createInterviewAnswer);
// Interview results routes
router.get('/:id/result', (0, validate_1.validate)(zod_1.z.object({ params: interview_schema_1.interviewIdParamSchema })), interview_controller_1.getInterviewResult);
router.post('/:id/result', (0, validate_1.validate)(zod_1.z.object({
    params: interview_schema_1.interviewIdParamSchema,
    body: interview_schema_1.createInterviewResultSchema,
})), interview_controller_1.createInterviewResult);
// Interview scores routes
router.post('/:id/scores', (0, validate_1.validate)(zod_1.z.object({
    params: interview_schema_1.interviewIdParamSchema,
    body: interview_schema_1.createInterviewScoreSchema,
})), interview_controller_1.createInterviewScore);
// Interview templates routes
router.get('/templates', interview_controller_1.getInterviewTemplates);
router.post('/templates/:templateId/create', (0, validate_1.validate)(zod_1.z.object({
    params: interview_schema_1.templateIdParamSchema,
    body: interview_schema_1.createInterviewFromTemplateSchema,
})), interview_controller_1.createInterviewFromTemplate);
// Feedback routes
router.post('/feedback', (0, validate_1.validate)(zod_1.z.object({ body: interview_schema_1.createInterviewFeedbackSchema })), interview_controller_1.createInterviewFeedback);
router.delete('/feedback/:id', (0, validate_1.validate)(zod_1.z.object({ params: interview_schema_1.feedbackIdParamSchema })), interview_controller_1.deleteInterviewFeedback);
exports.default = router;
