import api from './api';
import { z } from 'zod';

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

export const authService = {
    async getCsrfCookie() {
        // Not needed for Token Auth
        // await api.get('/sanctum/csrf-cookie');
    },

    async login(credentials: LoginCredentials) {
        const response = await api.post('/login', credentials);
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        return response.data.user;
    },

    async register(credentials: RegisterCredentials) {
        const response = await api.post('/register', credentials);
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        return response.data.user;
    },

    async logout() {
        await api.post('/logout');
        localStorage.removeItem('auth_token');
    },

    async getUser() {
        try {
            const response = await api.get('/user');
            return response.data;
        } catch (error) {
            return null;
        }
    }
};
