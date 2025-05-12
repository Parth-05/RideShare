import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import CustomerProfile from './pages/Customer/CustomerProfile';
// import other pages like CustomerRegister, DriverRegister, Login

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Add these later */}
        <Route path="/register" element={<Register />} />
        {/* <Route path="/register/driver" element={<DriverRegister />} /> */}
        <Route path="/login" element={<Login />} /> 
        <Route path="/customer/profile" element={<CustomerProfile />} /> 
      </Routes>
    </Router>
  );
}

export default App;
