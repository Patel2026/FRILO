<?php

namespace Tests\Feature\Admin;

use App\Models\FaqItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FaqAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);
    }

    public function test_super_admin_can_create_and_update_faq(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);

        $this->actingAs($superAdmin)
            ->post('/admin/faqs', [
                'question' => 'Comment fonctionne la commande FRILO ?',
                'answer' => 'Vous choisissez un modele, vous completez vos informations, puis notre equipe livre le site.',
                'sort_order' => 15,
                'is_published' => 1,
            ])
            ->assertRedirect('/admin/faqs');

        $faq = FaqItem::query()->firstOrFail();

        $this->assertDatabaseHas('faq_items', [
            'id' => $faq->id,
            'question' => 'Comment fonctionne la commande FRILO ?',
            'sort_order' => 15,
            'is_published' => true,
        ]);

        $this->assertDatabaseHas('admin_audit_logs', [
            'event' => 'faq.created',
            'actor_id' => $superAdmin->id,
            'target_type' => 'faq_item',
            'target_id' => (string) $faq->id,
        ]);

        $this->actingAs($superAdmin)
            ->put('/admin/faqs/'.$faq->id, [
                'question' => 'Comment fonctionne une commande FRILO ?',
                'answer' => 'Le client choisit un template, partage ses contenus puis suit la livraison depuis son tableau de bord.',
                'sort_order' => 25,
            ])
            ->assertRedirect('/admin/faqs');

        $this->assertDatabaseHas('faq_items', [
            'id' => $faq->id,
            'question' => 'Comment fonctionne une commande FRILO ?',
            'sort_order' => 25,
            'is_published' => false,
        ]);

        $this->assertDatabaseHas('admin_audit_logs', [
            'event' => 'faq.updated',
            'actor_id' => $superAdmin->id,
            'target_type' => 'faq_item',
            'target_id' => (string) $faq->id,
        ]);
    }

    public function test_client_cannot_access_faq_admin_screen(): void
    {
        $client = User::factory()->create(['role' => 'client']);

        $this->actingAs($client)
            ->get('/admin/faqs')
            ->assertForbidden();
    }
}
