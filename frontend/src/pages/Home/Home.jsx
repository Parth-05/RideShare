import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#DBEAFE] to-[#E0E7FF] px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-[#1E3A8A] mb-6 text-center">
        Welcome to RideSphere
      </h1>
      <p className="text-lg text-[#64748B] text-center max-w-xl mb-10">
        Your seamless ride-sharing experience starts here. Register as a driver or customer to get on the road.
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        {/* <Link to="/register/customer">
          <button className="bg-[#2563EB] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1D4ED8] transition">
            Register as Customer
          </button>
        </Link> */}
        <Link to="/register">
          <button className="bg-[#2563EB] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#059669] transition">
            Register
          </button>
        </Link>
      </div>

      <p className="mt-8 text-[#64748B] text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-[#2563EB] hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default LandingPage;
