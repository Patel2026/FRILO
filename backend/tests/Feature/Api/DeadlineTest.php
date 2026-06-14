<?php

namespace Tests\Feature\Api;

use App\Models\Deadline;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeadlineTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_sees_system_deadlines_and_own_personal(): void
    {
        $user  = User::factory()->create(['role' => 'client']);
        $other = User::factory()->create(['role' => 'client']);

        Deadline::factory()->create(['is_system' => true,  'user_id' => null]);
        Deadline::factory()->create(['is_system' => false, 'user_id' => $user->id]);
        Deadline::factory()->create(['is_system' => false, 'user_id' => $other->id]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/deadlines')
            ->assertOk()
            ->assertJsonCount(2);
    }

    public function test_client_can_create_personal_deadline(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/deadlines', [
                'title'    => 'Déclaration TVA',
                'due_date' => '2026-07-15',
            ])
            ->assertCreated()
            ->assertJsonPath('title', 'Déclaration TVA')
            ->assertJsonPath('is_system', false);
    }

    public function test_client_cannot_update_system_deadline(): void
    {
        $user     = User::factory()->create(['role' => 'client']);
        $deadline = Deadline::factory()->create(['is_system' => true, 'user_id' => null]);

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/deadlines/{$deadline->id}", [
                'title'    => 'Hacked',
                'due_date' => '2026-01-01',
            ])
            ->assertForbidden();
    }

    public function test_client_cannot_delete_system_deadline(): void
    {
        $user     = User::factory()->create(['role' => 'client']);
        $deadline = Deadline::factory()->create(['is_system' => true, 'user_id' => null]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/deadlines/{$deadline->id}")
            ->assertForbidden();
    }

    public function test_client_can_delete_own_personal_deadline(): void
    {
        $user     = User::factory()->create(['role' => 'client']);
        $deadline = Deadline::factory()->create(['is_system' => false, 'user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/deadlines/{$deadline->id}")
            ->assertNoContent();
    }

    public function test_deadline_includes_days_remaining(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        Deadline::factory()->create([
            'is_system' => true,
            'user_id'   => null,
            'due_date'  => now()->addDays(5)->toDateString(),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/deadlines')
            ->assertOk();

        $this->assertArrayHasKey('days_remaining', $response->json()[0]);
    }
}
