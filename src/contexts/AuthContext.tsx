// src/contexts/AuthContext.tsx
import { createContext } from 'react';
import type { User } from '../types/auth';

export interface AuthContextType {
    token: string | null;
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
