import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
axiosClient.interceptors.request.use(
    (config) => {
        // Do something before request is sent
        // e.g., add auth token
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Do something with request error
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
    (response) => {
        // Any status code that lie within the range of 2xx cause this function to trigger
        return response;
    },
    (error) => {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        if (error.response) {
            const { status, data } = error.response;

            // Handle authentication errors
            if (status === 401) {
                // Clear token and redirect to login
                localStorage.removeItem('token');
                window.location.href = '/login';
            }

            // Handle validation errors (422)
            if (status === 422 && data.errors) {
                // Transform Laravel validation errors into a more usable format
                const validationErrors: Record<string, string[]> = data.errors;
                const firstError = Object.values(validationErrors)[0]?.[0];

                // Attach formatted error message
                error.message = firstError || data.message || 'Validation failed';
                error.validationErrors = validationErrors;
            }

            // Handle other common errors
            if (status === 403) {
                error.message = data.message || 'You do not have permission to perform this action';
            }

            if (status === 404) {
                error.message = data.message || 'Resource not found';
            }

            if (status === 500) {
                error.message = data.message || 'Internal server error';
            }

            // Use backend message if available
            if (data.message && !error.message) {
                error.message = data.message;
            }
        } else if (error.request) {
            // Request was made but no response received
            error.message = 'No response from server. Please check your connection.';
        } else {
            // Something else happened
            error.message = error.message || 'An unexpected error occurred';
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
