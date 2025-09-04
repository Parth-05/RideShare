import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {getUserProfile} from '../controllers/authController.js';

/**
 * GET /api/auth/me
 * Returns { role, user } if logged in, else 401.
 */

const router = express.Router();

router.get('/me', authenticate, getUserProfile);

export default router;
