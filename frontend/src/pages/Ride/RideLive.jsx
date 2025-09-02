import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import io from 'socket.io-client';
import api from '../../services/axiosInstance';
import { Car, Phone, Hash, Gauge, CheckCircle2, Zap, Flag } from 'lucide-react';
import { fetchCustomerProfile } from '../../redux/auth/authSlice';

const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
  withCredentials: true,
});

/* Smooth camera */
const MapFlyTo = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 13, { animate: true, duration: 1 });
  }, [lat, lng, map]);
  return null;
};

/* Single-instance, safe Routing control (prevents _clearLines null errors) */
const Routing = ({ from, to }) => {
  const map = useMap();
  const ctrlRef = useRef(null);

  // Create once
  useEffect(() => {
    if (!map || ctrlRef.current) return;

    const ctrl = L.Routing.control({
      waypoints: [],
      router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      createMarker: () => null,
      lineOptions: { styles: [{ color: '#4F46E5', weight: 5 }] },
    }).addTo(map);

    const onRoutesFound = () => {
      if (!ctrlRef.current || !ctrlRef.current._map) return;
    };
    const onRoutingError = () => {};

    ctrl.on('routesfound', onRoutesFound);
    ctrl.on('routingerror', onRoutingError);

    ctrlRef.current = ctrl;

    // Cleanup on unmount only
    return () => {
      try {
        if (!ctrlRef.current) return;
        ctrlRef.current.off('routesfound', onRoutesFound);
        ctrlRef.current.off('routingerror', onRoutingError);
        try { ctrlRef.current.getPlan()?.setWaypoints([]); } catch {}
        try {
          const wps = ctrlRef.current.getWaypoints?.() || [];
          if (wps.length) ctrlRef.current.spliceWaypoints(0, wps.length);
        } catch {}
        if (map && ctrlRef.current._map) map.removeControl(ctrlRef.current);
      } catch {
        // ignore races
      } finally {
        ctrlRef.current = null;
      }
    };
  }, [map]);

  // Update waypoints without tearing down
  useEffect(() => {
    if (!ctrlRef.current) return;
    if (!from || !to) return;
    try {
      ctrlRef.current.setWaypoints([
        L.latLng(from.lat, from.lng),
        L.latLng(to.lat, to.lng),
      ]);
    } catch {
      // ignore mid-teardown
    }
  }, [from?.lat, from?.lng, to?.lat, to?.lng]);

  return null;
};

