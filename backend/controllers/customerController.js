import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Customer } from '../models/Customer.js';
import dotenv from 'dotenv';

// api response
import { SuccessResponse, ErrorResponse } from '../utils/apiResponse.js';

// apiResponseConstants
import { 
  MSG_SUCCESS,
  MSG_ERROR, 
  MSG_INVALID_CREDENTIALS,
  MSG_CUSTOMER_NOT_FOUND,
  MSG_CUSTOMER_EXISTS,
  MSG_LOGGED_OUT,
  STATUS_CODE_200, 
  STATUS_CODE_201,
  STATUS_CODE_400,
  STATUS_CODE_401,
  STATUS_CODE_404, 
  STATUS_CODE_409, 
  STATUS_CODE_500
} from '../constants/apiResponseConstants.js';


dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Register a new customer
export const registerCustomer = async (req, res) => {
  try {
    // get email, password, and other details from req.body
    const { email, password, ...rest } = req.body;

    // check if customer already exists
    const existing = await Customer.findOne({ email });
    if (existing) {
      return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_409, message: MSG_CUSTOMER_EXISTS});
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new customer
    const customer = await Customer.create({
      email,
      password: hashedPassword,
      ...rest
    });

    // Sign JWT token after registration
    const token = jwt.sign(
      { id: customer._id, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set token in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',// HTTPS only in prod
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // cross-site
      maxAge: 60 * 60 * 1000 // 1 hour
    });
    const { password: storedPassword, ...customerDetails } = customer._doc;

    return SuccessResponse(res,{ success: true, statusCode: STATUS_CODE_201, message: MSG_SUCCESS, data: customerDetails});

  } catch (err) {
    // log the error for debugging
    console.error('Error in registerCustomer:', err);
    return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_500, message: MSG_ERROR });
  }
};

// Login an existing customer
export const loginCustomer = async (req, res) => {
  try {
    // Get customer email and password from req.body
    const { email, password } = req.body;
    // Find customer by email
    const customer = await Customer.findOne({ email });
    // If not found, return error
    if (!customer) {
      return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_400, message: MSG_CUSTOMER_NOT_FOUND });
    }

    // Compare password
    const valid = await bcrypt.compare(password, customer.password);
    // if not valid, return error
    if (!valid) {
      return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_401, message: MSG_INVALID_CREDENTIALS });
    }

    // Sign JWT token
    const token = jwt.sign(
      { id: customer._id, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set token in httpOnly cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // only over HTTPS in prod
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // cross-site in prod
    maxAge: 60 * 60 * 1000 // 1 hour
  });

    const { password: storedPassword, ...customerDetails } = customer._doc;
    // Return success response
    return SuccessResponse(res,{ success: true, statusCode: STATUS_CODE_200, message: MSG_SUCCESS, data: customerDetails });
  } catch (err) {
    console.error('Error in loginCustomer:', err);
    return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_500, message: MSG_ERROR });
  }
};

// Protected route
export const getCustomerProfile = async (req, res) => {
  try {
    // find customer by id from req.user set by auth middleware
    const customer = await Customer.findById(req.user.id).select('-password');
    // if customer not found
    if (!customer) {
      return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_404, message: MSG_CUSTOMER_NOT_FOUND });
    }
    // return customer profile
    return SuccessResponse(res,{ success: true, statusCode: STATUS_CODE_200, message: MSG_SUCCESS, data: {role: 'customer', customer} });
  } catch (err) {
    console.error('Error in getCustomerProfile:', err);
    return ErrorResponse(res,{ success: false, statusCode: STATUS_CODE_500, message: MSG_ERROR });
  }
};

// Logout the customer
export const logoutCustomer = (req, res) => {
  // Clear the token cookie
   res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  // Send response
  return SuccessResponse(res,{ success: true, statusCode: STATUS_CODE_200, message: MSG_LOGGED_OUT });
}
