import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Customer } from '../models/Customer.js';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Register a new customer
export const registerCustomer = async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;

    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Customer already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      email,
      password: hashedPassword,
      ...rest
    });

    // Sign JWT token after registration
    const token = jwt.sign(
      { id: customer._id, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set token in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',// HTTPS only in prod
      sameSite: 'None', // cross-site
      maxAge: 60 * 60 * 1000 // 1 hour
    });
    const { password: storedPassword, ...customerDetails } = customer._doc;

    res.status(201).json({ message: 'Customer registered', data: customerDetails });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login an existing customer
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(400).json({ message: 'Customer not found' });

    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) return res.status(401).json({ message: 'Invalid Credentials' });

    // Sign JWT token
    const token = jwt.sign(
      { id: customer._id, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set token in httpOnly cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // only over HTTPS in prod
    sameSite: 'None', // cross-site  
    maxAge: 60 * 60 * 1000 // 1 hour
  });

    const { password: storedPassword, ...customerDetails } = customer._doc;
    res.status(200).json({ message: 'Login successful', data: customerDetails });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Protected route
export const getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select('-password');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    res.status(200).json({ customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Logout the customer
export const logoutCustomer = (req, res) => {
   res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  res.status(200).json({ message: 'Logged out' });
}
