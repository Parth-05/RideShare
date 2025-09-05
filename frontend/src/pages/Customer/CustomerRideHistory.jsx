// pages/RideHistory.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { useGetRideHistoryQuery } from '../../redux/api/ridesApi';
import { selectAuthReady } from '../../redux/slices/authSlice';

// Put this outside the component (optional micro-opt)
const Ellipsis = ({ text, className = '' }) => (
  <span
    title={text}
    className={`inline-block truncate whitespace-nowrap ${className}`}
  >
    {text}
  </span>
);

const CustomerRideHistory = () => {
  const authReady = useSelector(selectAuthReady);
  const user = useSelector((s) => s.auth.user);

  const {
    data,
    isLoading,
    error,
    isFetching,
    refetch,
  } = useGetRideHistoryQuery(undefined, {
    skip: !authReady || !user,
  });

  const rides = Array.isArray(data)
    ? [...data].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    : [];

  const handleRefresh = () => refetch();

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'confirmed': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'ongoing':   return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'requested': return 'bg-slate-100 text-slate-800 border-slate-200';
      default:          return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const placeText = (ride) => {
    const from = ride.pickup ?? '—';
    const to   = ride.destination ?? '—';
    return { from, to };
  };

  if (!authReady) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-4 py-8">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
              <h2 className="text-2xl font-bold text-white">Ride History</h2>
              <p className="text-indigo-100 mt-2">Your travel journey</p>
            </div>
            <div className="p-6 text-center">
              <div className="inline-flex items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                <p className="text-slate-600">Loading your rides...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-4 py-8">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6">
              <h2 className="text-2xl font-bold text-white">Ride History</h2>
              <p className="text-red-100 mt-2">Something went wrong</p>
            </div>
            <div className="p-6 text-center space-y-4">
              <div className="text-6xl">⚠️</div>
              <p className="text-slate-600">Error loading rides: {error.data?.message || error.message}</p>
              <button
                onClick={handleRefresh}
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (rides.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-4 py-8">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
              <h2 className="text-2xl font-bold text-white">Ride History</h2>
              <p className="text-indigo-100 mt-2">Your travel journey</p>
            </div>
            <div className="p-8 text-center space-y-4">
              <div className="text-6xl">🚗</div>
              <h3 className="text-xl font-semibold text-slate-800">No rides yet</h3>
              <p className="text-slate-600">No rides found for your account.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Header card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Ride History</h2>
                <p className="text-indigo-100 mt-2">{rides.length} total rides</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isFetching}
                className="rounded-xl bg-white/10 px-4 py-2 text-white font-medium hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                {isFetching ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Refreshing...
                  </>
                ) : (
                  <>🔄 Refresh</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Rides list */}
        <div className="space-y-4">
          {rides.map((ride) => {
            const { from, to } = placeText(ride);
            return (
              <div key={ride.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Main ride info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">🚗</div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-1 min-w-0">
                            <Ellipsis text={from} className="max-w-[7rem] sm:max-w-[12rem] md:max-w-[18rem]" />
                            <span className="mx-1">→</span>
                            <Ellipsis text={to} className="max-w-[7rem] sm:max-w-[12rem] md:max-w-[18rem]" />
                          </h3>
                          <p className="text-sm text-slate-500">
                            {new Date(ride.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status and price */}
                    <div className="flex flex-col items-end gap-3 ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ride.status)}`}>
                        {ride.status}
                      </span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-800">
                          {typeof ride.fare !== 'undefined' ? `$${Number(ride.fare).toFixed(2)}` : '—'}
                        </div>
                        <div className="text-sm text-slate-500">{ride.rideType || 'Standard'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Extra details – show only if present */}
                  {/* {(ride.distance || ride.duration) && (
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                      {ride.distance && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <span>📏</span>
                          <span>{ride.distance} miles</span>
                        </div>
                      )}
                      {ride.duration && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <span>⏱️</span>
                          <span>{ride.duration} min</span>
                        </div>
                      )}
                    </div>
                  )} */}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomerRideHistory;
