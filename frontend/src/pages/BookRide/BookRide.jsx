import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  ZoomControl,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { requestRide } from '../../redux/ride/rideSlice';
import io from 'socket.io-client';
import {
  Car,
  MapPin,
  LocateFixed,
  Route,
  Clock3,
  DollarSign,
  AlertCircle,
  Loader2,
} from 'lucide-react';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const MapFlyTo = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 14, { animate: true, duration: 1.2 });
    }
  }, [position, map]);
  return null;
};

// RoutingMachine (safe mount/unmount)
const RoutingMachine = ({ from, to }) => {
  const map = useMap();
  const ctrlRef = useRef(null);

  useEffect(() => {
    if (!from || !to) return;

    const control = L.Routing.control({
      waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
      router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
      lineOptions: { styles: [{ color: '#4F46E5', weight: 5, opacity: 0.9 }] },
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,
      createMarker: () => null,
    }).addTo(map);

    ctrlRef.current = control;

    return () => {
      try {
        if (ctrlRef.current) {
          map.removeControl(ctrlRef.current);
          ctrlRef.current = null;
        }
      } catch (e) {
        console.warn('RoutingMachine cleanup issue:', e);
      }
    };
  }, [from, to, map]);

  return null;
};

const NominatimSearchInput = ({ placeholder, onSelect, disabled }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const search = async (value) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        value
      )}&format=json&addressdetails=1&limit=5`;
      const res = await fetch(url);
      const data = await res.json();
      setResults(data);
    } catch (e) {
      setResults([]);
    }
  };

  useEffect(() => {
    if (disabled) return;
    if (query.length > 2) {
      const timeout = setTimeout(() => search(query), 300);
      return () => clearTimeout(timeout);
    } else {
      setResults([]);
    }
  }, [query, disabled]);

  return (
    <div className="mb-3 w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          disabled={disabled}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
        />
      </div>

      {results.length > 0 && !disabled && (
        <ul className="mt-1 max-h-40 overflow-y-auto border border-gray-200 bg-white rounded-md shadow text-sm">
          {results.map((r) => (
            <li
              key={r.place_id}
              onClick={() => {
                setQuery(r.display_name);
                setResults([]);
                onSelect({
                  lat: parseFloat(r.lat),
                  lng: parseFloat(r.lon),
                  display: r.display_name,
                });
              }}
              className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Socket
const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
const socket = io(SOCKET_SERVER_URL, { withCredentials: true });

const BookRide = () => {
  const dispatch = useDispatch();
  const { currentRide, loading, error } = useSelector((state) => state.ride);

  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [carType, setCarType] = useState('Standard');
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [distanceMiles, setDistanceMiles] = useState(null);
  const [etaMins, setEtaMins] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [driverConfirmed, setDriverConfirmed] = useState(false);
  const [driverId, setDriverId] = useState(null);
  const [uiError, setUiError] = useState(null);
  const [pending, setPending] = useState(false); // local spinner for confirm

  // Geo-locate user for quick pickup
  const locateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPickup(p);
        setShowRoute(false);
        setUiError(null);
      },
      () => setUiError('Unable to access your location.')
    );
  };

  // socket listener
  useEffect(() => {
    const handler = (data) => {
      if (currentRide && data.ride_id === currentRide._id) {
        setDriverConfirmed(true);
        setDriverId(data.driver_id);
        setPending(false);
      }
    };
    socket.on('ride_confirmed', handler);
    return () => socket.off('ride_confirmed', handler);
  }, [currentRide]);

  const formattedStats = useMemo(() => {
    const parts = [];
    if (distanceMiles != null) parts.push(`${distanceMiles.toFixed(1)} mi`);
    if (etaMins != null) parts.push(`${Math.round(etaMins)} min`);
    if (estimatedPrice != null) parts.push(`$${Number(estimatedPrice).toFixed(2)}`);
    return parts.join(' · ');
  }, [distanceMiles, etaMins, estimatedPrice]);

  const handleConfirm = async () => {
    setUiError(null);

    if (!pickup || !dropoff) {
      setUiError('Please select both pickup and dropoff locations.');
      return;
    }

    setPending(true);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=false`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data?.routes?.[0]) throw new Error('No route found');

      const meters = data.routes[0].distance;
      const seconds = data.routes[0].duration;
      const miles = meters / 1609.34;
      const mins = seconds / 60;
      setDistanceMiles(miles);
      setEtaMins(mins);

      // price from FastAPI
      const now = new Date();
      const pick_hour = now.getHours();
      const pick_day = now.getDate();

      const predictRes = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip_distance: miles, pick_hour, pick_day }),
      });
      const predictData = await predictRes.json();
      let price = Number(predictData?.predicted_price ?? 0);

      if (carType === 'SUV') price += 3;
      if (carType === 'Van') price += 5;

      setEstimatedPrice(price);

      // dispatch ride request
      dispatch(
        requestRide({
          pickup_latitude: pickup.lat,
          pickup_longitude: pickup.lng,
          dropoff_latitude: dropoff.lat,
          dropoff_longitude: dropoff.lng,
        })
      );

      setShowRoute(true);
    } catch (e) {
      console.error('Error requesting ride:', e);
      setUiError('Could not calculate route or price. Please try again.');
      setPending(false);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <MapContainer
        center={[37.7749, -122.4194]}
        zoom={13}
        zoomControl={false}
        scrollWheelZoom={true}
        className="absolute inset-0 z-0"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {pickup && <Marker position={pickup} icon={pickupIcon} />}
        {dropoff && <Marker position={dropoff} icon={dropoffIcon} />}
        {pickup && <MapFlyTo position={pickup} />}
        {dropoff && <MapFlyTo position={dropoff} />}
        {pickup && dropoff && showRoute && (
          <RoutingMachine
            key={`${pickup?.lat}-${pickup?.lng}-${dropoff?.lat}-${dropoff?.lng}`}
            from={pickup}
            to={dropoff}
          />
        )}
        <ZoomControl position="bottomright" />
      </MapContainer>

      {/* Floating Panel */}
      <div className="absolute top-24 left-6 w-[22rem] md:w-[26rem] bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl p-6 z-10">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Car className="h-5 w-5 text-indigo-600" />
            Book a Ride
          </h2>
          <button
            onClick={locateMe}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <LocateFixed className="h-4 w-4" />
            My location
          </button>
        </div>

        {/* Search inputs */}
        <div className="space-y-3">
          <NominatimSearchInput
            placeholder="Enter pickup location"
            disabled={pending || loading}
            onSelect={(val) => {
              setPickup(val);
              setShowRoute(false);
            }}
          />
          <NominatimSearchInput
            placeholder="Enter dropoff location"
            disabled={pending || loading}
            onSelect={(val) => {
              setDropoff(val);
              setShowRoute(false);
            }}
          />
        </div>

        {/* Car Type Selector */}
        <div className="mt-4 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Car Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { type: 'Standard', emoji: '🚗', label: '1–4' },
              { type: 'SUV', emoji: '🚙', label: '1–6' },
              { type: 'Van', emoji: '🚌', label: '1–8' },
            ].map((car) => {
              const active = carType === car.type;
              return (
                <button
                  key={car.type}
                  onClick={() => setCarType(car.type)}
                  disabled={pending || loading}
                  className={`flex flex-col items-center justify-center rounded-xl px-3 py-3 text-sm font-medium border transition ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-700'
                      : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                  } ${pending || loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <span className="text-xl leading-none">{car.emoji}</span>
                  <span className="mt-1">{car.type}</span>
                  <span className={`text-xs ${active ? 'text-indigo-100' : 'text-slate-500'}`}>
                    {car.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        {(distanceMiles != null || etaMins != null || estimatedPrice != null) && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
              <Route className="mx-auto mb-1 h-4 w-4 text-indigo-600" />
              <div className="text-sm font-semibold text-slate-800">
                {distanceMiles != null ? `${distanceMiles.toFixed(1)} mi` : '—'}
              </div>
              <div className="text-xs text-slate-500">Distance</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
              <Clock3 className="mx-auto mb-1 h-4 w-4 text-indigo-600" />
              <div className="text-sm font-semibold text-slate-800">
                {etaMins != null ? `${Math.round(etaMins)} min` : '—'}
              </div>
              <div className="text-xs text-slate-500">ETA</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
              <DollarSign className="mx-auto mb-1 h-4 w-4 text-indigo-600" />
              <div className="text-sm font-semibold text-slate-800">
                {estimatedPrice != null ? `$${Number(estimatedPrice).toFixed(2)}` : '—'}
              </div>
              <div className="text-xs text-slate-500">Price</div>
            </div>
          </div>
        )}

        {/* Errors */}
        {(uiError || error) && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <span>{uiError || error}</span>
          </div>
        )}

        {/* Action */}
        <button
          onClick={handleConfirm}
          disabled={pending || loading || driverConfirmed}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {pending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Requesting…
            </>
          ) : driverConfirmed ? (
            'Driver Confirmed!'
          ) : (
            'Confirm Ride'
          )}
        </button>

        {driverConfirmed && (
          <div className="mt-3 text-center text-green-700 font-semibold">
            🎉 Your driver has accepted! Driver ID: {driverId}
          </div>
        )}

        {/* Footer line with compact stats */}
        {formattedStats && (
          <div className="mt-3 text-center text-xs text-slate-500">{formattedStats}</div>
        )}
      </div>
    </div>
  );
};

export default BookRide;
