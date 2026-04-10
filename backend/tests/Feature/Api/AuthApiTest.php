<?php

namespace Tests\Feature\Api;

use App\Models\Sector;
use App\Models\User;
use App\Notifications\ClientResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_returns_token_and_user_payload(): void
    {
        $sector = $this->createActiveSector();

        $response = $this->postJson('/api/register', [
            'name' => 'Client Test',
            'email' => 'client.test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'sector_id' => $sector->id,
        ]);

        $response
            ->assertCreated()
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'name', 'email', 'role', 'sector_id', 'sector' => ['id', 'name', 'slug']],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'client.test@example.com',
            'role' => 'client',
            'sector_id' => $sector->id,
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

    public function test_authenticated_user_can_update_activity_sector(): void
    {
        $currentSector = $this->createActiveSector();
        $newSector = $this->createActiveSector();

        $user = User::factory()->create([
            'name' => 'Client Sector',
            'email' => 'client.sector@example.com',
            'sector_id' => $currentSector->id,
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this
            ->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/user', [
                'name' => 'Client Sector',
                'email' => 'client.sector@example.com',
                'sector_id' => $newSector->id,
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('sector_id', $newSector->id)
            ->assertJsonPath('sector.id', $newSector->id);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'sector_id' => $newSector->id,
        ]);
    }

    public function test_register_rejects_missing_sector_id(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Client Test',
            'email' => 'client.no.sector@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['sector_id']);
    }

    public function test_forgot_password_sends_reset_link_notification_for_existing_user(): void
    {
        Notification::fake();
        $user = User::factory()->create([
            'email' => 'reset.client@example.com',
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => $user->email,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Si un compte existe avec cette adresse, un lien de réinitialisation a été envoyé.');

        Notification::assertSentTo($user, ClientResetPasswordNotification::class);
    }

    public function test_forgot_password_returns_generic_message_for_unknown_email(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'unknown-user@example.com',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Si un compte existe avec cette adresse, un lien de réinitialisation a été envoyé.');

        Notification::assertNothingSent();
    }

    public function test_reset_password_updates_password_with_valid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'reset.valid@example.com',
            'password' => Hash::make('old-password-123'),
        ]);

        $token = Password::broker()->createToken($user);

        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Votre mot de passe a été réinitialisé avec succès.');

        $this->assertTrue(Hash::check('new-password-123', $user->fresh()->password));
    }

    public function test_reset_password_rejects_invalid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'reset.invalid@example.com',
        ]);

        $response = $this->postJson('/api/reset-password', [
            'token' => 'invalid-token',
            'email' => $user->email,
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['token']);
    }

    private function createActiveSector(): Sector
    {
        return Sector::create([
            'name' => 'Secteur Auth Test',
            'slug' => 'secteur-auth-test-'.uniqid(),
            'description' => 'Secteur test pour auth',
            'icon' => 'Store',
            'gradient' => 'from-indigo-400 to-cyan-500',
            'is_active' => true,
        ]);
    }
}
