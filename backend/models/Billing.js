import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema({
  ride_id: String,
  date: Date,
  pickup_time: Date,
  dropoff_time: Date,
  distance_km: Number,
  total_amount: Number,
  predicted_amount: Number,
  source: String,
  destination: String,
  driver_id: String,
  customer_id: String
});

export const Billing = mongoose.model('Billing', billingSchema);
