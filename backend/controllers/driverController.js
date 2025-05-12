import bcrypt from 'bcrypt';
import { Driver } from '../models/Driver.js';

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

    res.status(201).json({ message: 'Driver registered', driver });
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

    const { password: storedPassword, ...driverDetails } = driver._doc;
    res.status(200).json({ message: 'Login successful', driver: driverDetails });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
