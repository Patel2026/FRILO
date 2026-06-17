import axios from 'axios';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_CHANGED_EVENT = 'frilo-auth-changed';
const AUTH_FORBIDDEN_EVENT = 'frilo-api-forbidden';

function isAuthRoute(url?: string): boolean {
    if (!url) return false;
    return url.endsWith('/login') || url.endsWith('/register');
}

function clearClientSession(): void {
    if (typeof window === 'undefined') {
        return;
    }

    const hadToken = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
    localStorage.removeItem(AUTH_TOKEN_KEY);

    if (hadToken) {
        window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    }
}

function getApiBaseUrl(): string {
    if (typeof window !== 'undefined') {
        return '/api/frilo';
    }

    return process.env.API_INTERNAL_URL
        || process.env.NEXT_PUBLIC_API_URL
        || 'http://localhost:8000/api';
}

const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!axios.isAxiosError(error)) {
            return Promise.reject(error);
        }

        const status = error.response?.status;
        const url = error.config?.url;

        if (status === 401 && !isAuthRoute(url)) {
            clearClientSession();

            if (typeof window !== 'undefined') {
                const currentPath = window.location.pathname;
                const isProtectedPage = currentPath.startsWith('/dashboard');

                if (isProtectedPage) {
                    window.location.assign('/login?reason=session-expired');
                }
            }
        }

        if (status === 403 && typeof window !== 'undefined') {
            window.dispatchEvent(new Event(AUTH_FORBIDDEN_EVENT));
        }

        return Promise.reject(error);
    }
);

export default api;
