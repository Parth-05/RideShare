import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/axiosInstance';
import './Login.css'; // Reuse styles if needed

const LoginPage = () => {
  const [role, setRole] = useState('customer');
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post(`/${role}s/login`, credentials);
      alert('Login successful!');
      navigate(`/${role}/profile`);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] px-4 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white shadow-xl rounded-xl p-8 border border-[#E2E8F0]">
        <div className="flex bg-[#E2E8F0] overflow-hidden mb-6 w-full rounded-md">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`flex-1 py-2 font-medium ${role === 'customer' ? 'bg-[#1E3A8A] text-white' : 'text-[#64748B]'}`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('driver')}
            className={`flex-1 py-2 font-medium ${role === 'driver' ? 'bg-[#1E3A8A] text-white' : 'text-[#64748B]'}`}
          >
            Driver
          </button>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-4 text-[#1E3A8A]">Login as {role}</h2>

        <div className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
            className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
            className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#2563EB] text-white py-2 rounded-lg mt-6 hover:bg-[#1D4ED8] transition"
        >
          Login
        </button>

        <p className="text-sm text-center text-[#64748B] mt-4">
          Don’t have an account?{' '}
          <span onClick={() => navigate('/register')} className="text-[#2563EB] font-medium cursor-pointer hover:underline">
            Register
          </span>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
