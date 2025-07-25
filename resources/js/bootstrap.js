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

// Bootstrap configuration - imports from Core module for centralized resource management
// This must be loaded AFTER axios configuration to ensure interceptors work properly
import '../../Modules/Core/resources/js/bootstrap';

// Add any other global JavaScript configurations here
