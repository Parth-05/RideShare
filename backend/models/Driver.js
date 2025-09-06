import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zip_code: { type: String, match: /^[0-9]{5}$/ },
    phone: { type: String, required: true, match: /^[0-9]{10}$/ },
    email: { type: String, required: true, unique: true, lowercase: true, match: /^\S+@\S+\.\S+$/ },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    car_name: {
        type: String,
        required: true,
        match: /^[a-zA-Z\s]+$/
    },
    car_type: {
        type: String,
        required: true,
        enum: ['Standard', 'Premium', 'XL'],
        default: 'Standard'
    },
    car_number: {
        type: String,
        required: true,
        // unique: true,
        match: /^[A-Z0-9\-]+$/
    },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    reviews: [{
        customer_id: String,
        text: String,
        rating: Number,
        date: Date
    }],
    media: {
        images: [String],
        video: String
    },
    rides: [String]
});

export const Driver = mongoose.model('Driver', driverSchema);
