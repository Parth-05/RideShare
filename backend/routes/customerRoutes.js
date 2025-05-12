import express from 'express';
import { registerCustomer, loginCustomer, getCustomerProfile, logoutCustomer } from '../controllers/customerController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerCustomer);
router.get('/profile', authenticate, getCustomerProfile);
router.post('/login', loginCustomer);
router.post('/logout', logoutCustomer)

export default router;