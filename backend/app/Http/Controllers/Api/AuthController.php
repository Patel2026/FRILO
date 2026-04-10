<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ForgotPasswordRequest;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Requests\Api\ResetPasswordRequest;
use App\Http\Requests\Api\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    private const FORGOT_PASSWORD_MESSAGE = 'Si un compte existe avec cette adresse, un lien de réinitialisation a été envoyé.';

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'client',
            'is_active' => true,
            'sector_id' => (int) $request->sector_id,
        ]);
        $user->load('sector');

        $token = $user->createToken('frilo-client')->plainTextToken;

        Log::info('auth.register.success', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'token' => $token,
            'user' => $this->transformUser($user),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::with('sector')->where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            Log::warning('auth.login.failed', [
                'email' => $request->email,
                'ip' => $request->ip(),
            ]);

            return response()->json(['message' => 'Identifiants invalides.'], 401);
        }

        if (! $user->isActive()) {
            Log::warning('auth.login.blocked_inactive', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Votre compte est désactivé. Contactez le support FRILO.',
            ], 403);
        }

        $token = $user->createToken('frilo-client')->plainTextToken;

        Log::info('auth.login.success', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'token' => $token,
            'user' => $this->transformUser($user),
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink($request->only('email'));

        Log::info('auth.password_reset_link.requested', [
            'email' => $request->email,
            'status' => $status,
            'ip' => $request->ip(),
        ]);

        if ($status === Password::RESET_THROTTLED) {
            return response()->json([
                'message' => 'Une demande a déjà été faite récemment. Veuillez patienter avant de réessayer.',
            ], 429);
        }

        return response()->json([
            'message' => self::FORGOT_PASSWORD_MESSAGE,
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                $user->tokens()->delete();
                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            Log::info('auth.password_reset.success', [
                'email' => $request->email,
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Votre mot de passe a été réinitialisé avec succès.',
            ]);
        }

        if ($status === Password::INVALID_TOKEN) {
            return response()->json([
                'message' => 'Le lien de réinitialisation est invalide ou expiré.',
                'errors' => [
                    'token' => ['Le lien de réinitialisation est invalide ou expiré.'],
                ],
            ], 422);
        }

        if ($status === Password::INVALID_USER) {
            return response()->json([
                'message' => 'Aucun compte ne correspond à cette adresse e-mail.',
                'errors' => [
                    'email' => ['Aucun compte ne correspond à cette adresse e-mail.'],
                ],
            ], 422);
        }

        return response()->json([
            'message' => 'Impossible de réinitialiser le mot de passe pour le moment.',
        ], 422);
    }

    public function logout(Request $request): JsonResponse
    {
        Log::info('auth.logout', [
            'user_id' => $request->user()?->id,
            'ip' => $request->ip(),
        ]);

        $request->user()->currentAccessToken()->delete();

        return response()->json(null, 204);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->loadMissing('sector');

        return response()->json($this->transformUser($user));
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->fill($validated);
        $dirtyFields = array_keys($user->getDirty());

        if ($user->isDirty()) {
            $user->save();
        }

        Log::info('auth.profile.update', [
            'user_id' => $user->id,
            'email' => $user->email,
            'changed_fields' => $dirtyFields,
            'ip' => $request->ip(),
        ]);

        $user->loadMissing('sector');

        return response()->json($this->transformUser($user));
    }

    private function transformUser(User $user): array
    {
        $sector = $user->sector;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'is_active' => $user->is_active,
            'sector_id' => $user->sector_id,
            'sector' => $sector ? [
                'id' => $sector->id,
                'name' => $sector->name,
                'slug' => $sector->slug,
            ] : null,
        ];
    }
}
