import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { acceptRide } from '../../redux/ride/rideSlice';
import { fetchDriverProfile } from '../../redux/auth/authSlice';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
const socket = io(SOCKET_SERVER_URL, {
    withCredentials: true
});

const DriverDashboard = () => {
    const dispatch = useDispatch();
    const { user, loading } = useSelector((state) => state.auth);
    const [incomingRide, setIncomingRide] = useState(null);
    const [ongoingRide, setOngoingRide] = useState(null); // 🚗 Track ongoing ride

    // Fetch driver profile
    useEffect(() => {
        if (!user) {
            dispatch(fetchDriverProfile());
        }
    }, [dispatch, user]);

    // Setup socket listeners
    useEffect(() => {
        console.log('Connecting to socket...');
        socket.on('connect', () => {
            console.log('Driver socket connected:', socket.id);

            socket.emit('join_as_driver');
        });

        socket.on('new_ride_request', (data) => {
            console.log('🚕 New ride request received!', data);
            setIncomingRide(data);
        });

        socket.on('ride_confirmed', (data) => {
            console.log('✅ ride_confirmed received!', data);

            // If THIS driver accepted the ride → show as ongoing
            if (user && data.driver_id === user._id) {
                setOngoingRide(data);
            }
        });

        return () => {
            socket.off('new_ride_request');
            socket.off('ride_confirmed');
            socket.off('connect');
        };
    }, [user]); // Add user to dependency so we can compare driver_id

    const handleAccept = () => {
        if (!incomingRide) return;

        dispatch(acceptRide(incomingRide.ride_id));

        setIncomingRide(null);
    };

    const handleDecline = () => {
        setIncomingRide(null);
    };

    if (loading || !user) {
        return <div className="text-center mt-10 text-lg text-blue-700">Loading driver profile...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
            <h1 className="text-3xl font-bold text-blue-800 mb-6">Driver Dashboard</h1>

            {ongoingRide ? (
                // 🚗 Ongoing ride card
                <div className="bg-white shadow-md rounded-md p-6 border border-green-400 w-full max-w-md text-center">
                    <h2 className="text-xl font-semibold text-green-700 mb-4">🚕 Ongoing Ride</h2>
                    <p className="mb-2"><strong>Ride ID:</strong> {ongoingRide.ride_id}</p>
                    <p className="mb-2"><strong>Pickup:</strong> {ongoingRide.pickup_latitude}, {ongoingRide.pickup_longitude}</p>
                    <p className="mb-4"><strong>Dropoff:</strong> {ongoingRide.dropoff_latitude}, {ongoingRide.dropoff_longitude}</p>

                    <p className="text-green-700 font-semibold mt-2">🚗 Ride in progress...</p>
                </div>
            ) : incomingRide ? (
                // 🚗 New ride request card
                <div className="bg-white shadow-md rounded-md p-6 border border-gray-300 w-full max-w-md text-center">
                    <h2 className="text-xl font-semibold text-green-700 mb-4">New Ride Request!</h2>
                    <p className="mb-2"><strong>Pickup:</strong> ({incomingRide.pickup_latitude}, {incomingRide.pickup_longitude})</p>
                    <p className="mb-4"><strong>Dropoff:</strong> ({incomingRide.dropoff_latitude}, {incomingRide.dropoff_longitude})</p>

                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={handleAccept}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
                        >
                            Accept
                        </button>
                        <button
                            onClick={handleDecline}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            ) : (
                // No ride yet
                <div className="text-gray-600 text-lg">Waiting for ride requests...</div>
            )}
        </div>
    );
};

export default DriverDashboard;
