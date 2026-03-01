import axios from 'axios';
import type { ChangePasswordDto, LoginDto, RegisterDto, UpdateUserDto } from '../types/auth';

// Set up the base URL for the provided backend repository.
const BASE_URL = import.meta.env.DEV ? '/api' : 'https://kurumi.software/api';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Necessary for passing HttpOnly cookies (e.g., refresh_token)
});

// Interceptor to add auth token if available
apiClient.interceptors.request.use((config) => {
    try {
        const persistData = localStorage.getItem('auth-storage');
        if (persistData) {
            const parsed = JSON.parse(persistData);
            const token = parsed?.state?.token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    } catch {
        // ignore parse error
    }
    return config;
});

// Helper to update local store token
const updateLocalToken = (token: string) => {
    try {
        const persistData = localStorage.getItem('auth-storage');
        if (persistData) {
            const parsed = JSON.parse(persistData);
            parsed.state.token = token;
            localStorage.setItem('auth-storage', JSON.stringify(parsed));
        }
    } catch {
        // ignore parse error
    }
};

// Response interceptor to handle 401 token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If 401 and we haven't retried yet, and it's not a request to the auth endpoints themselves
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/login') &&
            !originalRequest.url?.includes('/auth/refresh')
        ) {
            originalRequest._retry = true;
            try {
                const rs = await apiClient.post('/auth/refresh');
                const newToken = rs.headers['access_token'] || rs.data?.accessToken;
                
                if (newToken) {
                    updateLocalToken(newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh token failed or expired
                localStorage.removeItem('auth-storage');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// Helper to simulate a successful API response if the real backend is down
const mockRequest = async <T>(data: T, delay = 800): Promise<{ data: T }> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve({ data }), delay);
    });
};

// Example API calls structure based on standard REST backend
export const api = {
    auth: {
        login: async (data: LoginDto) => {
            const response = await apiClient.post('/auth/login', data);
            return response;
        },
        register: async (data: RegisterDto) => {
            const response = await apiClient.post('/auth/register', data);
            return response;
        },
        refresh: () => apiClient.post('/auth/refresh'),
        logout: () => apiClient.delete('/auth/logout'),
        logoutAll: () => apiClient.delete('/auth/logout_all'),
        changePassword: (data: ChangePasswordDto) => apiClient.post('/auth/change_password', data),
    },
    users: {
        getProfile: () => apiClient.get('/users/me'), // Placeholder if needed
        updateProfile: (data: UpdateUserDto) => apiClient.patch('/users/update_info', data),
    },
    servers: {
        getAll: async () => {
            try {
                return await apiClient.get('/servers');
            } catch {
                console.warn('Backend reachability issues. Using MOCK SERVERS.');
                return mockRequest([
                    {
                        id: '1',
                        name: 'WebProd-Node-01',
                        characteristics: '2 CPU, 4 GB RAM, 60 GB NVMe',
                        ip: '192.168.0.100',
                        created: '12.10.2023',
                        osIcon: 'terminal'
                    },
                    {
                        id: '2',
                        name: 'Database-Primary',
                        characteristics: '8 CPU, 32 GB RAM, 500 GB SSD',
                        ip: '10.0.0.5',
                        created: '05.11.2023',
                        osIcon: 'dns'
                    }
                ]);
            }
        },
        getById: (id: string) => apiClient.get(`/servers/${id}`),
        create: (data: Record<string, unknown>) => apiClient.post('/servers', data),
    },
    billing: {
        getBalance: () => apiClient.get('/billing/balance'),
        getHistory: () => apiClient.get('/billing/history'),
    }
};
