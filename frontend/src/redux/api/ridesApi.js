import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const fmtLL = (lat, lng) =>
  lat != null && lng != null ? `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}` : undefined;

export const ridesApi = createApi({
  reducerPath: 'ridesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_BASE_URL,
    credentials: 'include',
  }),
  tagTypes: ['RideHistory'],
  endpoints: (builder) => ({
    getRideHistory: builder.query({
      query: () => 'rides/history',
      transformResponse: (res) => {
        console.log(res)
        const arr = Array.isArray(res?.data) ? res.data : [];
        // Map backend fields -> UI fields your component uses
        return arr.map((r) => {
          console.log(r)
          const pickupText =
            r.pickup_destination ?? fmtLL(r.pickup_latitude, r.pickup_longitude);
          const dropoffText =
            r.dropoff_destination ?? fmtLL(r.dropoff_latitude, r.dropoff_longitude);

          const driver =
            r.driver_id && typeof r.driver_id === 'object'
              ? {
                  name: `${r.driver_id.first_name ?? ''} ${r.driver_id.last_name ?? ''}`.trim(),
                  vehicle: [r.driver_id.car_name, r.driver_id.car_number].filter(Boolean).join(' • ') || undefined,
                }
              : undefined;

          const durationMin =
            r.pickup_time && r.dropoff_time
              ? Math.round((new Date(r.dropoff_time) - new Date(r.pickup_time)) / 60000)
              : undefined;

          return {
            id: r._id,                                // UI expects ride.id
            pickup: pickupText,                       // UI expects ride.pickup
            destination: dropoffText,                 // UI expects ride.destination
            createdAt: r.pickup_time || r.createdAt,  // UI uses ride.createdAt for date
            status: r.status,
            fare: r.price ?? undefined,                // show "—" if not present
            rideType: r.rideType || 'Standard',
            driver,                                   // UI checks ride.driver?.name
            distance: r.distance ?? undefined,
            duration: durationMin ?? r.duration ?? undefined,
          };
        });
      },
      providesTags: ['RideHistory'],
      keepUnusedDataFor: 600,
      refetchOnFocus: true,
    }),
  }),
});

export const { useGetRideHistoryQuery } = ridesApi;
