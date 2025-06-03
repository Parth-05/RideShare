import React, { useState, useEffect } from 'react';
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
            map.flyTo([position.lat, position.lng], 14, {
                animate: true,
                duration: 1.2,
            });
        }
    }, [position, map]);
    return null;
};

// 🚗 SAFE RoutingMachine component
const RoutingMachine = ({ from, to }) => {
    const map = useMap();

    useEffect(() => {
        if (!from || !to) return;

        let routingControl = L.Routing.control({
            waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
            }),
            lineOptions: {
                styles: [{ color: '#FF8C00', weight: 5 }],
            },
            show: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            createMarker: () => null,
        }).addTo(map);

        return () => {
            // Safe remove to prevent "reading 'removeLayer'" error
            try {
                if (map && routingControl) {
                    map.removeControl(routingControl);
                }
            } catch (e) {
                console.warn('Error removing RoutingMachine:', e);
            }
        };
    }, [from, to, map]);

    return null;
};

const NominatimSearchInput = ({ placeholder, onSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const search = async (value) => {
        const url = `https://nominatim.openstreetmap.org/search?q=${value}&format=json&addressdetails=1&limit=5`;
        const res = await fetch(url);
        const data = await res.json();
        setResults(data);
    };

    useEffect(() => {
        if (query.length > 2) {
            const timeout = setTimeout(() => search(query), 300);
            return () => clearTimeout(timeout);
        } else {
            setResults([]);
        }
    }, [query]);

    return (
        <div className="mb-3 w-full">
            <input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
            {results.length > 0 && (
                <ul className="mt-1 max-h-40 overflow-y-auto border border-gray-300 bg-white rounded-md shadow text-sm">
                    {results.map((result) => (
                        <li
                            key={result.place_id}
                            onClick={() => {
                                setQuery(result.display_name);
                                setResults([]);
                                onSelect({
                                    lat: parseFloat(result.lat),
                                    lng: parseFloat(result.lon),
                                });
                            }}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                            {result.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// 🚗 Initialize Socket.IO client
const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
const socket = io(SOCKET_SERVER_URL, {
    withCredentials: true
});

const BookRide = () => {
    const dispatch = useDispatch();
    const { currentRide, loading, error } = useSelector((state) => state.ride);

    const [pickup, setPickup] = useState(null);
    const [dropoff, setDropoff] = useState(null);
    const [carType, setCarType] = useState('Standard');
    const [estimatedPrice, setEstimatedPrice] = useState(null);
    const [showRoute, setShowRoute] = useState(false);
    const [driverConfirmed, setDriverConfirmed] = useState(false);
    const [driverId, setDriverId] = useState(null);

    const handleConfirm = async () => {
        if (pickup && dropoff) {
            const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=false`;

            const carPrices = {
                Standard: 20,
                SUV: 35,
                Van: 50,
            };

            try {
                const res = await fetch(url);
                const data = await res.json();

                const meters = data.routes[0].distance;
                const miles = meters / 1609.34;
                const price = carPrices[carType];
                setEstimatedPrice(price);
                console.log(`Ride request: Distance = ${miles.toFixed(2)} miles, Car Type = ${carType}, Estimated Price = $${price}`);

                dispatch(requestRide({
                    pickup_latitude: pickup.lat,
                    pickup_longitude: pickup.lng,
                    dropoff_latitude: dropoff.lat,
                    dropoff_longitude: dropoff.lng
                }));

                setShowRoute(true);
            } catch (err) {
                console.error('Error requesting ride:', err);
            }
        } else {
            alert('Please select both pickup and dropoff locations.');
        }
    };

    // 🚗 Listen for ride_confirmed
    useEffect(() => {
        socket.on('ride_confirmed', (data) => {
            console.log('🎉 Ride confirmed!', data);

            if (currentRide && data.ride_id === currentRide._id) {
                setDriverConfirmed(true);
                setDriverId(data.driver_id);
            }
        });

        return () => {
            socket.off('ride_confirmed');
        };
    }, [currentRide]);

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

            {/* FLOATING PANEL */}
            <div className="absolute top-6 left-6 w-80 md:w-96 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl p-6 flex flex-col justify-between z-10">
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">🚗 Book a Ride</h2>

                    <div className="space-y-4">
                        <NominatimSearchInput
                            placeholder="Enter pickup location"
                            onSelect={(val) => {
                                setPickup(val);
                                setShowRoute(false);
                            }}
                        />
                        <NominatimSearchInput
                            placeholder="Enter dropoff location"
                            onSelect={(val) => {
                                setDropoff(val);
                                setShowRoute(false);
                            }}
                        />
                    </div>

                    {/* Car Type Selector */}
                    <div className="space-y-3 pt-2 border-t border-gray-200">
                        <label className="text-sm font-semibold text-gray-600">Select Car Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { type: 'Standard', icon: '🚗', label: '1–4' },
                                { type: 'SUV', icon: '🚙', label: '1–6' },
                                { type: 'Van', icon: '🚌', label: '1–8' },
                            ].map((car) => (
                                <button
                                    key={car.type}
                                    onClick={() => setCarType(car.type)}
                                    className={`flex flex-col items-center justify-center border rounded-md px-4 py-3 text-base font-medium ${carType === car.type
                                        ? 'bg-blue-600 text-white border-blue-700'
                                        : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="text-2xl">{car.icon}</span>
                                    <span>{car.type}</span>
                                    <span className="text-xs text-gray-500">{car.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {estimatedPrice && (
                        <div className="text-center text-green-600 font-semibold pt-2">
                            Estimated Price: ${estimatedPrice}
                        </div>
                    )}
                </div>

                {/* Bottom button */}
                <button
                    onClick={handleConfirm}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 mt-5"
                    disabled={loading || driverConfirmed}
                >
                    {loading ? 'Requesting...' : driverConfirmed ? 'Driver Confirmed!' : 'Confirm Ride'}
                </button>

                {driverConfirmed && (
                    <div className="mt-4 text-center text-green-700 font-semibold">
                        🎉 Your driver has accepted!<br />
                        Driver ID: {driverId}
                    </div>
                )}

                {error && (
                    <div className="text-red-600 mt-2 text-center font-medium">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookRide;
