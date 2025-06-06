import axios from 'axios';

console.log('Backend URL:', process.env.REACT_APP_BACKEND_BASE_URL);
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_BASE_URL,
    withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;