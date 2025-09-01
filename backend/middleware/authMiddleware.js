import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// authenticate user
export const authenticate = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// authenticate driver
export const requireDriver = (req, res, next) => {
  if (req.user?.role !== 'driver') {
    return res.status(403).json({ message: 'Driver access required' });
  }
  next();
};