import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import customerRoutes from './routes/customerRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import mongoose from 'mongoose';

dotenv.config();
const app = express();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    credentials: true
  }
});

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {

    // Routes
    app.use('/api/customers', customerRoutes);
    app.use('/api/drivers', driverRoutes);
    app.use('/api/rides', rideRoutes(io));

    // Socket.io connection
    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);

      // 🚗 Drivers join "drivers" room
      socket.on('join_as_driver', () => {
        console.log(`Socket ${socket.id} joined as DRIVER`);
        socket.join('drivers');
      });

      // 🧑‍💼 Customers join their personal room
      socket.on('join_as_customer', (customerId) => {
        if (!customerId) return;
        const room = `customer:${customerId}`;
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
      });


      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
      });
    });

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
