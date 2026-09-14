import axios from 'axios';
import { storage } from '../../utils/storage';

export const getCleanApiUrl = () => {
    let url = process.env.NEXT_PUBLIC_API_URL || (process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api');

    // Upgrade http:// to https:// when loaded in HTTPS browser or non-localhost to prevent Mixed Content blocking
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://') && !url.includes('localhost')) {
        url = url.replace(/^http:\/\//i, 'https://');
    }

    url = url.trim().replace(/\/+$/, '');
    if (!url.endsWith('/api') && !url.includes('/api/')) {
        url = `${url}/api`;
    }
    return url;
};

const API_URL = getCleanApiUrl();

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000, 
    withCredentials: false
});

// Request interceptor with token injection and logging
api.interceptors.request.use(
    (config) => {
        const token = storage.getItem('adminToken') || storage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Don't override Content-Type for FormData (file uploads)
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        console.log('API Request:', {
            method: config.method?.toUpperCase(),
            url: `${config.baseURL}${config.url}`,
            headers: config.headers,
            data: config.data
        });
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor with more detailed logging
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', {
            status: response.status,
            data: response.data,
            url: response.config.url
        });
        return response;
    },
    (error) => {
        console.error('API Response Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
        });
        return Promise.reject(error);
    }
);

export default api; 