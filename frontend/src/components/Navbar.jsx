import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';  // ✅ Correct import
import { logoutCustomer, logoutDriver, fetchCustomerProfile, fetchDriverProfile } from '../redux/auth/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const tokenEntry = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (tokenEntry && !user) {
      const token = tokenEntry.split('=')[1];

      try {
        const decoded = jwtDecode(token);  // ✅ Correct usage

        if (decoded.role === 'customer') {
          dispatch(fetchCustomerProfile());
        } else if (decoded.role === 'driver') {
          dispatch(fetchDriverProfile());
        }
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    if (user?.role === 'customer') {
      dispatch(logoutCustomer());
    } else if (user?.role === 'driver') {
      dispatch(logoutDriver());
    }
    navigate('/login');
  };

  const profilePath = user?.role === 'driver' ? '/driver/profile' : '/customer/profile';

  return (
    <nav className="bg-[#F1F5F9] border-b border-[#E2E8F0] px-6 py-3 shadow-sm flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-[#1E3A8A]">
        RideSphere
      </Link>

      <div className="flex items-center gap-6">

        {user && (
          <>
            <Link to={profilePath} className="text-[#1E3A8A] font-medium hover:underline">
              Profile
            </Link>

            {user.role === 'customer' && (
              <Link to="/customer/book-ride" className="text-[#1E3A8A] font-medium hover:underline">
                Book a Ride
              </Link>
            )}
          </>
        )}

        {user ? (
          <button
            onClick={handleLogout}
            className="bg-[#2563EB] text-white px-4 py-1.5 rounded-lg hover:bg-[#1D4ED8] transition"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-[#2563EB] text-white px-4 py-1.5 rounded-lg hover:bg-[#1D4ED8] transition"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
