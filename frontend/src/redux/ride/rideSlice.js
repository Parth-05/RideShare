// store/ride/rideSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axiosInstance';

// Customer requests ride
export const requestRide = createAsyncThunk(
  'ride/requestRide',
  async (rideData, { rejectWithValue }) => {
    try {
      const res = await api.post('/rides/request', rideData);
      return res.data.data; // ride object
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ride request failed');
    }
  }
);

// (Legacy) Driver accepts ride via old route — optional to keep for back-compat
export const acceptRide = createAsyncThunk(
  'ride/acceptRide',
  async (rideId, { rejectWithValue }) => {
    try {
      const res = await api.post('/rides/accept', { ride_id: rideId });
      return res.data.data; // updated ride object
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Accept ride failed');
    }
  }
);

// Generic status updater (driver only): confirmed | ongoing | completed
export const updateRideStatus = createAsyncThunk(
  'ride/updateStatus',
  async ({ rideId, status }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/rides/${rideId}/status`, { status });
      return res.data.data; // updated ride
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Update status failed');
    }
  }
);

// Convenience wrappers (all call the single PATCH endpoint)
export const confirmRide = createAsyncThunk(
  'ride/confirmRide',
  async (rideId, { dispatch, rejectWithValue }) => {
    try {
      const a = await dispatch(updateRideStatus({ rideId, status: 'confirmed' }));
      if (updateRideStatus.rejected.match(a)) throw a.payload;
      return a.payload;
    } catch (e) {
      return rejectWithValue(e || 'Confirm ride failed');
    }
  }
);

export const startRide = createAsyncThunk(
  'ride/startRide',
  async (rideId, { dispatch, rejectWithValue }) => {
    try {
      const a = await dispatch(updateRideStatus({ rideId, status: 'ongoing' }));
      if (updateRideStatus.rejected.match(a)) throw a.payload;
      return a.payload;
    } catch (e) {
      return rejectWithValue(e || 'Start ride failed');
    }
  }
);

export const completeRide = createAsyncThunk(
  'ride/completeRide',
  async (rideId, { dispatch, rejectWithValue }) => {
    try {
      const a = await dispatch(updateRideStatus({ rideId, status: 'completed' }));
      if (updateRideStatus.rejected.match(a)) throw a.payload;
      return a.payload;
    } catch (e) {
      return rejectWithValue(e || 'Complete ride failed');
    }
  }
);

const rideSlice = createSlice({
  name: 'ride',
  initialState: {
    currentRide: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearRide: (state) => {
      state.currentRide = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Request Ride
      .addCase(requestRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestRide.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload;
      })
      .addCase(requestRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // (Legacy) Accept Ride
      .addCase(acceptRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptRide.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload;
      })
      .addCase(acceptRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Generic updateRideStatus covers confirm/start/complete
      .addCase(updateRideStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRideStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload;
      })
      .addCase(updateRideStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Convenience wrappers mirror the same final state (optional but nice)
      .addCase(confirmRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmRide.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload;
      })
      .addCase(confirmRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(startRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startRide.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload;
      })
      .addCase(startRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(completeRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeRide.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload;
      })
      .addCase(completeRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRide } = rideSlice.actions;
export default rideSlice.reducer;
