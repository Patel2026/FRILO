import api from './api';
import { z } from 'zod';

const AUTH_CHANGED_EVENT = 'frilo-auth-changed';

function emitAuthChanged() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    }
}

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password_confirmation"],
});

export type LoginCredentials = z.infer<typeof loginSchema>;
export type RegisterCredentials = z.infer<typeof registerSchema>;

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: 'client' | 'admin';
}

export const authService = {
    AUTH_CHANGED_EVENT,

    async getCsrfCookie() {
        // Not needed for Token Auth
        // await api.get('/sanctum/csrf-cookie');
    },

    async login(credentials: LoginCredentials): Promise<AuthUser> {
        const response = await api.post('/login', credentials);
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            emitAuthChanged();
        }
        return response.data.user;
    },

    async register(credentials: RegisterCredentials): Promise<AuthUser> {
        const response = await api.post('/register', credentials);
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            emitAuthChanged();
        }
        return response.data.user;
    },

    async logout() {
        try {
            await api.post('/logout');
        } finally {
            localStorage.removeItem('auth_token');
            emitAuthChanged();
        }
    },

    async getUser(): Promise<AuthUser | null> {
        try {
            const response = await api.get('/user');
            return response.data;
        } catch {
            return null;
        }
    }
};
