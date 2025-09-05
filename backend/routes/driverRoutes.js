import express from 'express';
import { registerDriver, loginDriver, getDriverProfile, logoutDriver, getDriverPublic, updateDriverProfile } from '../controllers/driverController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register Driver
router.post('/register', registerDriver);
// Driver Login
router.post('/login', loginDriver);
// Get Driver profile (protected route)
router.get('/profile', authenticate, getDriverProfile);
// Update Driver profile (protected route) - To be implemented
router.put('/profile', authenticate, updateDriverProfile);
// Logout Driver
router.post('/logout', logoutDriver)
router.get('/:id/public', getDriverPublic);

export default router;
