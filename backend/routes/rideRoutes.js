// routes/rideRoutes.js
import express from 'express';
import { requestRide, acceptRide, updateRideStatus, getRideById } from '../controllers/rideController.js';
import { authenticate, requireDriver } from '../middleware/authMiddleware.js';

const router = express.Router();

export default (io) => {
    // POST /api/rides/request
    router.post('/request', authenticate, requestRide(io));

    // POST /api/rides/accept
    router.post('/accept', authenticate, requireDriver, acceptRide(io));

    // PATCH /api/rides/:id/status to update the ride status
    router.patch('/:id/status', authenticate, requireDriver, updateRideStatus(io));

    router.get('/:id', authenticate, getRideById);

    return router;
};
