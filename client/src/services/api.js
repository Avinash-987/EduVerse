import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('eduverse-token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Do not intercept 401s for login/register endpoints so the components can show the error
        const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');

        if (error.response?.status === 401 && !isAuthRequest) {
            localStorage.removeItem('eduverse-token');
            localStorage.removeItem('eduverse-user');

            // Only redirect if not already on login page to avoid infinite reloads
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
