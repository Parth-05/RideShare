import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { fetchCustomerProfile } from '../../redux/auth/authSlice';
import io from 'socket.io-client';
import api from '../../services/axiosInstance';
import {
    Car,
    MapPin,
    LocateFixed,
    Route,
    Clock3,
    DollarSign,
    AlertCircle,
    Loader2,
    User,
    Phone,
    Gauge,
    Hash,
    Star,
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

// Small star rating display
const Stars = ({ value = 0 }) => {
    const v = Math.round(Number(value) || 0);
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`h-4 w-4 ${i < v ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                />
            ))}
            <span className="ml-1 text-xs text-slate-600">{Number(value) || 0}</span>
        </div>
    );
};

// Driver info card (shows after confirmed)
const DriverCard = ({ driver, loading }) => {
    if (loading) {
        return (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="animate-pulse space-y-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200" />
                    <div className="h-4 w-1/2 rounded bg-slate-200" />
                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-10 rounded bg-slate-200" />
                        <div className="h-10 rounded bg-slate-200" />
                    </div>
                </div>
            </div>
        );
    }
    if (!driver) return null;

    const fullName = `${driver.first_name ?? ''} ${driver.last_name ?? ''}`.trim() || 'Your Driver';
    const initials =
        fullName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase())
            .join('') || 'D';

    return (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                    {initials}
                </div>
                <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">{fullName}</div>
                    {typeof driver.rating !== 'undefined' && <Stars value={driver.rating} />}
                </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <Car className="h-4 w-4 text-indigo-600" />
                    <div className="text-sm">
                        <div className="text-slate-500">Car</div>
                        <div className="font-medium text-slate-800">
                            {driver.car_name || '—'} • {driver.car_type || '—'}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <Hash className="h-4 w-4 text-indigo-600" />
                    <div className="text-sm">
                        <div className="text-slate-500">Car Number</div>
                        <div className="font-medium text-slate-800">{driver.car_number || '—'}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <Gauge className="h-4 w-4 text-indigo-600" />
                    <div className="text-sm">
                        <div className="text-slate-500">Type</div>
                        <div className="font-medium text-slate-800">{driver.car_type || '—'}</div>
                    </div>
                </div>
                {driver.phone && (
                    <a
                        href={`tel:${driver.phone}`}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50"
                    >
                        <Phone className="h-4 w-4 text-indigo-600" />
                        <div className="text-sm">
                            <div className="text-slate-500">Call</div>
                            <div className="font-medium text-slate-800">{driver.phone}</div>
                        </div>
                    </a>
                )}
            </div>
        </div>
    );
};

const BookRide = () => {
    const { user: authUser } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentRide, loading, error } = useSelector((state) => state.ride);

    const [pickup, setPickup] = useState(null);
    const [dropoff, setDropoff] = useState(null);
    const [carType, setCarType] = useState('Standard');
    const [estimatedPrice, setEstimatedPrice] = useState(null);
    const [distanceMiles, setDistanceMiles] = useState(null);
    const [etaMins, setEtaMins] = useState(null);
    const [showRoute, setShowRoute] = useState(false);

    // live status UI flags
    const [pending, setPending] = useState(false);
    const [uiError, setUiError] = useState(null);
    const [driverConfirmed, setDriverConfirmed] = useState(false);
    const [rideOngoing, setRideOngoing] = useState(false);
    const [rideCompleted, setRideCompleted] = useState(false);
    const [driverId, setDriverId] = useState(null);

    // new: driver info
    const [driverInfo, setDriverInfo] = useState(null);
    const [driverLoading, setDriverLoading] = useState(false);

    // Geo-locate user
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

    // fetch driver profile (public) by id
    const loadDriver = async (id) => {
        try {
            setDriverLoading(true);
            // Adjust this path to match your backend endpoint if different:
            const res = await api.get(`/drivers/${id}/public`);
            setDriverInfo(res.data?.data || null);
        } catch (e) {
            // still show the “accepted” banner even if public info fails
            setDriverInfo(null);
        } finally {
            setDriverLoading(false);
        }
    };

    // ensure we have the customer profile (for _id) once
useEffect(() => {
  if (!authUser) {
    dispatch(fetchCustomerProfile?.()); // safe no-op if you already loaded it elsewhere
  }
}, [authUser, dispatch]);

// join the customer's personal room once we have an id
useEffect(() => {
  if (authUser?._id) {
    socket.emit('join_as_customer', authUser._id);   // <= MUST match your server handler
  }
}, [authUser?._id]);

// catch up if event was missed (tab opened late, etc.)
// useEffect(() => {
//   const run = async () => {
//     if (!currentRide?._id) return;
//     try {
//       const res = await api.get(`/rides/${currentRide._id}`); // make a GET route that returns ride with status + driver_id
//       const ride = res.data?.data;
//       if (!ride) return;

//       // reflect server truth
//       if (ride.status === 'confirmed') {
//         setDriverConfirmed(true);
//         setRideOngoing(false);
//         setRideCompleted(false);
//         setPending(false);
//         setDriverId(ride.driver_id);
//         if (ride.driver_id) await loadDriver(ride.driver_id);
//       } else if (ride.status === 'ongoing') {
//         setDriverConfirmed(true);
//         setRideOngoing(true);
//         setRideCompleted(false);
//         setPending(false);
//         setDriverId(ride.driver_id);
//         if (ride.driver_id) await loadDriver(ride.driver_id);
//       } else if (ride.status === 'completed') {
//         setDriverConfirmed(true);
//         setRideOngoing(false);
//         setRideCompleted(true);
//         setPending(false);
//         setDriverId(ride.driver_id);
//         if (ride.driver_id) await loadDriver(ride.driver_id);
//       }
//     } catch (e) {
//       // ignore; socket will still update us
//     }
//   };
//   run();
// }, [currentRide?._id]); // run once when the ride is created


useEffect(() => {
  if (!currentRide?._id) return;

  let alive = true;
  (async () => {
    try {
      const res = await api.get(`/rides/${currentRide._id}`);
      const ride = res.data?.data;
      if (!alive || !ride) return;

      const setCommon = () => {
        setPending(false);
        setDriverId(ride.driver_id || null);
        if (ride.driver_id) loadDriver(ride.driver_id);
      };

      switch (ride.status) {
        case 'confirmed':
          setDriverConfirmed(true);
          setRideOngoing(false);
          setRideCompleted(false);
          setCommon();
          navigate(`/ride/${ride._id}`); // go to live tracking
          break;

        case 'ongoing':
          setDriverConfirmed(true);
          setRideOngoing(true);
          setRideCompleted(false);
          setCommon();
          navigate(`/ride/${ride._id}`);
          break;

        case 'completed':
          setDriverConfirmed(true);
          setRideOngoing(false);
          setRideCompleted(true);
          setCommon();
          navigate(`/ride/${ride._id}`);
          break;

        // 'requested' or any other state: stay on booking screen
        default:
          break;
      }
    } catch {
      /* ignore; socket events will still update UI */
    }
  })();

  return () => { alive = false; };
}, [currentRide?._id, navigate]);


    // Socket listeners for this customer's ride
    useEffect(() => {
        const onConfirmed = (data) => {
            if (currentRide && data.ride_id === currentRide._id) {
                setDriverConfirmed(true);
                setDriverId(data.driver_id);
                setPending(false);
                if (data.driver_id) loadDriver(data.driver_id);
                // navigate to live ride tracking page
                navigate(`/ride/${currentRide._id}`);
            }
        };
        const onOngoing = (data) => {
            if (currentRide && data.ride_id === currentRide._id) {
                setRideOngoing(true);
            }
        };
        const onCompleted = (data) => {
            if (currentRide && data.ride_id === currentRide._id) {
                setRideCompleted(true);
            }
        };

        socket.on('ride_confirmed', onConfirmed);
        socket.on('ride_ongoing', onOngoing);
        socket.on('ride_completed', onCompleted);

        return () => {
            socket.off('ride_confirmed', onConfirmed);
            socket.off('ride_ongoing', onOngoing);
            socket.off('ride_completed', onCompleted);
        };
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
                withCredentials: true,
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

    // Derive a compact status chip label
    const statusLabel = useMemo(() => {
        if (rideCompleted) return 'Completed';
        if (rideOngoing) return 'Ongoing';
        if (driverConfirmed) return 'Confirmed';
        if (currentRide?._id) return 'Requested';
        return null;
    }, [rideCompleted, rideOngoing, driverConfirmed, currentRide]);

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

                    <div className="flex items-center gap-2">
                        {statusLabel && (
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusLabel === 'Completed'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : statusLabel === 'Ongoing'
                                            ? 'bg-amber-100 text-amber-700'
                                            : statusLabel === 'Confirmed'
                                                ? 'bg-indigo-100 text-indigo-700'
                                                : 'bg-slate-100 text-slate-700'
                                    }`}
                            >
                                {statusLabel}
                            </span>
                        )}
                        <button
                            onClick={locateMe}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            <LocateFixed className="h-4 w-4" />
                            My location
                        </button>
                    </div>
                </div>

                {/* Search inputs */}
                <div className="space-y-3">
                    <NominatimSearchInput
                        placeholder="Enter pickup location"
                        disabled={pending || loading || !!currentRide}
                        onSelect={(val) => {
                            setPickup(val);
                            setShowRoute(false);
                        }}
                    />
                    <NominatimSearchInput
                        placeholder="Enter dropoff location"
                        disabled={pending || loading || !!currentRide}
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
                                    disabled={pending || loading || !!currentRide}
                                    className={`flex flex-col items-center justify-center rounded-xl px-3 py-3 text-sm font-medium border transition ${active
                                            ? 'bg-indigo-600 text-white border-indigo-700'
                                            : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                                        } ${pending || loading || currentRide ? 'opacity-70 cursor-not-allowed' : ''}`}
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
                    disabled={pending || loading || driverConfirmed || !!currentRide}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {pending ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" /> Requesting…
                        </>
                    ) : driverConfirmed ? (
                        'Driver Confirmed!'
                    ) : currentRide ? (
                        'Requested'
                    ) : (
                        'Confirm Ride'
                    )}
                </button>

                {/* Driver details after confirm */}
                {driverConfirmed && (
                    <>
                        <div className="mt-3 text-center text-indigo-700 font-semibold">
                            ✅ Driver accepted{driverId ? ` — ID: ${driverId}` : ''}!
                        </div>
                        <DriverCard driver={driverInfo} loading={driverLoading} />
                    </>
                )}

                {/* Live updates */}
                {rideOngoing && !rideCompleted && (
                    <div className="mt-3 text-center text-amber-700 font-semibold">
                        🚕 Your ride is in progress…
                    </div>
                )}
                {rideCompleted && (
                    <div className="mt-3 text-center text-emerald-700 font-semibold">
                        🎉 Ride completed — thanks for riding!
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
