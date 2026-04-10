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
            'order_reference' => 'ord-42',
            'subject' => 'Question sur un template',
            'message' => 'Bonjour, je souhaite des précisions avant de passer commande.',
            'accepted_terms' => true,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('status', 'new')
            ->assertJsonPath('order_reference', '#ORD-42')
            ->assertJsonStructure(['id', 'status', 'message', 'created_at']);

        $this->assertDatabaseHas('contact_requests', [
            'email' => 'client@example.com',
            'subject' => 'Question sur un template',
            'order_reference' => '#ORD-42',
            'status' => 'new',
        ]);
    }

    public function test_contact_request_validation_errors_return_422(): void
    {
        $response = $this->postJson('/api/contact', [
            'name' => '',
            'email' => 'not-an-email',
            'order_reference' => 'BADREF-001',
            'subject' => '',
            'message' => 'court',
            'accepted_terms' => false,
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'order_reference', 'subject', 'message', 'accepted_terms']);
    }

    public function test_contact_endpoint_is_rate_limited(): void
    {
        $payload = [
            'name' => 'Client FRILO',
            'email' => 'rate-limit@example.com',
            'subject' => 'Demande rapide',
            'message' => 'Message de test suffisamment long pour passer la validation.',
            'accepted_terms' => true,
        ];

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/contact', $payload)->assertCreated();
        }

        $this->postJson('/api/contact', $payload)->assertStatus(429);
    }
}
