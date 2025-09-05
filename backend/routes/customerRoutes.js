import express from 'express';
import { registerCustomer, loginCustomer, getCustomerProfile, logoutCustomer, updateCustomerProfile } from '../controllers/customerController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register a new customer
router.post('/register', registerCustomer);
// Get customer profile (protected route)
router.get('/profile', authenticate, getCustomerProfile);
// Edit Customer profile (protected route)
router.put('/profile', authenticate, updateCustomerProfile);
// Customer login
router.post('/login', loginCustomer);
// Customer logout
router.post('/logout', logoutCustomer)

export default router;