// src/types/auth.ts

export type UserRole = 'user' | 'admin-corporate' | 'admin';

export interface User {
    id?: string;
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    surName?: string;
    phoneNumber?: string;
    name?: string; // For display compatibility
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
    password?: string; // required to confirm identity when updating info based on architecture.md
}
