<?php

namespace Tests\Feature\Api;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Sector;
use App\Models\Template;
use App\Models\TemplateReview;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TemplateReviewApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_submit_review_for_purchased_template(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        $template = $this->createTemplate();

        Order::create([
            'user_id' => $client->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Completed->value,
            'payment_status' => PaymentStatus::Paid->value,
            'price' => 50000,
            'paid_at' => now(),
        ]);

        Sanctum::actingAs($client);

        $response = $this->postJson('/api/templates/'.$template->id.'/reviews', [
            'rating' => 5,
            'content' => 'Le rendu final est excellent, la livraison a ete rapide et le template colle parfaitement a mon activite.',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('review.status', TemplateReview::STATUS_PENDING)
            ->assertJsonPath('review.rating', 5);

        $this->assertDatabaseHas('template_reviews', [
            'user_id' => $client->id,
            'template_id' => $template->id,
            'rating' => 5,
            'status' => TemplateReview::STATUS_PENDING,
        ]);
    }

    public function test_client_cannot_submit_review_without_purchase(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        $template = $this->createTemplate();

        Sanctum::actingAs($client);

        $this->postJson('/api/templates/'.$template->id.'/reviews', [
            'rating' => 4,
            'content' => 'Avis sans achat, cela ne devrait pas etre autorise par la plateforme.',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['template']);
    }

    public function test_testimonials_endpoint_returns_only_approved_reviews(): void
    {
        $template = $this->createTemplate();
        $featuredClient = User::factory()->create(['role' => 'client', 'name' => 'Client Vedette']);
        $approvedClient = User::factory()->create(['role' => 'client', 'name' => 'Client Approuve']);
        $pendingClient = User::factory()->create(['role' => 'client', 'name' => 'Client Pending']);

        TemplateReview::create([
            'user_id' => $featuredClient->id,
            'template_id' => $template->id,
            'rating' => 5,
            'content' => 'Avis mis en avant pour la homepage avec un excellent resultat.',
            'status' => TemplateReview::STATUS_APPROVED,
            'is_featured' => true,
            'featured_rank' => 1,
            'approved_at' => now(),
        ]);

        TemplateReview::create([
            'user_id' => $approvedClient->id,
            'template_id' => $template->id,
            'rating' => 4,
            'content' => 'Avis approuve secondaire qui peut servir de secours si besoin.',
            'status' => TemplateReview::STATUS_APPROVED,
            'is_featured' => false,
            'approved_at' => now()->subHour(),
        ]);

        TemplateReview::create([
            'user_id' => $pendingClient->id,
            'template_id' => $template->id,
            'rating' => 5,
            'content' => 'Avis en attente qui ne doit jamais apparaitre publiquement.',
            'status' => TemplateReview::STATUS_PENDING,
        ]);

        $response = $this->getJson('/api/testimonials?limit=2');

        $response
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.reviewer_name', 'Client Vedette')
            ->assertJsonPath('1.reviewer_name', 'Client Approuve');

        $templateReviews = $this->getJson('/api/templates/'.$template->id.'/reviews');
        $templateReviews
            ->assertOk()
            ->assertJsonPath('summary.count', 2)
            ->assertJsonCount(2, 'data');
    }

    private function createTemplate(int $price = 50000): Template
    {
        $sector = Sector::create([
            'name' => 'Secteur Avis Test',
            'slug' => 'secteur-avis-test-'.uniqid(),
            'description' => 'Description',
            'icon' => 'Store',
            'gradient' => 'from-indigo-500 to-cyan-400',
            'is_active' => true,
        ]);

        return Template::create([
            'sector_id' => $sector->id,
            'name' => 'Template Avis Test',
            'slug' => 'template-avis-test-'.uniqid(),
            'description' => 'Description',
            'price' => $price,
            'features' => ['A', 'B'],
            'is_active' => true,
        ]);
    }
}
