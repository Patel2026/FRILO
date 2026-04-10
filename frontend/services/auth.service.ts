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

export const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

export const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
    sector_id: z.number({ message: 'Veuillez sélectionner votre domaine d’activité' })
        .int()
        .positive('Veuillez sélectionner votre domaine d’activité'),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password_confirmation"],
});

export const updateProfileSchema = z.object({
    name: z.string().min(2).max(255),
    email: z.string().email(),
    sector_id: z.number().int().positive().nullable().optional(),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password_confirmation"],
});

export type LoginCredentials = z.infer<typeof loginSchema>;
export type ForgotPasswordPayload = z.infer<typeof forgotPasswordSchema>;
export type RegisterCredentials = z.infer<typeof registerSchema>;
export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;
export type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>;

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: 'client' | 'super_admin';
    is_active: boolean;
    sector_id: number | null;
    sector: {
        id: number;
        name: string;
        slug: string;
    } | null;
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
    },

    async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
        const validatedPayload = updateProfileSchema.parse(payload);
        const response = await api.put('/user', validatedPayload);
        emitAuthChanged();
        return response.data as AuthUser;
    },

    async requestPasswordReset(payload: ForgotPasswordPayload): Promise<string> {
        const validatedPayload = forgotPasswordSchema.parse(payload);
        const response = await api.post('/forgot-password', validatedPayload);
        return (response.data?.message as string) || 'Demande envoyée.';
    },

    async resetPassword(payload: ResetPasswordPayload): Promise<string> {
        const validatedPayload = resetPasswordSchema.parse(payload);
        const response = await api.post('/reset-password', validatedPayload);
        return (response.data?.message as string) || 'Mot de passe mis à jour.';
    },
};
