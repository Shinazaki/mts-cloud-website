// src/types/auth.ts

export type UserRole = 'user' | 'admin-corporation' | 'corporation_admin' | 'admin';

export interface Role {
    id: number;
    role: string;
    description: string | null;
}

export interface User {
    id?: string | number;
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    surName?: string;
    phoneNumber?: string;
    name?: string;
    address?: string;
    zip?: string;
    balance?: string | number;
    role?: UserRole;
    roles?: Role[];
    corporationId?: string;
}

export interface AuthResponse {
    access_token?: string;
    token?: string;
    user?: User;
}

export interface LoginDto {
    username: string;
    password?: string;
}

export interface RegisterDto {
    username: string;
    password?: string;
    email: string;
    firstName: string;
    lastName: string;
    surName?: string;
    phoneNumber: string;
}

export interface ChangePasswordDto {
    oldPassword?: string;
    newPassword?: string;
}

export interface UpdateUserDto {
    email?: string;
    firstName?: string;
    lastName?: string;
    surName?: string;
    phoneNumber?: string;
    address?: string;
    zip?: string;
    password?: string;
}

export interface AssignRolesDto {
    roles: string[];
}

// ── VPS / VM types ─────────────────────────────────────────
export interface VmConfiguration {
    cpu?: number;
    ram?: number;
    ssd?: number;
}

export interface Vm {
    id: string;
    proxmox_id?: number;
    name: string;
    status?: string;      // running | stopped | paused ...
    ip_address?: string;
    node?: string;
    configuration?: VmConfiguration;
    created_at?: string;
    owner?: string;
}

export interface CreateVmDto {
    name: string;
    configuration: {
        cpu: number;
        ram: number;
        ssd: number;
    };
    net0?: string;
    template_id?: number;
    cloud_init_user?: string;
    cloud_init_password?: string;
    ssh_keys?: string;
    node?: string;
}

export interface UpdateVmDto {
    id: string;
    configuration: {
        cpu?: number;
        ram?: number;
        ssd?: number;
    };
}

export interface ChangeVmStatusDto {
    id: string;
}

export interface CreateSnapshotDto {
    vmId: string;
    snapname: string;
    description?: string;
    vmstate?: boolean;
}

export interface SnapshotActionDto {
    vmId: string;
    snapname: string;
}

// ── Tickets ────────────────────────────────────────────────
export interface CreateTicketDto {
    name: string;
    description: string;
}

export interface Ticket {
    id: string;
    name?: string;
    description?: string;
    subject?: string;
    message?: string;
    status?: string;
    created_at?: string;
    user_id?: string;
}

// ── Corporations ───────────────────────────────────────────
export interface Corporation {
    id: string;
    name: string;
    members?: User[];
    created_at?: string;
}

export interface CreateCorporationDto {
    name: string;
}
