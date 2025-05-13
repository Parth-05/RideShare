import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/axiosInstance';

// =================== CUSTOMER ===================

// Fetch Customer Profile
export const fetchCustomerProfile = createAsyncThunk('auth/fetchCustomerProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/customers/profile');
    return res.data.customer;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch customer profile');
  }
});

// Login Customer
export const loginCustomer = createAsyncThunk('auth/loginCustomer', async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await api.post('/customers/login', { email, password });
    return res.data.customer;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Login failed');
  }
});

// Logout Customer
export const logoutCustomer = createAsyncThunk('auth/logoutCustomer', async (_, { rejectWithValue }) => {
  try {
    await api.post('/customers/logout');
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Logout failed');
  }
});

// =================== DRIVER ===================

// Fetch Driver Profile
export const fetchDriverProfile = createAsyncThunk('auth/fetchDriverProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/drivers/profile');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch driver profile');
  }
});

// Login Driver
export const loginDriver = createAsyncThunk('auth/loginDriver', async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await api.post('/drivers/login', { email, password });
    return res.data.driver;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Login failed');
  }
});

// Logout Driver
export const logoutDriver = createAsyncThunk('auth/logoutDriver', async (_, { rejectWithValue }) => {
  try {
    await api.post('/drivers/logout');
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Logout failed');
  }
});

// =================== SLICE ===================

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
      // Customer Profile
      .addCase(fetchCustomerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...action.payload, role: 'customer' };
      })
      .addCase(fetchCustomerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Driver Profile
      .addCase(fetchDriverProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...action.payload, role: 'driver' };
      })
      .addCase(fetchDriverProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login Customer
      .addCase(loginCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...action.payload, role: 'customer' };
      })
      .addCase(loginCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login Driver
      .addCase(loginDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...action.payload, role: 'driver' };
      })
      .addCase(loginDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout Customer
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
      })

      // Logout Driver
      .addCase(logoutDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutDriver.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(logoutDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default authSlice.reducer;
