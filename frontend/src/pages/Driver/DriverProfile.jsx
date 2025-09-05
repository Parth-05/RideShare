import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDriverProfile, logoutDriver } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, Phone, MapPin, Car, Gauge, Hash, Star } from 'lucide-react';

// Reusable label/value row with an icon
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] p-3 bg-white/60">
    <div className="mt-0.5 rounded-lg bg-indigo-50 p-2 text-indigo-600">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-[#64748B]">{label}</p>
      <p className="truncate text-[#0F172A] font-medium">{value ?? '—'}</p>
    </div>
  </div>
);

// Small star rating renderer
const Rating = ({ value = 0 }) => {
  const rounded = Math.round(Number(value) || 0);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rounded ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
        />
      ))}
      <span className="ml-1 text-sm text-slate-600">{Number(value) || 0}</span>
    </div>
  );
};

const DriverProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      dispatch(fetchDriverProfile()); // unchanged
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logoutDriver()); // unchanged
    navigate('/login');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#F1F5F9] px-4">
        {/* simple skeleton */}
        <div className="w-full max-w-md animate-pulse space-y-4">
          <div className="h-40 rounded-2xl bg-slate-200" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-200" />
            ))}
          </div>
          <div className="h-11 rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header card */}
        <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xl">
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 px-6 pb-20 pt-8 text-white">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-2xl font-semibold">
                {initials || <User className="h-7 w-7" />}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold leading-tight">{fullName || 'Driver'}</h1>
                <p className="text-white/90">{user.email}</p>
              </div>
              <div className="ml-auto hidden sm:block">
                <div className="rounded-xl bg-white/10 px-3 py-2">
                  <p className="text-sm">Car</p>
                  <p className="text-sm font-semibold">
                    {user.car_name} • {user.car_type}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="-mt-14 px-6 pb-6">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoRow icon={Mail} label="Email" value={user.email} />
                <InfoRow icon={Phone} label="Phone" value={user.phone} />
                <InfoRow icon={MapPin} label="City" value={user.city} />
                <InfoRow icon={MapPin} label="State" value={user.state} />
                <InfoRow icon={Car} label="Car Name" value={user.car_name} />
                <InfoRow icon={Gauge} label="Car Type" value={user.car_type} />
                <InfoRow icon={Hash} label="Car Number" value={user.car_number} />
                <div className="flex items-stretch gap-3 rounded-xl border border-[#E2E8F0] p-3">
                  <div className="mt-0.5 rounded-lg bg-yellow-50 p-2 text-yellow-600">
                    <Star className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#64748B]">Rating</p>
                    <Rating value={user.rating} />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
                <div className="text-sm text-slate-500">Last updated just now</div>
                                <button
  onClick={() => navigate('/driver/ridehistory')}
  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
>
  <Car className="h-4 w-4" /> View Ride History
</button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>


              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
