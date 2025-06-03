// store/ride/rideSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axiosInstance';

// Request Ride (Customer requests ride)
export const requestRide = createAsyncThunk('ride/requestRide', async (rideData, { rejectWithValue }) => {
  try {
    const res = await api.post('/rides/request', rideData);
    return res.data.data; // ride object
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Ride request failed');
  }
});

// Accept Ride (Driver accepts ride)
export const acceptRide = createAsyncThunk('ride/acceptRide', async (rideId, { rejectWithValue }) => {
  try {
    const res = await api.post('/rides/accept', { ride_id: rideId });
    return res.data.data; // updated ride object
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Accept ride failed');
  }
});

const rideSlice = createSlice({
  name: 'ride',
  initialState: {
    currentRide: null,
    loading: false,
    error: null
  },
  reducers: {
    clearRide: (state) => {
      state.currentRide = null;
      state.error = null;
    }
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

      // Accept Ride
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
      });
  }
});

export const { clearRide } = rideSlice.actions;
export default rideSlice.reducer;
