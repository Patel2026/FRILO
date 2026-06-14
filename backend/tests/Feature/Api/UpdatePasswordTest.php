<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UpdatePasswordTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_change_password(): void
    {
        $user = User::factory()->create([
            'role' => 'client',
            'is_active' => true,
            'password' => Hash::make('OldPassword1!'),
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->putJson('/api/user/password', [
            'current_password' => 'OldPassword1!',
            'password' => 'NewPassword2@',
            'password_confirmation' => 'NewPassword2@',
        ]);

        $response->assertOk();
        $response->assertJson(['message' => 'Mot de passe mis à jour.']);
        $this->assertTrue(Hash::check('NewPassword2@', $user->fresh()->password));
    }

    public function test_wrong_current_password_returns_422(): void
    {
        $user = User::factory()->create([
            'role' => 'client',
            'is_active' => true,
            'password' => Hash::make('CorrectPassword1!'),
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->putJson('/api/user/password', [
            'current_password' => 'WrongPassword!',
            'password' => 'NewPassword2@',
            'password_confirmation' => 'NewPassword2@',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['current_password']);
    }

    public function test_password_confirmation_mismatch_returns_422(): void
    {
        $user = User::factory()->create([
            'role' => 'client',
            'is_active' => true,
            'password' => Hash::make('OldPassword1!'),
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->putJson('/api/user/password', [
            'current_password' => 'OldPassword1!',
            'password' => 'NewPassword2@',
            'password_confirmation' => 'DifferentPassword!',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    public function test_unauthenticated_user_cannot_change_password(): void
    {
        $response = $this->putJson('/api/user/password', [
            'current_password' => 'anything',
            'password' => 'NewPassword2@',
            'password_confirmation' => 'NewPassword2@',
        ]);

        $response->assertUnauthorized();
    }
}
