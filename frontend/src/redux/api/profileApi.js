// src/redux/api/customerApi.js
import { api } from './api'; // your base API using axiosBaseQuery

export const profileApi = api.injectEndpoints({
    endpoints: (build) => ({
        // Fetch customer profile
        getCustomerProfile: build.query({
            query: () => ({
                url: '/customers/profile',
                method: 'GET',
            }),
            providesTags: ['Me'],
            transformResponse: (res) => {
                return res?.data?.customer;
            }
        }),

        // Update customer profile
        updateCustomerProfile: build.mutation({
            query: (body) => ({
                url: '/customers/profile',
                method: 'PUT', 
                data: body,     
            }),
            invalidatesTags: ['Me'],
            transformResponse: (res) => {
                return res?.data?.data?.customer ?? res?.data ?? res
            }
        }),

        // Get Driver Profile
        getDriver: build.query({
            query: () => ({
                url: '/drivers/profile',
                method: 'GET',
            }),
            providesTags: ['Driver'],
            transformResponse: (res) => {
                return res?.data?.driver ?? res?.data ?? res;
            },
        }),

        // Update Driver Profile
        updateDriver: build.mutation({
            query: (body) => ({
                url: '/drivers/profile',
                method: 'PUT',
                data: body,
            }),
            invalidatesTags: ['Driver'],
            transformResponse: (res) =>
                res?.data?.driver ?? res?.data ?? res,
        }),
    }),

    overrideExisting: false,
});


export const {
    useGetCustomerProfileQuery,
    useUpdateCustomerProfileMutation,
    useGetDriverQuery,
    useUpdateDriverMutation,
} = profileApi;
