<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);
    }

    public function test_super_admin_can_deactivate_client_and_revoke_tokens(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        $client = User::factory()->create([
            'role' => 'client',
            'is_active' => true,
        ]);
        $client->createToken('client-token');

        $this->actingAs($superAdmin)
            ->patch('/admin/clients/'.$client->id.'/active', [
                'is_active' => 0,
            ])
            ->assertRedirect('/admin/clients/'.$client->id);

        $this->assertDatabaseHas('users', [
            'id' => $client->id,
            'is_active' => false,
        ]);
        $this->assertDatabaseCount('personal_access_tokens', 0);

        $this->assertDatabaseHas('admin_audit_logs', [
            'event' => 'client.account.toggled',
            'actor_id' => $superAdmin->id,
            'target_type' => 'user',
            'target_id' => (string) $client->id,
        ]);
    }

    public function test_client_cannot_access_client_activation_route(): void
    {
        $clientActor = User::factory()->create(['role' => 'client']);
        $clientTarget = User::factory()->create(['role' => 'client']);

        $this->actingAs($clientActor)
            ->patch('/admin/clients/'.$clientTarget->id.'/active', [
                'is_active' => 0,
            ])
            ->assertForbidden();

        $this->assertDatabaseHas('users', [
            'id' => $clientTarget->id,
            'is_active' => true,
        ]);
    }
}
