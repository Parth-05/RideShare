import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
  pickup: {
    lat: Number,
    lng: Number
  },
  dropoff: {
    lat: Number,
    lng: Number
  },
  datetime: Date,
  customer_id: String,
  driver_id: String,
  billing_id: String
});

export const Ride = mongoose.model('Ride', rideSchema);
