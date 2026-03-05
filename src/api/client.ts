import axios from 'axios';
import type {
    ChangePasswordDto, LoginDto, RegisterDto, UpdateUserDto, UserRole,
    AssignRolesDto, CreateVmDto, UpdateVmDto, ChangeVmStatusDto,
    CreateSnapshotDto, SnapshotActionDto,
    CreateTicketDto, CreateCorporationDto,
} from '../types/auth';
import { useAuthStore } from '../store/authStore';

// Set up the base URL for the provided backend repository.
const BASE_URL = import.meta.env.DEV ? '/api' : 'https://kurumi.software/api';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

/** Decode a JWT payload without verifying signature (display only). */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(base64).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
        );
        return JSON.parse(json);
    } catch { return null; }
}

/** Extract user role from a JWT access token. */
export function getRoleFromToken(token: string): UserRole | undefined {
    const payload = decodeJwtPayload(token);
    if (!payload) return undefined;
    const role = (payload['role'] ?? payload['roles'] ?? payload['authorities']) as string | string[] | undefined;
    if (Array.isArray(role)) return role[0] as UserRole;
    return role as UserRole | undefined;
}

// ── Interceptors ──────────────────────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
    try {
        // Read directly from zustand store (most reliable)
        let token = useAuthStore.getState().token;
        if (!token) {
            // Fallback: parse localStorage manually
            const persistData = localStorage.getItem('auth-storage');
            if (persistData) {
                token = JSON.parse(persistData)?.state?.token ?? null;
            }
        }
        if (token) {
            config.headers['access_token'] = token;
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch { /* ignore */ }
    return config;
});

const updateLocalToken = (token: string) => {
    try {
        const raw = localStorage.getItem('auth-storage');
        if (raw) { const p = JSON.parse(raw); p.state.token = token; localStorage.setItem('auth-storage', JSON.stringify(p)); }
    } catch { /* ignore */ }
};

apiClient.interceptors.response.use(
    r => r,
    async (error) => {
        const orig = error.config;
        if (error.response?.status === 401 && !orig._retry &&
            !orig.url?.includes('/auth/login') && !orig.url?.includes('/auth/refresh')) {
            orig._retry = true;
            try {
                const rs = await apiClient.post('/auth/refresh');
                const t = rs.headers['access_token'] || rs.data?.accessToken;
                if (t) {
                    updateLocalToken(t);
                    orig.headers.Authorization = `Bearer ${t}`;
                    orig.headers['access_token'] = t;
                    return apiClient(orig);
                }
            } catch (e) { localStorage.removeItem('auth-storage'); window.location.href = '/login'; return Promise.reject(e); }
        }
        return Promise.reject(error);
    }
);

