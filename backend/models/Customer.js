import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  first_name: {type: String, required: true},
  last_name: {type: String},
  address: {type: String},
  city: {type: String},
  state: {type: String},
  zip_code: {type: String, match: /^[0-9]{5}$/},
  phone: {type: String, required: true, match: /^[0-9]{10}$/},
  email: { type: String, required: true, unique: true, lowercase: true, match: /^\S+@\S+\.\S+$/ },
  password: {
  type: String,
  required: true,
  minlength: 6
},
  credit_card: {
    last4: String,
    provider: String
  },
  rating: {type: Number, default: 5, min: 1, max: 5},
  reviews: [{
    driver_id: String,
    text: String,
    rating: Number,
    date: Date
  }],
  rides: [String]
});

export const Customer = mongoose.model('Customer', customerSchema);