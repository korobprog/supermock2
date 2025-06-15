import { Router } from 'express';
import {
  getInterviews,
  getInterviewById,
  getInterviewScores,
  getInterviewFeedback,
  createInterview,
  updateInterview,
  deleteInterview,
} from '../controllers/interview.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All interview routes require authentication
router.use(authenticate);

// Interview routes
router.get('/', getInterviews as any);
router.get('/:id', getInterviewById as any);
router.get('/:id/scores', getInterviewScores as any);
router.get('/feedback', getInterviewFeedback as any);
router.post('/', createInterview as any);
router.patch('/:id', updateInterview as any);
router.delete('/:id', deleteInterview as any);

export default router;
