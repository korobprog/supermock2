import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  getInterests,
  createInterest,
  updateInterest,
  deleteInterest,
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  createInterestSchema,
  updateInterestSchema,
  deleteInterestSchema,
} from '../schemas/user.schema';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/interests', getInterests);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.patch(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  updateProfile
);

// Admin routes for interest management
router.post(
  '/interests',
  authenticate,
  authorize('ADMIN'),
  validate(createInterestSchema),
  createInterest
);

router.put(
  '/interests/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateInterestSchema),
  updateInterest
);

router.delete(
  '/interests/:id',
  authenticate,
  authorize('ADMIN'),
  validate(deleteInterestSchema),
  deleteInterest
);

export default router;
