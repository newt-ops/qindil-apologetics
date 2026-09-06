import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import {
  registerSchema,
  verifyOtpSchema,
  loginSchema,
  googleLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';
import {
  register,
  verifyOtp,
  login,
  googleLogin,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  me,
} from '../controllers/auth.controller.js';
import { generateTelegramLinkCode } from '../controllers/me.controller.js';

const router = Router();

// Apply rate limiter to all auth endpoints
router.use(authLimiter);

router.post('/register', validate(registerSchema), register);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.post('/login', validate(loginSchema), login);
router.post('/google', validate(googleLoginSchema), googleLogin);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.get('/me', protect, me);
router.post('/telegram/code', protect, generateTelegramLinkCode);

export default router;
