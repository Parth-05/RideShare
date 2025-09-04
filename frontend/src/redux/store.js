import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import rideReducer from './slices/rideSlice';
import { ridesApi } from './api/ridesApi';
import { setupListeners } from '@reduxjs/toolkit/query';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ride: rideReducer,
    [ridesApi.reducerPath]: ridesApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(ridesApi.middleware),
});

setupListeners(store.dispatch);
