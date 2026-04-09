<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_user_can_submit_contact_request(): void
    {
        $response = $this->postJson('/api/contact', [
            'name' => 'Client FRILO',
            'email' => 'client@example.com',
            'phone' => '+22900000000',
            'company' => 'Entreprise Test',
            'subject' => 'Question sur un template',
            'message' => 'Bonjour, je souhaite des précisions avant de passer commande.',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('status', 'new')
            ->assertJsonStructure(['id', 'status', 'message', 'created_at']);

        $this->assertDatabaseHas('contact_requests', [
            'email' => 'client@example.com',
            'subject' => 'Question sur un template',
            'status' => 'new',
        ]);
    }

    public function test_contact_request_validation_errors_return_422(): void
    {
        $response = $this->postJson('/api/contact', [
            'name' => '',
            'email' => 'not-an-email',
            'subject' => '',
            'message' => 'court',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'subject', 'message']);
    }

    public function test_contact_endpoint_is_rate_limited(): void
    {
        $payload = [
            'name' => 'Client FRILO',
            'email' => 'rate-limit@example.com',
            'subject' => 'Demande rapide',
            'message' => 'Message de test suffisamment long pour passer la validation.',
        ];

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/contact', $payload)->assertCreated();
        }

        $this->postJson('/api/contact', $payload)->assertStatus(429);
    }
}
