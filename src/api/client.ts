import axios from 'axios';
import type { ChangePasswordDto, LoginDto, RegisterDto, UpdateUserDto, UserRole } from '../types/auth';

// Set up the base URL for the provided backend repository.
const BASE_URL = import.meta.env.DEV ? '/api' : 'https://kurumi.software/api';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Necessary for passing HttpOnly cookies (e.g., refresh_token)
});

/** Decode a JWT payload without verifying signature (display only). */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join('')
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
}

/** Extract user role from a JWT access token. */
export function getRoleFromToken(token: string): UserRole | undefined {
    const payload = decodeJwtPayload(token);
    if (!payload) return undefined;
    // Common JWT role claim names
    const role = (payload['role'] ?? payload['roles'] ?? payload['authorities']) as string | string[] | undefined;
    if (Array.isArray(role)) return role[0] as UserRole;
    return role as UserRole | undefined;
}

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
        getProfile: async () => {
            try {
                return await apiClient.get('/users/me');
            } catch {
                return mockRequest({ firstName: 'Иван', lastName: 'Иванов', address: 'ул. Примерная, д. 1, кв. 2', zip: '220000' });
            }
        },
        updateProfile: async (data: UpdateUserDto) => {
            try {
                return await apiClient.patch('/users/update_info', data);
            } catch {
                return mockRequest(data);
            }
        },
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
        getBalance: async () => {
            try {
                return await apiClient.get('/billing/balance');
            } catch {
                return mockRequest({ balance: 42.00, currency: 'BYN' });
            }
        },
        getHistory: async () => {
            try {
                return await apiClient.get('/billing/history');
            } catch {
                return mockRequest([]);
            }
        },
    },

    // ── Corporate Admin ──────────────────────────────────────────────────────
    corporate: {
        getEmployees: async () => {
            try {
                return await apiClient.get('/corporate/employees');
            } catch {
                return mockRequest([
                    { id: 'e1', username: 'ivanov', firstName: 'Иван', lastName: 'Иванов', email: 'ivanov@corp.by', role: 'user', serverCount: 2 },
                    { id: 'e2', username: 'petrov', firstName: 'Пётр', lastName: 'Петров', email: 'petrov@corp.by', role: 'user', serverCount: 1 },
                    { id: 'e3', username: 'sidorova', firstName: 'Анна', lastName: 'Сидорова', email: 'sidorova@corp.by', role: 'user', serverCount: 0 },
                ]);
            }
        },
        addEmployee: async (data: { username: string; email: string }) => {
            try {
                return await apiClient.post('/corporate/employees', data);
            } catch {
                return mockRequest({ ...data, id: Date.now().toString(), role: 'user', serverCount: 0 });
            }
        },
        removeEmployee: async (employeeId: string) => {
            try {
                return await apiClient.delete(`/corporate/employees/${employeeId}`);
            } catch {
                return mockRequest({ success: true });
            }
        },
        getEmployeeServers: async (employeeId: string) => {
            try {
                return await apiClient.get(`/corporate/employees/${employeeId}/servers`);
            } catch {
                return mockRequest([
                    { id: `${employeeId}-s1`, name: 'Prod-Server-01', ip: '10.0.1.10', created: '01.01.2025', characteristics: '4 CPU, 8GB RAM' },
                ]);
            }
        },
        getAllCorpServers: async () => {
            try {
                return await apiClient.get('/corporate/servers');
            } catch {
                return mockRequest([
                    { id: 's1', name: 'Corp-Web-01', ip: '10.0.1.10', owner: 'ivanov', created: '01.01.2025', characteristics: '4 CPU, 8GB RAM' },
                    { id: 's2', name: 'Corp-DB-01', ip: '10.0.1.11', owner: 'petrov', created: '15.02.2025', characteristics: '8 CPU, 32GB RAM' },
                ]);
            }
        },
    },

    // ── Super Admin ──────────────────────────────────────────────────────────
    admin: {
        getAllUsers: async () => {
            try {
                return await apiClient.get('/admin/users');
            } catch {
                return mockRequest([
                    { id: 'u1', username: 'superadmin', firstName: 'Супер', lastName: 'Администратор', email: 'admin@mtc.by', role: 'admin', serverCount: 0 },
                    { id: 'u2', username: 'corp_admin1', firstName: 'Корпоративный', lastName: 'Администратор', email: 'corp@corp.by', role: 'admin-corporate', serverCount: 0 },
                    { id: 'u3', username: 'user1', firstName: 'Иван', lastName: 'Иванов', email: 'user1@mail.by', role: 'user', serverCount: 3 },
                    { id: 'u4', username: 'user2', firstName: 'Мария', lastName: 'Ковалёва', email: 'user2@mail.by', role: 'user', serverCount: 1 },
                ]);
            }
        },
        getUserById: (id: string) => apiClient.get(`/admin/users/${id}`),
        updateUserRole: async (id: string, role: string) => {
            try {
                return await apiClient.patch(`/admin/users/${id}/role`, { role });
            } catch {
                return mockRequest({ success: true });
            }
        },
        deleteUser: async (id: string) => {
            try {
                return await apiClient.delete(`/admin/users/${id}`);
            } catch {
                return mockRequest({ success: true });
            }
        },
        getUserServers: async (userId: string) => {
            try {
                return await apiClient.get(`/admin/users/${userId}/servers`);
            } catch {
                return mockRequest([
                    { id: `${userId}-s1`, name: 'User-Server-01', ip: '192.168.1.1', created: '10.03.2025', characteristics: '2 CPU, 4GB RAM' },
                ]);
            }
        },
        getAllServers: async () => {
            try {
                return await apiClient.get('/admin/servers');
            } catch {
                return mockRequest([
                    { id: 's1', name: 'WebProd-Node-01', ip: '192.168.0.100', owner: 'user1', role: 'user', created: '12.10.2023' },
                    { id: 's2', name: 'Database-Primary', ip: '10.0.0.5', owner: 'user1', role: 'user', created: '05.11.2023' },
                    { id: 's3', name: 'Corp-Web-01', ip: '10.0.1.10', owner: 'corp_admin1', role: 'admin-corporate', created: '01.01.2025' },
                ]);
            }
        },
    },
};
