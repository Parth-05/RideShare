import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode'
import api from '../../services/axiosInstance';


// export const bootstrapAuth = createAsyncThunk(
//   'auth/bootstrap',
//   async (_, { dispatch, rejectWithValue }) => {
//     try {
//       const tokenEntry = document.cookie.split('; ')
//         .find((row) => row.startsWith('token='));
//       if (!tokenEntry) return { role: null }; // no login, but bootstrap finished

//       const token = decodeURIComponent(tokenEntry.split('=')[1] || '');
//       const decoded = jwtDecode(token);
//       console.log(decoded)
//       const role = decoded?.role;

//       if (role === 'customer') {
//         const r = await dispatch(fetchCustomerProfile());
//         if (fetchCustomerProfile.rejected.match(r)) throw new Error(r.payload || 'Customer fetch failed');
//       } else if (role === 'driver') {
//         const r = await dispatch(fetchDriverProfile());
//         if (fetchDriverProfile.rejected.match(r)) throw new Error(r.payload || 'Driver fetch failed');
//       }
//       return { role: role ?? null };
//     } catch (e) {
//       return rejectWithValue(e.message || 'Bootstrap failed');
//     }
//   }
// );

export const bootstrapAuth = createAsyncThunk(
  'auth/bootstrap',
  async (_, { rejectWithValue }) => {
    try {
      // This request will include your cookie because axios has withCredentials: true
      const res = await api.get('/auth/me'); // -> { role: 'customer'|'driver', user: {...} }
      console.log(res)
      return { role: res.data?.role ?? null, user: res.data?.data ?? null };
    } catch (err) {
      if (err.response?.status === 401) {
        // not logged in; treat as a clean bootstrap finish
        return { role: null, user: null };
      }
      return rejectWithValue(err.response?.data?.error || 'Bootstrap failed');
    }
  }
);

export const selectAuthReady = (s) =>
  s.auth.bootstrapStatus === 'succeeded' || s.auth.bootstrapStatus === 'failed';

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
    error: null,
    bootstrapStatus: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
    bootstrapError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(bootstrapAuth.pending, (state) => {
        state.bootstrapStatus = 'pending';
        state.bootstrapError = null;
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.bootstrapStatus = 'succeeded';
        console.log(action)
        // <-- hydrate user here
        if (action.payload?.user && action.payload?.role) {
          state.user = { ...action.payload.user, role: action.payload.role };
        } else {
          state.user = null;
        }
      })
      .addCase(bootstrapAuth.rejected, (state, action) => {
        state.bootstrapStatus = 'failed';
        state.bootstrapError = action.payload || 'Bootstrap failed';
      })

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
