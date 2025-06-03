// routes/rideRoutes.js
import express from 'express';
import { requestRide, acceptRide } from '../controllers/rideController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

export default (io) => {
    // POST /api/rides/request
    router.post('/request', authenticate, requestRide(io));

    // POST /api/rides/accept
    router.post('/accept', authenticate, acceptRide(io));

    return router;
};
