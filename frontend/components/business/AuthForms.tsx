"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { authService, loginSchema, registerSchema, LoginCredentials, RegisterCredentials, AuthUser } from "@/services/auth.service";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface AuthFormsProps {
    onSuccess: (user: AuthUser) => void;
    defaultMode?: 'login' | 'register';
}

export function AuthForms({ onSuccess, defaultMode = 'login' }: AuthFormsProps) {
    const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
    const [error, setError] = useState<string | null>(null);

    return (
        <div className="max-w-md mx-auto">
            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                <button
                    onClick={() => setMode('login')}
                    className={cn(
                        "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                        mode === 'login' ? "bg-white shadow text-frilo-blue" : "text-gray-500 hover:text-gray-900"
                    )}
                >
                    Connexion
                </button>
                <button
                    onClick={() => setMode('register')}
                    className={cn(
                        "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                        mode === 'register' ? "bg-white shadow text-frilo-blue" : "text-gray-500 hover:text-gray-900"
                    )}
                >
                    Créer un compte
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4 flex items-center text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                </div>
            )}

            {mode === 'login' ? (
                <LoginForm onSuccess={onSuccess} onError={setError} />
            ) : (
                <RegisterForm onSuccess={onSuccess} onError={setError} />
            )}
        </div>
    );
}

function LoginForm({ onSuccess, onError }: { onSuccess: (u: AuthUser) => void, onError: (e: string) => void }) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginCredentials>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginCredentials) => {
        try {
            const user = await authService.login(data);
            onSuccess(user);
        } catch (e) {
            console.error(e);
            onError("Échec de la connexion. Vérifiez vos identifiants.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                    {...register("email")}
                    type="email"
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-frilo-blue focus:border-transparent"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input
                    {...register("password")}
                    type="password"
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-frilo-blue focus:border-transparent"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" variant="gradient" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Connexion..." : "Se connecter"}
            </Button>
        </form>
    );
}

function RegisterForm({ onSuccess, onError }: { onSuccess: (u: AuthUser) => void, onError: (e: string) => void }) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterCredentials>({
        resolver: zodResolver(registerSchema)
    });

    const onSubmit = async (data: RegisterCredentials) => {
        try {
            const user = await authService.register(data);
            onSuccess(user);
        } catch (e) {
            console.error(e);
            onError("Erreur lors de l'inscription.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                    {...register("name")}
                    type="text"
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-frilo-blue focus:border-transparent"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                    {...register("email")}
                    type="email"
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-frilo-blue focus:border-transparent"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                    <input
                        {...register("password")}
                        type="password"
                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-frilo-blue focus:border-transparent"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer</label>
                    <input
                        {...register("password_confirmation")}
                        type="password"
                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-frilo-blue focus:border-transparent"
                    />
                    {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>}
                </div>
            </div>
            <Button type="submit" variant="gradient" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Création du compte..." : "Créer mon compte"}
            </Button>
        </form>
    );
}
