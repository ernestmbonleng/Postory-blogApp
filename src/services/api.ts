import axios from 'axios';
import { getToken, clearToken } from './auth-storage'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  withCredentials: true,            
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;

  } 
  return config;
});
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 403) {
      clearToken();
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;