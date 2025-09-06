import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import rideReducer from './slices/rideSlice';
import { ridesApi } from './api/ridesApi';
import { api } from './api/api';
import { setupListeners } from '@reduxjs/toolkit/query';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ride: rideReducer,
    // [ridesApi.reducerPath]: ridesApi.reducer
      [api.reducerPath]: api.reducer
  },
  middleware: (getDefaultMiddleware) =>
    // getDefaultMiddleware().concat(ridesApi.middleware),
      getDefaultMiddleware().concat(api.middleware)
});

setupListeners(store.dispatch);
