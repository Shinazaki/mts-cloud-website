// src/types/auth.ts

export interface User {
    id?: string;
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    surName?: string;
    phoneNumber?: string;
    name?: string; // For display compatibility
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