// ══════════════════════════════════════════════════════════════════════════════
//  API — matches https://kurumi.software/swagger
// ══════════════════════════════════════════════════════════════════════════════
export const api = {

    // ── Auth ────────────────────────────────────────────────
    auth: {
        login:          (data: LoginDto) => apiClient.post('/auth/login', data),
        register:       (data: RegisterDto) => apiClient.post('/auth/register', data),
        refresh:        () => apiClient.post('/auth/refresh'),
        logout:         () => apiClient.delete('/auth/logout'),
        logoutAll:      () => apiClient.delete('/auth/logout_all'),
        changePassword: (data: ChangePasswordDto) => apiClient.post('/auth/change_password', data),
    },

    // ── Users ───────────────────────────────────────────────
    users: {
        create:        (data: Record<string, unknown>) => apiClient.post('/users', data),
        getAll:        () => apiClient.get('/users'),
        getById:       (id: string) => apiClient.get(`/users/${id}`),
        updateProfile: (data: UpdateUserDto) => apiClient.patch('/users/update_info', data),
        assignRoles:   (id: string, data: AssignRolesDto) => apiClient.patch(`/users/${id}/roles`, data),
    },

    // ── VPS (Virtual Machines) ──────────────────────────────
    vps: {
        // Read
        getAll:             () => apiClient.get('/vps'),
        getMy:              () => apiClient.get('/vps/my'),
        getById:            (id: string) => apiClient.get(`/vps/${id}`),
        getMonitoring:      (id: string) => apiClient.get(`/vps/${id}/monitoring`),
        getAdminProxmoxVms: () => apiClient.get('/vps/admin/proxmox-vms'),
        getClusterResources:() => apiClient.get('/vps/admin/cluster-resources'),

        // CRUD
        create:  (data: CreateVmDto)  => apiClient.post('/vps/create', data),
        update:  (data: UpdateVmDto)  => apiClient.patch('/vps/update', data),
        delete:  (data: { proxmox_id: number }) => apiClient.delete('/vps/delete', { data }),

        // Power
        start:    (data: ChangeVmStatusDto) => apiClient.post('/vps/start', data),
        stop:     (data: ChangeVmStatusDto) => apiClient.post('/vps/stop', data),
        restart:  (data: ChangeVmStatusDto) => apiClient.post('/vps/restart', data),
        shutdown: (data: ChangeVmStatusDto) => apiClient.post('/vps/shutdown', data),

        // Snapshots
        createSnapshot:  (data: CreateSnapshotDto) => apiClient.post('/vps/snapshots/create', data),
        listSnapshots:   (id: string) => apiClient.get(`/vps/${id}/snapshots`),
        rollbackSnapshot:(data: SnapshotActionDto) => apiClient.post('/vps/snapshots/rollback', data),
        deleteSnapshot:  (data: SnapshotActionDto) => apiClient.delete('/vps/snapshots/delete', { data }),
    },

    // ── Tickets ─────────────────────────────────────────────
    tickets: {
        create: (data: CreateTicketDto) => apiClient.post('/tickets', data),
        getAll: () => apiClient.get('/tickets'),
        getById:(id: string) => apiClient.get(`/tickets/${id}`),
    },

    // ── Corporations ────────────────────────────────────────
    corporations: {
        create:       (data: CreateCorporationDto) => apiClient.post('/corporations', data),
        getAll:       () => apiClient.get('/corporations'),
        getById:      (id: string) => apiClient.get(`/corporations/${id}`),
        delete:       (id: string) => apiClient.delete(`/corporations/${id}`),
        addMember:    (corpId: string, userId: string) => apiClient.post(`/corporations/${corpId}/members/${userId}`),
        removeMember: (corpId: string, userId: string) => apiClient.delete(`/corporations/${corpId}/members/${userId}`),
    },

    // ── Storage ─────────────────────────────────────────────
    storage: {
        listGlobal:  () => apiClient.get('/storage'),
        listNode:    () => apiClient.get('/storage/node'),
        getContent:  (storage: string) => apiClient.get(`/storage/${storage}/content`),
    },

    // ── LXC ─────────────────────────────────────────────────
    lxc: {
        listAll:    () => apiClient.get('/lxc'),
        create:     (data: Record<string, unknown>) => apiClient.post('/lxc/create', data),
        getStatus:  (proxmoxId: number) => apiClient.get(`/lxc/${proxmoxId}`),
        delete:     (proxmoxId: number) => apiClient.delete(`/lxc/${proxmoxId}`),
        getConfig:  (proxmoxId: number) => apiClient.get(`/lxc/${proxmoxId}/config`),
        updateConfig:(proxmoxId: number, data: Record<string, unknown>) => apiClient.patch(`/lxc/${proxmoxId}/config`, data),
        monitoring: (proxmoxId: number) => apiClient.get(`/lxc/${proxmoxId}/monitoring`),
        start:      (proxmoxId: number) => apiClient.post(`/lxc/${proxmoxId}/start`),
        stop:       (proxmoxId: number) => apiClient.post(`/lxc/${proxmoxId}/stop`),
        shutdown:   (proxmoxId: number) => apiClient.post(`/lxc/${proxmoxId}/shutdown`),
        reboot:     (proxmoxId: number) => apiClient.post(`/lxc/${proxmoxId}/reboot`),
    },

    // ── Pools ───────────────────────────────────────────────
    pools: {
        list:   () => apiClient.get('/pools'),
        create: (data: Record<string, unknown>) => apiClient.post('/pools', data),
        get:    (poolid: string) => apiClient.get(`/pools/${poolid}`),
        update: (poolid: string, data: Record<string, unknown>) => apiClient.put(`/pools/${poolid}`, data),
        delete: (poolid: string) => apiClient.delete(`/pools/${poolid}`),
    },

    // ── RBAC ────────────────────────────────────────────────
    rbac: {
        listRoles:  () => apiClient.get('/rbac/roles'),
        createRole: (data: Record<string, unknown>) => apiClient.post('/rbac/roles', data),
        getRole:    (roleid: string) => apiClient.get(`/rbac/roles/${roleid}`),
        updateRole: (roleid: string, data: Record<string, unknown>) => apiClient.put(`/rbac/roles/${roleid}`, data),
        deleteRole: (roleid: string) => apiClient.delete(`/rbac/roles/${roleid}`),
        listUsers:  () => apiClient.get('/rbac/users'),
        createUser: (data: Record<string, unknown>) => apiClient.post('/rbac/users', data),
        getUser:    (userid: string) => apiClient.get(`/rbac/users/${userid}`),
        updateUser: (userid: string, data: Record<string, unknown>) => apiClient.put(`/rbac/users/${userid}`, data),
        deleteUser: (userid: string) => apiClient.delete(`/rbac/users/${userid}`),
        listAcl:    () => apiClient.get('/rbac/acl'),
        updateAcl:  (data: Record<string, unknown>) => apiClient.put('/rbac/acl', data),
    },

    // ── SDN ─────────────────────────────────────────────────
    sdn: {
        listZones:  () => apiClient.get('/sdn/zones'),
        getZone:    (zone: string) => apiClient.get(`/sdn/zones/${zone}`),
        listVnets:  () => apiClient.get('/sdn/vnets'),
        getVnet:    (vnet: string) => apiClient.get(`/sdn/vnets/${vnet}`),
        getSubnets: (vnet: string) => apiClient.get(`/sdn/vnets/${vnet}/subnets`),
        apply:      () => apiClient.post('/sdn/apply'),
    },
};
