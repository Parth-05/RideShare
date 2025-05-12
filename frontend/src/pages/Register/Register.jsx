import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/axiosInstance';
import './Register.css';

const RegisterPage = () => {
  const [role, setRole] = useState('customer');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    credit_card: '',
    car_name: '',
    car_type: '',
    car_number: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      role,
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zip_code,
      phone: formData.phone
    };

    if (role === 'customer') {
      payload.credit_card = formData.credit_card;
    } else if (role === 'driver') {
      payload.car_name = formData.car_name;
      payload.car_type = formData.car_type;
      payload.car_number = formData.car_number;
    }

    try {
      const response = await api.post(`${role}s/register`, payload);
      alert('Registration successful!');
      navigate(`/${role}/profile`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      alert(errorMessage);
    }
  };

  const renderSharedFields = () => (
    <>
      {['first_name', 'last_name', 'address', 'city', 'state', 'zip_code', 'phone', 'email', 'password'].map((field) => (
        <input
          key={field}
          name={field}
          type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
          placeholder={field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          required
          onChange={handleChange}
          className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        />
      ))}
    </>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] px-4 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white rounded-xl shadow-xl p-8 border border-[#E2E8F0]">
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

        <h2 className="text-2xl font-semibold text-center mb-4 text-[#1E3A8A]">Register as {role}</h2>

        <div className="space-y-4">
          {renderSharedFields()}

          {role === 'customer' && (
            <input
              name="credit_card"
              placeholder="Credit Card"
              required
              onChange={handleChange}
              className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          )}

          {role === 'driver' && (
            <>
              <input
                name="car_name"
                placeholder="Car Name"
                required
                onChange={handleChange}
                className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
              <select
                name="car_type"
                required
                onChange={handleChange}
                className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="">Select Car Type</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="XL">XL</option>
              </select>
              <input
                name="car_number"
                placeholder="Car Number"
                required
                onChange={handleChange}
                className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </>
          )}
        </div>

        <button type="submit" className="w-full bg-[#2563EB] text-white py-2 rounded-lg mt-6 hover:bg-[#1D4ED8] transition">
          Register
        </button>

        <p className="text-sm text-center text-[#64748B] mt-4">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} className="text-[#2563EB] font-medium cursor-pointer hover:underline">
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
