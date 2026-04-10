<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_returns_token_and_user_payload(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Client Test',
            'email' => 'client.test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'name', 'email', 'role'],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'client.test@example.com',
            'role' => 'client',
        ]);
    }

    public function test_login_user_and_logout_flow(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret123'),
        ]);

        $login = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'secret123',
        ]);

        $login->assertOk()->assertJsonStructure(['token', 'user']);
        $token = $login->json('token');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('id', $user->id);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/logout')
            ->assertNoContent();
    }

    public function test_login_with_invalid_credentials_returns_unauthorized(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret123'),
        ]);

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])->assertUnauthorized();
    }

    public function test_authenticated_user_can_update_profile_name_and_email(): void
    {
        $user = User::factory()->create([
            'name' => 'Client Initial',
            'email' => 'client.initial@example.com',
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this
            ->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/user', [
                'name' => 'Client Final',
                'email' => 'client.final@example.com',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('name', 'Client Final')
            ->assertJsonPath('email', 'client.final@example.com');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Client Final',
            'email' => 'client.final@example.com',
        ]);
    }

    public function test_profile_update_rejects_email_already_used_by_another_user(): void
    {
        $user = User::factory()->create([
            'email' => 'owner@example.com',
        ]);
        $existing = User::factory()->create([
            'email' => 'existing@example.com',
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this
            ->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/user', [
                'name' => 'Owner Updated',
                'email' => $existing->email,
            ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }
}
