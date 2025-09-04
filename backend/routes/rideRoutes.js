// routes/rideRoutes.js
import express from 'express';
import { requestRide, acceptRide, updateRideStatus, getRideById, getRideHistory } from '../controllers/rideController.js';
import { authenticate, requireDriver } from '../middleware/authMiddleware.js';

const router = express.Router();

export default (io) => {
    // POST /api/rides/request
    router.post('/request', authenticate, requestRide(io));

    // POST /api/rides/accept
    router.post('/accept', authenticate, requireDriver, acceptRide(io));

    // GET /api/rides/history to get ride history for driver or customer
    router.get('/history', authenticate, getRideHistory);

    // Paramereterized routes
    // PATCH /api/rides/:id/status to update the ride status
    router.put('/:id/status', authenticate, requireDriver, updateRideStatus(io));

    router.get('/:id', authenticate, getRideById);

    return router;
};
