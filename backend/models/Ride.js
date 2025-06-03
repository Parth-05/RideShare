// models/Ride.js
import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
  pickup_time: { type: Date, required: true },
  pickup_destination: { type: String, default: null }, // optional field for future use
  pickup_latitude: { type: Number, required: true },
  pickup_longitude: { type: Number, required: true },
  dropoff_destination: { type: String, default: null }, // optional field for future use
  dropoff_latitude: { type: Number, required: true },
  dropoff_longitude: { type: Number, required: true },
  dropoff_time: { type: Date, default: null },
  payment_id: { type: String }, // placeholder for future billing
  status: { 
    type: String, 
    enum: ['requested', 'confirmed', 'completed', 'cancelled'], 
    default: 'requested' 
  }
}, { timestamps: true });

export const Ride = mongoose.model('Ride', rideSchema);
