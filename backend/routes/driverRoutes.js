import express from 'express';
import { registerDriver, loginDriver, getDriverProfile, logoutDriver } from '../controllers/driverController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerDriver);
router.post('/login', loginDriver);
router.get('/profile', authenticate, getDriverProfile);
router.post('/logout', logoutDriver)

export default router;
