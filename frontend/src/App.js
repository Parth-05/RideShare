import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import CustomerProfile from './pages/Customer/CustomerProfile';
import DriverProfile from './pages/Driver/DriverProfile';
import BookRide from './pages/BookRide/BookRide';
import Navbar from './components/Navbar';
import DriverDashboard from './pages/Driver/DriverDashboard';
import RideLive from './pages/Ride/RideLive';
import DriverRideHistory from './pages/Driver/DriverRideHistory';
import CustomerRideHistory from './pages/Customer/CustomerRideHistory';
import RequireAuth from './components/RequireAuth';

import { bootstrapAuth, selectAuthReady } from './redux/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';

const AuthGate = ({ children }) => {
  const dispatch = useDispatch();
  const ready = useSelector(selectAuthReady);

  useEffect(() => { dispatch(bootstrapAuth()); }, [dispatch]);

  if (!ready) {
    // minimal splash – prevents “Login” flicker
    return <div className="h-screen grid place-items-center text-slate-500">Loading…</div>;
  }
  return children;
};

function App() {
  return (
    <AuthGate>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/register/driver" element={<DriverRegister />} /> */}
          <Route path="/login" element={<Login />} />

          {/* Customer only page */}
          <Route path="/customer/profile" element={
            <RequireAuth allowed={['customer']}>
              <CustomerProfile />
            </RequireAuth>} />
          <Route path="/driver/profile" element={<DriverProfile />} />
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path='/customer/book-ride' element={<BookRide />} />
          <Route path='/driver/ridehistory' element={<DriverRideHistory />} />
          <Route path='/customer/ridehistory' element={<CustomerRideHistory />} />
          <Route path="/ride/:id" element={<RideLive />} />
        </Routes>
      </Router>
    </AuthGate>
  );
}

export default App;
