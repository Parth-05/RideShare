import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, logoutCustomer } from '../../redux/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const CustomerProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logoutCustomer());
    navigate('/login');
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-[#1E3A8A]">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center px-4 py-12">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md border border-[#E2E8F0]">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#1E3A8A]">Your Profile</h1>

        <div className="space-y-4">
          <div>
            <p className="text-[#64748B]">Name</p>
            <p className="font-semibold text-[#1E3A8A]">{user.first_name} {user.last_name}</p>
          </div>

          <div>
            <p className="text-[#64748B]">Email</p>
            <p className="font-semibold text-[#1E3A8A]">{user.email}</p>
          </div>

          <div>
            <p className="text-[#64748B]">Phone</p>
            <p className="font-semibold text-[#1E3A8A]">{user.phone}</p>
          </div>

          <div>
            <p className="text-[#64748B]">City</p>
            <p className="font-semibold text-[#1E3A8A]">{user.city}</p>
          </div>

          <div>
            <p className="text-[#64748B]">State</p>
            <p className="font-semibold text-[#1E3A8A]">{user.state}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-[#2563EB] text-white mt-8 py-2 rounded-lg hover:bg-[#1D4ED8] transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default CustomerProfile;
