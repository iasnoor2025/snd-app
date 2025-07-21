import axios from 'axios';
import { route } from 'ziggy-js';
import Ziggy from './ziggy';

// Configure axios
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

// Configure Ziggy routing
window.Ziggy = Ziggy;
window.route = route;

// CSRF token handling for axios requests
const csrfToken = document.head.querySelector('meta[name="csrf-token"]');
if (csrfToken) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken.content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Global axios interceptor to handle authentication and CSRF
let isRefreshingCSRF = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });

    failedQueue = [];
};

// Request interceptor to ensure CSRF cookie is set
window.axios.interceptors.request.use(
    async (config) => {
        console.log('Axios request interceptor:', config.url);

        // For API requests, ensure CSRF cookie is set
        if (config.url?.startsWith('/api/') && !config.url.includes('/sanctum/csrf-cookie')) {
            console.log('Setting CSRF cookie for API request:', config.url);

            if (!isRefreshingCSRF) {
                isRefreshingCSRF = true;
                try {
                    console.log('Fetching CSRF cookie...');
                    await axios.get('/sanctum/csrf-cookie');
                    console.log('CSRF cookie set successfully');
                    processQueue(null, true);
                } catch (error) {
                    console.error('Failed to set CSRF cookie:', error);
                    processQueue(error, null);
                } finally {
                    isRefreshingCSRF = false;
                }
            } else {
                // If already refreshing, wait for it to complete
                console.log('Waiting for CSRF cookie refresh...');
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    console.log('CSRF cookie refresh completed, proceeding with request');
                    return config;
                });
            }
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle authentication errors
window.axios.interceptors.response.use(
    (response) => {
        console.log('Axios response success:', response.config.url, response.status);
        return response;
    },
    (error) => {
        console.error('Axios response error:', error.config?.url, error.response?.status, error.response?.data);

        if (error.response?.status === 401) {
            console.log('401 Unauthorized - redirecting to login');
            // Prevent infinite redirect loop
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                if (!window.sessionStorage.getItem('redirectedToLogin')) {
                    window.sessionStorage.setItem('redirectedToLogin', '1');
                    window.location.href = '/login';
                }
            }
        } else if (error.response?.status === 419) {
            console.log('419 CSRF Token Mismatch - reloading page');
            // Prevent infinite reload loop
            if (typeof window !== 'undefined' && !window.sessionStorage.getItem('reloadedForCsrf')) {
                window.sessionStorage.setItem('reloadedForCsrf', '1');
                window.location.reload();
            }
        }
        return Promise.reject(error);
    }
);

console.log('Axios interceptors configured successfully');

// Add any other global JavaScript configurations here
