import { Router, Request, Response, NextFunction } from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  getInterests,
  createInterest,
  updateInterest,
  deleteInterest,
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  uploadAvatar as uploadMiddleware,
  handleUploadError,
} from '../middleware/upload';
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

// Test route
router.get('/test', (req: Request, res: Response) => {
  console.log('🔍 [TEST ROUTE] Test route hit!');
  res.json({ message: 'Test route works!' });
});

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.patch(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  updateProfile
);

// Upload avatar route
console.log('🔍 [ROUTES DEBUG] Registering POST /avatar route');

// Полный маршрут для загрузки аватарки
router.post(
  '/avatar',
  (req: Request, res: Response, next: NextFunction) => {
    console.log('🔍 [AVATAR ROUTE DEBUG] POST /avatar route hit!');
    console.log('🔍 [AVATAR ROUTE DEBUG] Request method:', req.method);
    console.log('🔍 [AVATAR ROUTE DEBUG] Request path:', req.path);
    console.log('🔍 [AVATAR ROUTE DEBUG] Request URL:', req.url);
    console.log('🔍 [AVATAR ROUTE DEBUG] Original URL:', req.originalUrl);
    console.log('🔍 [AVATAR ROUTE DEBUG] Base URL:', req.baseUrl);
    console.log(
      '🔍 [AVATAR ROUTE DEBUG] Content-Type:',
      req.headers['content-type']
    );
    console.log(
      '🔍 [AVATAR ROUTE DEBUG] Content-Length:',
      req.headers['content-length']
    );
    next();
  },
  (req: Request, res: Response, next: NextFunction) => {
    console.log('🔍 [AVATAR ROUTE DEBUG] Before authenticate middleware');
    next();
  },
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    console.log(
      '🔍 [AVATAR ROUTE DEBUG] After authenticate middleware, before upload'
    );
    console.log(
      '🔍 [AVATAR ROUTE DEBUG] User authenticated:',
      req.user ? 'Yes' : 'No'
    );
    next();
  },
  uploadMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    console.log(
      '🔍 [AVATAR ROUTE DEBUG] After upload middleware, before error handler'
    );
    next();
  },
  handleUploadError,
  (req: Request, res: Response, next: NextFunction) => {
    console.log(
      '🔍 [AVATAR ROUTE DEBUG] After error handler, before controller'
    );
    next();
  },
  uploadAvatar
);

// Remove avatar route
router.delete('/avatar', authenticate, removeAvatar);

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
