// controllers/rideController.js
import { MSG_DRIVER_ACCESS_REQUIRED, MSG_ERROR, MSG_NOT_YOUR_RIDE, MSG_RIDE_ALREADY_ACCEPTED, MSG_RIDE_NOT_FOUND, MSG_INVALID_STATUS_TRANSITION, MSG_RIDE_REQUESTED, MSG_SUCCESS, STATUS_CODE_200, STATUS_CODE_201, STATUS_CODE_400, STATUS_CODE_403, STATUS_CODE_404, STATUS_CODE_500, MSG_INVALID_USER_ROLE } from '../constants/apiResponseConstants.js';
import { Ride } from '../models/Ride.js';
import { ErrorResponse, SuccessResponse } from '../utils/apiResponse.js';
// import { Driver } from '../models/Driver.js'; // not used; safe to remove

/** Build a consistent socket payload from a Ride doc */
function buildRidePayload(ride) {
  return {
    ride_id: ride._id,
    customer_id: ride.customer_id,
    driver_id: ride.driver_id,
    status: ride.status,
    price: ride.price,
    pickup_time: ride.pickup_time,
    dropoff_time: ride.dropoff_time,
    confirmed_time: ride.confirmed_time,
    updatedAt: ride.updatedAt,
  };
}

/** Emit to a single customer's room */
function emitToCustomer(io, customerId, event, payload) {
  if (!customerId) return;
  io.to(`customer:${customerId}`).emit(event, payload);
}

/** Emit to the shared "drivers" room only — FIX: accept payload arg */
function emitToDrivers(io, event, payload) {
  io.to('drivers').emit(event, payload);
}

// Request ride
export const requestRide = (io) => async (req, res) => {
  try {
    // get the customer id from req.user set by authenticate middleware
    const customerId = req.user.id;
    // get ride details from req.body
    const {
      pickup_destination,
      pickup_latitude,
      pickup_longitude,
      dropoff_destination,
      dropoff_latitude,
      dropoff_longitude,
      price
    } = req.body;
    // create new ride with status 'requested'
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
      price,
      status: 'requested',
    });

    // Broadcast new request to all drivers
    emitToDrivers(io, 'new_ride_request', {
      ride_id: ride._id,
      pickup_destination,
      pickup_latitude,
      pickup_longitude,
      dropoff_destination,
      dropoff_latitude,
      dropoff_longitude,
      
    });

    console.log('Emitted new_ride_request to drivers');
    return SuccessResponse(res,{ success: true, statusCode: STATUS_CODE_201, message: MSG_RIDE_REQUESTED, data: ride });
    res.status(201).json({
      message: 'Ride request created',
      data: ride,
    });
  } catch (err) {
    console.error('Error in requestRide:', err);
    return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_500, message: MSG_ERROR });
    res.status(500).json({ message: err.message });
  }
};

