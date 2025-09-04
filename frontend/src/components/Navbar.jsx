import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import { jwtDecode } from 'jwt-decode';
import {
  logoutCustomer,
  logoutDriver,
  // fetchCustomerProfile,
  // fetchDriverProfile,
} from '../redux/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, bootstrapStatus } = useSelector((state) => state.auth);
  const bootstrapping = bootstrapStatus === 'pending';

  // useEffect(() => {
  //   // Try to hydrate user from cookie token if we don't have one yet
  //   const tokenEntry = document.cookie
  //     .split('; ')
  //     .find((row) => row.startsWith('token='));
  //   if (tokenEntry && !user) {
  //     const token = decodeURIComponent(tokenEntry.split('=')[1] || '');
  //     try {
  //       const decoded = jwtDecode(token);
  //       const role = decoded?.role;
  //       if (role === 'customer') {
  //         dispatch(fetchCustomerProfile());
  //       } else if (role === 'driver') {
  //         dispatch(fetchDriverProfile());
  //       }
  //     } catch (err) {
  //       console.error('Invalid token:', err);
  //     }
  //   }
  // }, [dispatch, user]);

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
    <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/70 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold tracking-tight text-indigo-700">
          RideSphere
        </Link>

        <div className="flex items-center gap-4">
          {/* while bootstrapping, show a subtle placeholder */}
          {bootstrapping && (
            <div className="h-8 w-24 animate-pulse rounded-xl bg-slate-200" />
          )}
          {/* When logged in, show nav links */}
          {!bootstrapping && user && (
            <>
              <Link
                to={profilePath}
                className="text-slate-700 hover:text-slate-900 font-medium"
              >
                Profile
              </Link>
              {/* Customer */}
              {user.role === 'customer' && (
                <Link
                  to="/customer/book-ride"
                  className="text-slate-700 hover:text-slate-900 font-medium"
                >
                  Book a Ride
                </Link>
              )}
              {/* Driver */}
              {user.role === 'driver' && (
                <Link
                  to="/driver/dashboard"
                  className="text-slate-700 hover:text-slate-900 font-medium"
                >
                  Dashboard
                </Link>
              )}
            </>
          )}

          {/* Auth button */}
          {bootstrapping ? null : (
            user ? (
              <button
                onClick={handleLogout}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
              >
                Login
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
