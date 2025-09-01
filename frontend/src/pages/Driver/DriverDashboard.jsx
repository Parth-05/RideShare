import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDriverProfile } from '../../redux/auth/authSlice';
import {
  confirmRide,     // NEW: PATCH -> confirmed
  startRide,       // NEW: PATCH -> ongoing
  completeRide,    // NEW: PATCH -> completed
} from '../../redux/ride/rideSlice';
import io from 'socket.io-client';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  XCircle,
  Loader2,
  ClipboardCopy,
  Car,
  PlayCircle,
  Flag,
} from 'lucide-react';

const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
const socket = io(SOCKET_SERVER_URL, { withCredentials: true });

const StatChip = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
    <Icon className="h-4 w-4 text-indigo-600" />
    <div className="text-sm">
      <div className="text-slate-500">{label}</div>
      <div className="font-semibold text-slate-800">{value ?? '—'}</div>
    </div>
  </div>
);

const Row = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white/70 p-3">
    <div className="mt-0.5 rounded-lg bg-indigo-50 p-2 text-indigo-600">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="truncate font-medium text-slate-900">{value}</p>
    </div>
  </div>
);

const DriverDashboard = () => {
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useSelector((s) => s.auth);
  const { currentRide, loading: rideLoading } = useSelector((s) => s.ride);

  const [incomingRide, setIncomingRide] = useState(null);
  const [rideStatus, setRideStatus] = useState(null); // 'confirmed' | 'ongoing' | 'completed' | null
  const [activeRide, setActiveRide] = useState(null); // { ride_id, pickup_*, dropoff_* }

  // Fetch driver profile
  useEffect(() => {
    if (!user) dispatch(fetchDriverProfile());
  }, [dispatch, user]);

  // Socket listeners
  useEffect(() => {
    socket.on('connect', () => {
      socket.emit('join_as_driver');
    });

    socket.on('new_ride_request', (data) => {
      // Only set if we don't already have an active/incoming ride
      if (!activeRide && !incomingRide) setIncomingRide(data);
    });

    socket.on('ride_confirmed', (data) => {
      if (user && data.driver_id === user._id) {
        setActiveRide((prev) => prev ?? data); // ensure we keep the coords from first payload
        setRideStatus('confirmed');
        setIncomingRide(null);
      }
    });

    socket.on('ride_ongoing', (data) => {
      if (user && data.driver_id === user._id) {
        setActiveRide((prev) => prev ?? data);
        setRideStatus('ongoing');
      }
    });

    socket.on('ride_completed', (data) => {
      if (user && data.driver_id === user._id) {
        setActiveRide((prev) => prev ?? data);
        setRideStatus('completed');
      }
    });

    return () => {
      socket.off('new_ride_request');
      socket.off('ride_confirmed');
      socket.off('ride_ongoing');
      socket.off('ride_completed');
      socket.off('connect');
    };
  }, [user, activeRide, incomingRide]);

  // Pretty coords
  const fmt = (n) => (n || n === 0 ? Number(n).toFixed(5) : '—');

  const headerStatus = useMemo(() => {
    if (rideStatus === 'completed') return 'Completed';
    if (rideStatus === 'ongoing') return 'On Trip';
    if (rideStatus === 'confirmed') return 'Assigned';
    if (incomingRide) return 'New Request';
    return 'Idle';
  }, [rideStatus, incomingRide]);

  const fullName =
    `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() ||
    user?.email ||
    'Driver';

  // === ACTIONS ===
  const handleAccept = async () => {
    if (!incomingRide) return;
    // Use unified status endpoint (confirm)
    dispatch(confirmRide(incomingRide.ride_id));
    // Let socket 'ride_confirmed' finalize UI, but we can optimistically reflect:
    setActiveRide(incomingRide);
    setRideStatus('confirmed');
    setIncomingRide(null);
  };

  const handleDecline = () => setIncomingRide(null);

  const handleStart = () => {
    const id = activeRide?.ride_id || currentRide?._id;
    if (!id) return;
    dispatch(startRide(id));
    // socket will flip to 'ongoing'
  };

  const handleComplete = () => {
    const id = activeRide?.ride_id || currentRide?._id;
    if (!id) return;
    dispatch(completeRide(id));
    // socket will flip to 'completed'
  };

  const working = authLoading || rideLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {/* Header card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 px-6 py-6 text-white">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/10 p-3">
                <Car className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold leading-tight">{fullName}</h1>
                <p className="text-white/90">{user?.email}</p>
              </div>
              <div className="ml-auto hidden sm:block">
                <div className="rounded-xl bg-white/10 px-3 py-2 text-sm">
                  <div>Vehicle</div>
                  <div className="font-semibold">
                    {user?.car_name || '—'} • {user?.car_type || '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* quick stats */}
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
            <StatChip icon={Car} label="Car Number" value={user?.car_number || '—'} />
            <StatChip icon={Navigation} label="Status" value={headerStatus} />
            <StatChip icon={ClipboardCopy} label="Driver ID" value={user?._id?.slice(-6)} />
          </div>
        </div>

        {/* Body */}
        {working && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-md">
            <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <div className="font-medium text-slate-800">Working…</div>
            <div className="text-sm text-slate-600">Please wait a moment.</div>
          </div>
        )}

        {!working && rideStatus === 'ongoing' && activeRide && (
          <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Ongoing Ride</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                IN PROGRESS
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Row
                icon={MapPin}
                label="Pickup"
                value={`${fmt(activeRide.pickup_latitude)}, ${fmt(activeRide.pickup_longitude)}`}
              />
              <Row
                icon={MapPin}
                label="Dropoff"
                value={`${fmt(activeRide.dropoff_latitude)}, ${fmt(activeRide.dropoff_longitude)}`}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={handleComplete}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <Flag className="h-5 w-5" /> Complete Ride
              </button>
              <div className="flex items-center justify-center gap-2 text-emerald-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Ride in progress…</span>
              </div>
            </div>
          </div>
        )}

        {!working && rideStatus === 'confirmed' && activeRide && (
          <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-700">
                <Navigation className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Assigned Ride</h2>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                CONFIRMED
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Row
                icon={MapPin}
                label="Pickup"
                value={`${fmt(activeRide.pickup_latitude)}, ${fmt(activeRide.pickup_longitude)}`}
              />
              <Row
                icon={MapPin}
                label="Dropoff"
                value={`${fmt(activeRide.dropoff_latitude)}, ${fmt(activeRide.dropoff_longitude)}`}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-500">
                Ride ID:&nbsp;
                <span className="font-mono text-slate-700">{activeRide.ride_id}</span>
              </div>
              <button
                onClick={handleStart}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <PlayCircle className="h-5 w-5" /> Start Ride
              </button>
            </div>
          </div>
        )}

        {!working && !rideStatus && incomingRide && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-700">
                <Navigation className="h-5 w-5" />
                <h2 className="text-lg font-semibold">New Ride Request</h2>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                REQUESTED
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Row
                icon={MapPin}
                label="Pickup"
                value={`${fmt(incomingRide.pickup_latitude)}, ${fmt(incomingRide.pickup_longitude)}`}
              />
              <Row
                icon={MapPin}
                label="Dropoff"
                value={`${fmt(incomingRide.dropoff_latitude)}, ${fmt(incomingRide.dropoff_longitude)}`}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={handleDecline}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <XCircle className="h-5 w-5" /> Decline
              </button>
              <button
                onClick={handleAccept}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <CheckCircle2 className="h-5 w-5" /> Accept
              </button>
            </div>
          </div>
        )}

        {!working && !rideStatus && !incomingRide && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-md">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Navigation className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Waiting for ride requests…</h3>
            <p className="mt-1 text-sm text-slate-600">
              Keep this tab open. You’ll get a prompt here when a new ride comes in.
            </p>
          </div>
        )}

        {!working && rideStatus === 'completed' && activeRide && (
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-md">
            <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Flag className="h-6 w-6" />
            </div>
            <div className="font-semibold text-emerald-700">Ride completed</div>
            <div className="mt-1 text-sm text-slate-600">
              Ride ID: <span className="font-mono">{activeRide.ride_id}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
