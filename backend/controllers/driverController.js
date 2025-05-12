import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Driver } from '../models/Driver.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Register a new driver
export const registerDriver = async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;

    const existing = await Driver.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Driver already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const driver = await Driver.create({
      email,
      password: hashedPassword,
      ...rest
    });

    // Generate JWT token for driver
    const token = jwt.sign(
      { id: driver._id, role: 'driver' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set token in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    const { password: storedPassword, ...driverDetails } = driver._doc;

    res.status(201).json({ message: 'Driver registered', data: driverDetails });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login an existing driver
export const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    const driver = await Driver.findOne({ email });
    if (!driver) return res.status(400).json({ error: 'Driver not found' });

    const valid = await bcrypt.compare(password, driver.password);
    if (!valid) return res.status(401).json({ error: 'Invalid Credentials' });

    // Generate JWT token for driver
    const token = jwt.sign(
      { id: driver._id, role: 'driver' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set token in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    const { password: storedPassword, ...driverDetails } = driver._doc;
    res.status(200).json({ message: 'Login successful', data: driverDetails });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Protected route
export const getDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.id).select('-password');
    if (!driver) return res.status(404).json({ message: 'Customer not found' });

    res.status(200).json({ data: driver });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// logout driver
export const logoutDriver = (req, res) => {
   res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  res.status(200).json({ message: 'Logged out' });
}