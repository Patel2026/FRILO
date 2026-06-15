<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTopbarTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_topbar_uses_configured_frontend_url(): void
    {
        config(['app.frontend_url' => 'http://161.97.79.213']);

        $admin = User::factory()->create(['role' => 'super_admin']);

        $this->actingAs($admin)
            ->get('/admin/dashboard')
            ->assertOk()
            ->assertSee('href="http://161.97.79.213"', false)
            ->assertDontSee('href="http://localhost:3000"', false);
    }
}
