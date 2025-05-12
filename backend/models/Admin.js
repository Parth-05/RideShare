import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  address: String,
  city: String,
  state: String,
  zip_code: String,
  phone: String,
  email: String
});

export const Admin = mongoose.model('Admin', adminSchema);

