import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './axiosBaseQuery';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(), // <--- reuses your `api` instance under the hood
  tagTypes: ['Me', 'Rides'],
  endpoints: () => ({}),
});
