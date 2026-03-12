import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimit } from '../middleware/rateLimit.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    username: z.string().min(3, 'Username must be at least 3 characters').max(50),
    password: z.string().min(8, 'Password must be at least 8 characters').max(100),
    displayName: z.string().max(100).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// Public routes
router.post(
  '/register',
  authRateLimit,
  validateRequest(registerSchema),
  authController.register.bind(authController)
);

router.post(
  '/login',
  authRateLimit,
  validateRequest(loginSchema),
  authController.login.bind(authController)
);

router.post('/refresh', authController.refresh.bind(authController));

router.post('/logout', authController.logout.bind(authController));

// Protected routes
router.get('/me', authenticate, authController.me.bind(authController));

export default router;
