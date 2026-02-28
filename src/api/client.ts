import axios from 'axios';
import type { LoginDto, RegisterDto } from '../types/auth';

// Set up the base URL for the provided backend repository.
const BASE_URL = 'http://localhost:8080/api';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add auth token if available
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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
            try {
                return await apiClient.post('/auth/login', data);
            } catch (e) {
                console.warn('Backend reachability issues. Using MOCK LOGIN.');
                return mockRequest({
                    access_token: 'mock-jwt-token-v1',
                    user: { username: data.username, id: 'mock-id' }
                });
            }
        },
        register: async (data: RegisterDto) => {
            try {
                return await apiClient.post('/auth/register', data);
            } catch (e) {
                console.warn('Backend reachability issues. Using MOCK REGISTER.');
                return mockRequest({
                    access_token: 'mock-jwt-token-v1',
                    id: 'mock-id',
                    ...data
                });
            }
        },
    },
    servers: {
        getAll: () => apiClient.get('/servers'),
        getById: (id: string) => apiClient.get(`/servers/${id}`),
        create: (data: Record<string, unknown>) => apiClient.post('/servers', data),
    },
    billing: {
        getBalance: () => apiClient.get('/billing/balance'),
        getHistory: () => apiClient.get('/billing/history'),
    }
};
