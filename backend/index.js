import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import customerRoutes from './routes/customerRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import mongoose from 'mongoose';

dotenv.config();
const app = express();

// Client/Frontend Origin URL 
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

// Middleware
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true
}
));
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ Connected to MongoDB');

    // Middleware Routes
    app.use('/api/customers', customerRoutes);
    app.use('/api/drivers', driverRoutes);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });