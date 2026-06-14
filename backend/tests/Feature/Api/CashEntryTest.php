<?php

namespace Tests\Feature\Api;

use App\Models\CashEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CashEntryTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_list_entries_by_month(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        CashEntry::factory(3)->create(['user_id' => $user->id, 'entry_date' => '2026-06-10']);
        CashEntry::factory(2)->create(['user_id' => $user->id, 'entry_date' => '2026-05-10']);
        $other = User::factory()->create(['role' => 'client']);
        CashEntry::factory()->create(['user_id' => $other->id, 'entry_date' => '2026-06-10']);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/cash?month=2026-06')
            ->assertOk()
            ->assertJsonPath('meta.total', 3);
    }

    public function test_summary_returns_correct_totals(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        CashEntry::factory()->create(['user_id' => $user->id, 'type' => 'income',  'amount' => 50000, 'entry_date' => '2026-06-01']);
        CashEntry::factory()->create(['user_id' => $user->id, 'type' => 'income',  'amount' => 30000, 'entry_date' => '2026-06-15']);
        CashEntry::factory()->create(['user_id' => $user->id, 'type' => 'expense', 'amount' => 20000, 'entry_date' => '2026-06-10']);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/cash/summary?month=2026-06')
            ->assertOk()
            ->assertJsonPath('income',   80000)
            ->assertJsonPath('expenses', 20000)
            ->assertJsonPath('balance',  60000);
    }

    public function test_client_can_create_entry(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/cash', [
                'type'       => 'income',
                'amount'     => 15000,
                'label'      => 'Vente chemise',
                'entry_date' => '2026-06-14',
            ])
            ->assertCreated()
            ->assertJsonPath('amount', 15000)
            ->assertJsonPath('type', 'income');
    }

    public function test_client_cannot_update_other_users_entry(): void
    {
        $user  = User::factory()->create(['role' => 'client']);
        $other = User::factory()->create(['role' => 'client']);
        $entry = CashEntry::factory()->create(['user_id' => $other->id]);

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/cash/{$entry->id}", [
                'type' => 'income', 'amount' => 1,
                'label' => 'Hack', 'entry_date' => '2026-06-01',
            ])
            ->assertForbidden();
    }

    public function test_client_can_delete_own_entry(): void
    {
        $user  = User::factory()->create(['role' => 'client']);
        $entry = CashEntry::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/cash/{$entry->id}")
            ->assertNoContent();
    }

    public function test_amount_must_be_positive_integer(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/cash', [
                'type'       => 'income',
                'amount'     => -500,
                'label'      => 'Test',
                'entry_date' => '2026-06-14',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['amount']);
    }
}
