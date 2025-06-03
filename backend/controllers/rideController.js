// controllers/rideController.js
import { Ride } from '../models/Ride.js';
import { Driver } from '../models/Driver.js';

// Request ride
export const requestRide = (io) => async (req, res) => {
    try {
        const customerId = req.user.id;
        const {
            pickup_destination,
            pickup_latitude,
            pickup_longitude,
            dropoff_destination,
            dropoff_latitude,
            dropoff_longitude
        } = req.body;

        const ride = await Ride.create({
            customer_id: customerId,
            driver_id: null,
            pickup_time: new Date(),
            pickup_destination,
            pickup_latitude,
            pickup_longitude,
            dropoff_destination,
            dropoff_latitude,
            dropoff_longitude,
            status: 'requested'
        });

        // 🚗 Emit to drivers room!
        io.to('drivers').emit('new_ride_request', {
            ride_id: ride._id,
            pickup_destination,
            pickup_latitude,
            pickup_longitude,
            dropoff_destination,
            dropoff_latitude,
            dropoff_longitude
        });

        console.log('Emitted new_ride_request to drivers');

        res.status(201).json({
            message: 'Ride request created',
            data: ride
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Accept ride
export const acceptRide = (io) => async (req, res) => {
    try {
        const driverId = req.user.id;
        const { ride_id } = req.body;

        const ride = await Ride.findOne({ _id: ride_id, status: 'requested' });
        if (!ride) return res.status(400).json({ message: 'Ride not available or already accepted' });

        ride.driver_id = driverId;
        ride.status = 'confirmed';
        await ride.save();

        // 🚗 Emit ride_confirmed to all (later you can send to specific customer socket)
        io.emit('ride_confirmed', {
            ride_id: ride._id,
            driver_id: driverId
        });

        console.log('Emitted ride_confirmed');

        res.status(200).json({
            message: 'Ride accepted',
            data: ride
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
