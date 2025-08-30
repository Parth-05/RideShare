import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/axiosInstance";
import { Mail, Lock, UserCircle2, LogIn, User } from "lucide-react";

const LoginPage = () => {
  const [role, setRole] = useState("customer");
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/${role}s/login`, credentials);
      alert("Login successful!");
      navigate(`/${role}/profile`);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Login failed";
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-slate-200"
      >
        {/* Role toggle */}
        <div className="flex overflow-hidden mb-8 w-full rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={`flex-1 py-2 font-medium transition ${
              role === "customer"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setRole("driver")}
            className={`flex-1 py-2 font-medium transition ${
              role === "driver"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Driver
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-indigo-100 p-3">
            <UserCircle2 className="h-10 w-10 text-indigo-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">
          Login as <span className="text-indigo-600">{role}</span>
        </h2>

        <div className="space-y-4">
          <div className="flex items-center rounded-xl border border-slate-200 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
            <Mail className="h-5 w-5 text-slate-400 mr-2" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              onChange={handleChange}
              className="w-full outline-none text-slate-700"
            />
          </div>
          <div className="flex items-center rounded-xl border border-slate-200 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
            <Lock className="h-5 w-5 text-slate-400 mr-2" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              onChange={handleChange}
              className="w-full outline-none text-slate-700"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <LogIn className="h-5 w-5" /> Login
        </button>

        <p className="text-sm text-center text-slate-600 mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
