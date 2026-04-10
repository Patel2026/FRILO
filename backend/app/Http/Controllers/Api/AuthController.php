<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Requests\Api\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'client',
        ]);

        $token = $user->createToken('frilo-client')->plainTextToken;

        Log::info('auth.register.success', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'token' => $token,
            'user' => $user->only('id', 'name', 'email', 'role'),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            Log::warning('auth.login.failed', [
                'email' => $request->email,
                'ip' => $request->ip(),
            ]);

            return response()->json(['message' => 'Identifiants invalides.'], 401);
        }

        $token = $user->createToken('frilo-client')->plainTextToken;

        Log::info('auth.login.success', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'token' => $token,
            'user' => $user->only('id', 'name', 'email', 'role'),
        ]);
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
        return response()->json($request->user()->only('id', 'name', 'email', 'role'));
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

        return response()->json($user->only('id', 'name', 'email', 'role'));
    }
}