// (Legacy) Accept ride — you said you’re not using this anymore
export const acceptRide = (io) => async (req, res) => {
  try {
    const driverId = req.user.id;
    const { ride_id } = req.body;

    const ride = await Ride.findOne({ _id: ride_id, status: 'requested' });
    if (!ride) return res.status(400).json({ message: 'Ride not available or already accepted' });

    ride.driver_id = driverId;
    ride.status = 'confirmed';
    await ride.save();

    const payload = buildRidePayload(ride);
    // If you want: emitToCustomer(io, ride.customer_id, 'ride_confirmed', payload);
    emitToDrivers(io, 'ride_confirmed', payload);

    console.log('Emitted ride_confirmed');

    res.status(200).json({
      message: 'Ride accepted',
      data: ride,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** Single status endpoint: requested -> confirmed -> ongoing -> completed */
export const updateRideStatus = (io) => async (req, res) => {
  try {
    // get the rideId
    const { id: rideId } = req.params;
    // get the ride status
    const { status } = req.body; // 'confirmed' | 'ongoing' | 'completed'
    const userId = req.user?.id;
    const role = req.user?.role;

    const allowedTargets = ['confirmed', 'ongoing', 'completed'];
    if (!allowedTargets.includes(status)) {
      return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_400, message: MSG_INVALID_STATUS_TRANSITION });
      // return res.status(400).json({ message: 'Invalid status' });
    }

    // Atomic transition plans
    const plans = {
      confirmed: {
        requireDriver: true,
        query: { _id: rideId, status: 'requested' },
        update: { $set: { status: 'confirmed', driver_id: userId, confirmed_time: new Date() } },
        event: 'ride_confirmed',
      },
      ongoing: {
        requireDriver: true,
        query: { _id: rideId, status: 'confirmed', driver_id: userId },
        update: { $set: { status: 'ongoing', pickup_time: new Date() } },
        event: 'ride_ongoing',
      },
      completed: {
        requireDriver: true,
        query: { _id: rideId, status: 'ongoing', driver_id: userId },
        update: { $set: { status: 'completed', dropoff_time: new Date() } },
        event: 'ride_completed',
      },
    };

    const plan = plans[status];
    if (plan.requireDriver && role !== 'driver') {
      return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_403, message: MSG_DRIVER_ACCESS_REQUIRED });
      return res.status(403).json({ message: 'Driver access required' });
    }

    // Try to perform the transition atomically
    let ride = await Ride.findOneAndUpdate(plan.query, plan.update, { new: true });

    if (!ride) {
      // find existing ride
      const existing = await Ride.findById(rideId);
      if (!existing) {
        return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_404, message: MSG_RIDE_NOT_FOUND });
        // return res.status(404).json({ message: 'Ride not found' });
      }

      const sameDriver = String(existing.driver_id || '') === String(userId || '');
      if (existing.status === status && sameDriver) {
        return SuccessResponse(res,{ success: true, statusCode: STATUS_CODE_200, message: MSG_SUCCESS, data: existing });
        // return res.status(200).json({ message: `Ride ${status}`, data: existing });
      }

      if (status === 'confirmed') {
        if (existing.status !== 'requested') {
          return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_403, message: MSG_RIDE_ALREADY_ACCEPTED });
          // return res.status(409).json({ message: 'Ride already accepted by another driver' });
        }
      } else if (status === 'ongoing') {
        if (existing.status !== 'confirmed') {
          return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_400, message: MSG_INVALID_STATUS_TRANSITION });
          // return res.status(400).json({ message: `Cannot change status from "${existing.status}" to "ongoing"` });
        }
        if (!sameDriver) return res.status(403).json({ message: 'Not your ride' });
      } else if (status === 'completed') {
        if (existing.status !== 'ongoing') {
          return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_400, message: MSG_INVALID_STATUS_TRANSITION });
          // return res.status(400).json({ message: `Cannot change status from "${existing.status}" to "completed"` });
        }
        if (!sameDriver) {
          return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_403, message: MSG_NOT_YOUR_RIDE });
          // return res.status(403).json({ message: 'Not your ride' });
        }
      }
      return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_409, message: MSG_RIDE_UPDATE_CONFLICT });
      // return res.status(409).json({ message: 'Ride update conflict' });
    }

    // Success: broadcast to drivers and the specific customer
    const payload = buildRidePayload(ride);
    emitToDrivers(io, plan.event, payload);
    emitToCustomer(io, ride.customer_id, plan.event, payload);

    // Optional: when confirmed, also tell drivers it’s taken
    if (status === 'confirmed') {
      emitToDrivers(io, 'ride_taken', { ride_id: ride._id, driver_id: ride.driver_id });
    }
    return SuccessResponse(res,{ success: true, statusCode: STATUS_CODE_200, message: MSG_SUCCESS, data: ride });
    // return res.status(200).json({ message: `Ride ${status}`, data: ride });
  } catch (err) {
    console.error('Error in updateRideStatus:', err);
    return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_500, message: MSG_ERROR });
    // res.status(500).json({ message: err.message });
  }
};

// controllers/rideController.js
export const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    res.status(200).json({ data: ride });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


// Get Driver's Ride History
export const getRideHistory = async (req, res) => {
  try {
    // get driver id from req.user set by authenticate middleware
    const user = req?.user;
    let rides;
    // for driver
    if (user.role == 'driver') {
      // Get rides for this driver
      rides = await Ride.find({ driver_id: user?.id }).populate('customer_id', 'first_name last_name').sort({ date: -1 });
    }
    // for customer
    else if (user.role == 'customer') {
      // Get rides for this customer
      rides = await Ride.find({ customer_id: user?.id }).populate('driver_id', 'first_name last_name car_name car_number').sort({ date: -1 });
    }
    else {
      return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_400, message: MSG_INVALID_USER_ROLE });
    }
    return SuccessResponse(res,{ success: true, statusCode: STATUS_CODE_200, message: MSG_SUCCESS, data: rides });
    // res.status(200).json({ data: rides });
  } catch (err) {
    console.error('Error in getRideHistory:', err);
    return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_500, message: MSG_ERROR });
    // res.status(500).json({ error: err.message });
  }
}
