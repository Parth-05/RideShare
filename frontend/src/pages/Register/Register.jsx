import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/axiosInstance';
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Phone,
  Home,
  MapPin,
  Hash,
  CreditCard,
  Car,
  Gauge,
  Eye,
  EyeOff,
} from 'lucide-react';
import './Register.css';

const RegisterPage = () => {
  // ✅ JS version (no TS generic here)
  const [role, setRole] = useState('customer');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

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
    car_number: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

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
      phone: formData.phone,
    };

    if (role === 'customer') {
      payload.credit_card = formData.credit_card;
    } else if (role === 'driver') {
      payload.car_name = formData.car_name;
      payload.car_type = formData.car_type;
      payload.car_number = formData.car_number;
    }

    try {
      await api.post(`${role}s/register`, payload);
      alert('Registration successful!');
      navigate(`/${role}/profile`);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Registration failed';
      setErr(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-4 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Create your account</h1>
                <p className="text-white/90 text-sm">Join RideSphere in seconds</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Role tabs */}
            <div className="mb-5 grid grid-cols-2 rounded-xl border border-slate-200 p-1">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
                  role === 'customer'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="h-4 w-4" /> Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('driver')}
                className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
                  role === 'driver'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Car className="h-4 w-4" /> Driver
              </button>
            </div>

            {err && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </div>
            )}

            {/* Shared fields */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* First & Last name */}
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="First Name"
                  required
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Last Name"
                  required
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Email */}
              <div className="relative md:col-span-1">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Password with toggle */}
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Phone */}
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  required
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Address */}
              <div className="relative md:col-span-2">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Home className="h-4 w-4" />
                </div>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                  required
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* City / State / Zip */}
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Hash className="h-4 w-4" />
                </div>
                <input
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  placeholder="Zip Code"
                  required
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Role-specific fields */}
            {role === 'customer' && (
              <div className="mt-4">
                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <input
                    name="credit_card"
                    value={formData.credit_card}
                    onChange={handleChange}
                    placeholder="Credit Card"
                    required
                    className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {role === 'driver' && (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="relative md:col-span-1">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Car className="h-4 w-4" />
                  </div>
                  <input
                    name="car_name"
                    value={formData.car_name}
                    onChange={handleChange}
                    placeholder="Car Name"
                    required
                    className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="relative md:col-span-1">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Gauge className="h-4 w-4" />
                  </div>
                  <select
                    name="car_type"
                    value={formData.car_type}
                    onChange={handleChange}
                    required
                    className="w-full appearance-none rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Car Type</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="XL">XL</option>
                  </select>
                </div>

                <div className="relative md:col-span-1">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Hash className="h-4 w-4" />
                  </div>
                  <input
                    name="car_number"
                    value={formData.car_number}
                    onChange={handleChange}
                    placeholder="Car Number"
                    required
                    className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Creating account…' : 'Register'}
            </button>

            <p className="mt-4 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <span
                onClick={() => navigate('/login')}
                className="cursor-pointer font-medium text-indigo-600 hover:underline"
              >
                Login
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
