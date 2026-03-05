// src/types/auth.ts

export type UserRole = 'user' | 'corporation_admin' | 'admin';

export interface User {
    id?: string;
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    surName?: string;
    phoneNumber?: string;
    name?: string;
    address?: string;
    zip?: string;
    role?: UserRole;
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

// ── VPS / VM types ─────────────────────────────────────────
export interface VmConfiguration {
    cores?: number;
    memory?: number;
    disk?: string;
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
    template_id?: number;
    cores?: number;
    memory?: number;            // MB
    disk_size?: number;         // GB
    cloud_init_user?: string;
    cloud_init_password?: string;
    ssh_keys?: string;
    node?: string;
}

export interface UpdateVmDto {
    proxmox_id: number;
    cores?: number;
    memory?: number;
    disk?: string;
}

export interface ChangeVmStatusDto {
    proxmox_id: number;
}

export interface CreateSnapshotDto {
    proxmox_id: number;
    snapname: string;
    description?: string;
}

export interface SnapshotActionDto {
    proxmox_id: number;
    snapname: string;
}

// ── Tickets ────────────────────────────────────────────────
export interface CreateTicketDto {
    subject: string;
    message: string;
}

export interface Ticket {
    id: string;
    subject: string;
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