export default function RideLive() {
  const { id } = useParams(); // ride id
    const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: authUser } = useSelector((s) => s.auth);

  const [ride, setRide] = useState(null);
  const [driver, setDriver] = useState(null);
  const [status, setStatus] = useState('loading');

      // ensure we have the customer profile (for _id) once
  useEffect(() => {
    if (!authUser) {
      dispatch(fetchCustomerProfile?.()); // safe no-op if you already loaded it elsewhere
    }
  }, [authUser, dispatch]);

  // Join this customer's room so only they get their events
  useEffect(() => {
    if (authUser?._id) socket.emit('join_as_customer', authUser._id);
  }, [authUser?._id]);

  // Initial fetch (ride + driver if already set)
  useEffect(() => {
    (async () => {
      try {
        const r = await api.get(`/rides/${id}`).then((res) => res.data?.data);
        if (!r) return;
        setRide(r);
        setStatus(r.status);

        if (r.driver_id) {
          const d = await api.get(`/drivers/${r.driver_id}/public`).then((res) => res.data?.data);
          setDriver(d || null);
        }
      } catch {
        // ignore
      }
    })();
  }, [id]);

  // Live socket updates for this ride
  useEffect(() => {
    const onConfirmed = async (p) => {
      if (p.ride_id === id) {
        setStatus('confirmed');
        if (p.driver_id) {
          try {
            const d = await api.get(`/drivers/${p.driver_id}/public`).then((r) => r.data?.data);
            setDriver(d || null);
          } catch {}
        }
      }
    };
    const onOngoing = (p) => { if (p.ride_id === id) setStatus('ongoing'); };
    const onCompleted = (p) => { if (p.ride_id === id) setStatus('completed'); };

    socket.on('ride_confirmed', onConfirmed);
    socket.on('ride_ongoing', onOngoing);
    socket.on('ride_completed', onCompleted);
    return () => {
      socket.off('ride_confirmed', onConfirmed);
      socket.off('ride_ongoing', onOngoing);
      socket.off('ride_completed', onCompleted);
    };
  }, [id]);

  if (!ride) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="text-slate-600">Loading ride…</div>
      </div>
    );
  }

  const pickup = { lat: ride.pickup_latitude, lng: ride.pickup_longitude };
  const dropoff = { lat: ride.dropoff_latitude, lng: ride.dropoff_longitude };

  return (
    /* Fill the viewport area *below* a fixed navbar (h-16). */
    <div className="fixed inset-x-0 top-16 bottom-0">
      {/* Split screen: Map (left) | Details (right) */}
      <div className="grid h-full grid-cols-1 md:grid-cols-2">
        {/* Left: MAP fills its column */}
        <div className="relative">
          <MapContainer
            center={[pickup.lat, pickup.lng]}
            zoom={13}
            zoomControl={false}
            className="absolute inset-0"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[pickup.lat, pickup.lng]} />
            <Marker position={[dropoff.lat, dropoff.lng]} />
            <Routing from={pickup} to={dropoff} />
            <MapFlyTo lat={pickup.lat} lng={pickup.lng} />
            <ZoomControl position="bottomright" />
          </MapContainer>
        </div>

        {/* Right: DETAILS (scrollable) */}
        <div className="h-full overflow-y-auto border-l border-slate-200 bg-white p-6">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-800">Your Ride</h2>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                status === 'completed'
                  ? 'bg-emerald-100 text-emerald-700'
                  : status === 'ongoing'
                  ? 'bg-amber-100 text-amber-700'
                  : status === 'confirmed'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {status}
            </span>
          </div>

          {/* Driver card */}
          {driver ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700">
                  {(driver.first_name?.[0] || '') + (driver.last_name?.[0] || '') || 'D'}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {driver.first_name} {driver.last_name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {typeof driver.rating !== 'undefined' ? `⭐ ${driver.rating}` : '—'}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <Car className="h-4 w-4 text-indigo-600" />
                  <div className="text-sm">
                    {driver.car_name || '—'} • {driver.car_type || '—'}
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <Hash className="h-4 w-4 text-indigo-600" />
                  <div className="text-sm">{driver.car_number || '—'}</div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <Gauge className="h-4 w-4 text-indigo-600" />
                  <div className="text-sm">{driver.car_type || '—'}</div>
                </div>
                {driver.phone && (
                  <a
                    href={`tel:${driver.phone}`}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50"
                  >
                    <Phone className="h-4 w-4 text-indigo-600" />
                    <div className="text-sm">{driver.phone}</div>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              Waiting for driver details…
            </div>
          )}

          {/* Status legend */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-sm text-slate-700">
            <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-indigo-600" /> Confirmed
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
              <Zap className="h-4 w-4 text-amber-600" /> Ongoing
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
              <Flag className="h-4 w-4 text-emerald-600" /> Completed
            </div>
          </div>

          {/* Basic ride info */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <div>
              <span className="font-semibold text-slate-900">Ride ID:</span>{' '}
              <span className="font-mono">{ride._id}</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Pickup: {ride.pickup_latitude}, {ride.pickup_longitude}
              <br />
              Dropoff: {ride.dropoff_latitude}, {ride.dropoff_longitude}
            </div>
          </div>

          <button
            onClick={() => navigate('/book')}
            className="mt-4 w-full rounded-xl border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to booking
          </button>
        </div>
      </div>
    </div>
  );
}
