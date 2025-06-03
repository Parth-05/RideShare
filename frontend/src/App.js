import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import CustomerProfile from './pages/Customer/CustomerProfile';
import DriverProfile from './pages/Driver/DriverProfile';
import BookRide from './pages/BookRide/BookRide';
import Navbar from './components/Navbar';
import DriverDashboard from './pages/Driver/DriverDashboard';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Add these later */}
        <Route path="/register" element={<Register />} />
        {/* <Route path="/register/driver" element={<DriverRegister />} /> */}
        <Route path="/login" element={<Login />} /> 
        <Route path="/customer/profile" element={<CustomerProfile />} /> 
        <Route path="/driver/profile" element={<DriverProfile />} />
        <Route path="/driver/dashboard" element={<DriverDashboard />} />  
        <Route path='/customer/book-ride' element={<BookRide />} />
      </Routes>
    </Router>
  );
}

export default App;
