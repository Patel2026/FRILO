<?php

namespace Tests\Feature\Api;

use App\Models\ClientContact;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientContactTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_list_own_contacts(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        ClientContact::factory(3)->create(['user_id' => $user->id]);
        $other = User::factory()->create(['role' => 'client']);
        ClientContact::factory(2)->create(['user_id' => $other->id]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/contacts')
            ->assertOk()
            ->assertJsonPath('meta.total', 3);
    }

    public function test_client_can_create_contact(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/contacts', [
                'name'    => 'Koffi Martin',
                'phone'   => '+22996000001',
                'company' => 'Boutique Koffi',
            ])
            ->assertCreated()
            ->assertJsonPath('name', 'Koffi Martin');
    }

    public function test_client_cannot_view_other_users_contact(): void
    {
        $user  = User::factory()->create(['role' => 'client']);
        $other = User::factory()->create(['role' => 'client']);
        $contact = ClientContact::factory()->create(['user_id' => $other->id]);

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/contacts/{$contact->id}")
            ->assertForbidden();
    }

    public function test_client_can_update_own_contact(): void
    {
        $user    = User::factory()->create(['role' => 'client']);
        $contact = ClientContact::factory()->create(['user_id' => $user->id, 'name' => 'Avant']);

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/contacts/{$contact->id}", ['name' => 'Après'])
            ->assertOk()
            ->assertJsonPath('name', 'Après');
    }

    public function test_client_can_delete_own_contact(): void
    {
        $user    = User::factory()->create(['role' => 'client']);
        $contact = ClientContact::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/contacts/{$contact->id}")
            ->assertNoContent();
    }

    public function test_unauthenticated_cannot_access_contacts(): void
    {
        $this->getJson('/api/contacts')->assertUnauthorized();
    }

    public function test_name_is_required(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/contacts', ['phone' => '+22996000001'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }
}
