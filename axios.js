import axios from 'axios';
import { toast } from 'react-toastify';
import { logout } from './src/redux/slices/authSlice';
import { store } from './src/redux/store';

const URL = import.meta.env.VITE_BASE_URL

const axiosInstance = axios.create({
  baseURL: `${URL}api`,
  headers: {
    'Content-Type': 'application/json',
  },
});
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        store.dispatch(logout());
        window.location.href = '/';
        return Promise.reject(error);
      }
      if (status === 500) {
        toast.error('Internal server error. Please try again later.');
      } else if (status === 403) {
        toast.error('Forbidden access. You don’t have permission.');
      } else if (status === 404) {
        toast.error('Resource not found.');
      } else {
        toast.error(error.response.data.message || error.message);
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error(error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
