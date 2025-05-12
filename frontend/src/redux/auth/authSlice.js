import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axiosInstance';

// Fetch Profile from backend
export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/customers/profile');
    return res.data.customer;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch profile');
  }
});

// Login user (token is in httpOnly cookie)
export const loginCustomer = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await api.post('/customers/login', { email, password });
    return res.data.customer;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Login failed');
  }
});

// Logout user (clear cookie on backend)
export const logoutCustomer = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/customers/logout'); // Clear token cookie
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Logout failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logoutCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutCustomer.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(logoutCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default authSlice.reducer;
