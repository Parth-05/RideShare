import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Driver } from '../models/Driver.js';
import dotenv from 'dotenv';

// api response
import { SuccessResponse, ErrorResponse } from '../utils/apiResponse.js';
import { MSG_DRIVER_EXISTS, MSG_DRIVER_NOT_FOUND, MSG_ERROR, MSG_LOGGED_OUT, MSG_INVALID_CREDENTIALS, MSG_SUCCESS, STATUS_CODE_200, STATUS_CODE_201, STATUS_CODE_400, STATUS_CODE_401, STATUS_CODE_404, STATUS_CODE_409, STATUS_CODE_500, MSG_EMAIL_ALREADY_IN_USE } from '../constants/apiResponseConstants.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Register a new driver
export const registerDriver = async (req, res) => {
  try {
    // Extract driver details from request body
    const { email, password, ...rest } = req.body;
    // Check if driver already exists
    const existing = await Driver.findOne({ email });
    // if exists, return conflict error
    if (existing) {
      return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_409, message: MSG_DRIVER_EXISTS });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new driver
    const driver = await Driver.create({
      email,
      password: hashedPassword,
      ...rest
    });

    // Generate JWT token for driver
    const token = jwt.sign(
      { id: driver._id, role: 'driver' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set token in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    const { password: storedPassword, ...driverDetails } = driver._doc;

    return SuccessResponse(res,{ success: true, statusCode: STATUS_CODE_201, message: MSG_SUCCESS, data: driverDetails });
  } catch (err) {
    console.error("Error in registerDriver: ", err);
    return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_500, message: MSG_ERROR });
  }
};

// Login an existing driver
export const loginDriver = async (req, res) => {
  try {
    // get email and password from req.body
    const { email, password } = req.body;

    // find driver by email
    const driver = await Driver.findOne({ email });
    // if not found, return error
    if (!driver) {
      return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_400, message: MSG_DRIVER_NOT_FOUND });
    }

    // compare password
    const valid = await bcrypt.compare(password, driver.password);
    // if not valid, return error
    if (!valid) {
      return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_401, message: MSG_INVALID_CREDENTIALS });
    }

    // Generate JWT token for driver
    const token = jwt.sign(
      { id: driver._id, role: 'driver' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set token in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    const { password: storedPassword, ...driverDetails } = driver._doc;
    return SuccessResponse(res,{ success: true, statusCode: STATUS_CODE_200, message: MSG_SUCCESS, data: driverDetails });
  } catch (err) {
    console.error("Error in loginDriver: ", err);
    return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_500, message: MSG_ERROR });
  }
};

// Protected route
export const getDriverProfile = async (req, res) => {
  try {
    // find driver by id from req.user set by auth middleware
    const driver = await Driver.findById(req.user.id).select('-password');
    // if driver not found
    if (!driver) {
      return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_404, message: MSG_DRIVER_NOT_FOUND });
    }
    // return driver profile
    return SuccessResponse(res,{ success: true, statusCode: STATUS_CODE_200, message: MSG_SUCCESS, data: {role: 'driver', driver} });
  } catch (err) {
    console.error('Error in getDriverProfile:', err);
    return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_500, message: MSG_ERROR });
  }
};

export const updateDriverProfile = async (req, res) => {
  try {
    const {email, password, ...rest} = req.body;
    const update = {...rest};

    // If email present, normalize up-front
    if (email !== null) {
      const normalizedEmail = String(email).trim().toLowerCase();
    // Check if the email is being used by someone else
    const existing = await Driver.findOne({
      email,
      _id: { $ne: req.user.id }, // ignore the current user's doc
    });
    // If email is taken
    if (existing) {
      return ErrorResponse(res, { success: false, statusCode: STATUS_CODE_400, message: MSG_EMAIL_ALREADY_IN_USE });
    }

    update.email = normalizedEmail;
  }

    // hash password
    if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    update.password = hashedPassword;
    }

    // find customer by id from req.user set by auth middleware
    const customer = await Driver.findByIdAndUpdate(
      req.user.id,
      { $set: update },
      { new: true, runValidators: true }
    ).select('-password');
    // if customer not found
    if (!customer) {
      return ErrorResponse(res, { success: false, statusCode: STATUS_CODE_404, message: MSG_CUSTOMER_NOT_FOUND });
    }
    return SuccessResponse(res, { success: true, statusCode: STATUS_CODE_200, message: MSG_SUCCESS, data: { role: 'customer', customer } });
  } catch (err) {
    console.error('Error in updateCustomerProfile:', err);
    return ErrorResponse(res, { success: false, statusCode: STATUS_CODE_500, message: MSG_ERROR });
  }
}

// controllers/driverController.js
export const getDriverPublic = async (req, res) => {
  try {
    const d = await Driver.findById(req.params.id)
      .select('first_name last_name phone car_name car_type car_number rating');
    if (!d) return res.status(404).json({ message: 'Driver not found' });
    res.status(200).json({ data: d });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// logout driver
export const logoutDriver = (req, res) => {
  // clear cookie
   res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  return SuccessResponse(res,{ success: true, statusCode: STATUS_CODE_200, message: MSG_LOGGED_OUT });
}