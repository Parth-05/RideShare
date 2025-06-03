import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import rideReducer from './ride/rideSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ride: rideReducer
  }
});
