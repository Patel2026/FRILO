<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthRoutingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['frilo.admin_entry_path' => 'frilo-console']);

        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);
    }

    public function test_guest_admin_redirects_to_private_admin_entry(): void
    {
        $this->get('/admin')
            ->assertRedirect('/frilo-console');
    }

    public function test_private_admin_entry_displays_laravel_admin_login(): void
    {
        $this->get('/frilo-console')
            ->assertOk()
            ->assertSee('Connexion admin')
            ->assertSee('Connectez-vous avec votre compte FRILO actif pour accéder au pilotage interne.', false);
    }

    public function test_public_login_is_not_laravel_admin_login(): void
    {
        $this->get('/login')
            ->assertNotFound();
    }

    public function test_predictable_admin_login_path_is_not_available(): void
    {
        $this->get('/admin/login')
            ->assertNotFound();
    }

    public function test_super_admin_can_login_from_private_admin_entry(): void
    {
        $admin = User::factory()->create([
            'role' => 'super_admin',
            'email' => 'admin@frilo.test',
            'password' => bcrypt('password'),
            'is_active' => true,
        ]);

        $this->post('/frilo-console', [
            'email' => $admin->email,
            'password' => 'password',
        ])->assertRedirect('/admin/dashboard');

        $this->assertAuthenticatedAs($admin);
    }

    public function test_client_cannot_login_to_admin_surface(): void
    {
        $client = User::factory()->create([
            'role' => 'client',
            'email' => 'client@frilo.test',
            'password' => bcrypt('password'),
            'is_active' => true,
        ]);

        $this->post('/frilo-console', [
            'email' => $client->email,
            'password' => 'password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_inactive_super_admin_cannot_login_to_admin_surface(): void
    {
        $admin = User::factory()->create([
            'role' => 'super_admin',
            'email' => 'inactive-admin@frilo.test',
            'password' => bcrypt('password'),
            'is_active' => false,
        ]);

        $this->post('/frilo-console', [
            'email' => $admin->email,
            'password' => 'password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }
}
