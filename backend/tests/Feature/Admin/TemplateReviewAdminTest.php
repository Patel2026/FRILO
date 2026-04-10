<?php

namespace Tests\Feature\Admin;

use App\Models\Sector;
use App\Models\Template;
use App\Models\TemplateReview;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TemplateReviewAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);
    }

    public function test_super_admin_can_moderate_and_feature_review(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        $review = $this->createReview();

        $this->actingAs($superAdmin)
            ->patch('/admin/reviews/'.$review->id, [
                'status' => TemplateReview::STATUS_APPROVED,
                'is_featured' => 1,
                'featured_rank' => 1,
            ])
            ->assertRedirect('/admin/reviews');

        $this->assertDatabaseHas('template_reviews', [
            'id' => $review->id,
            'status' => TemplateReview::STATUS_APPROVED,
            'is_featured' => true,
            'featured_rank' => 1,
            'approved_by' => $superAdmin->id,
        ]);
        $this->assertDatabaseHas('admin_audit_logs', [
            'event' => 'template.review.moderated',
            'actor_id' => $superAdmin->id,
            'target_type' => 'template_review',
            'target_id' => (string) $review->id,
        ]);
    }

    public function test_client_cannot_access_review_admin_screen(): void
    {
        $client = User::factory()->create(['role' => 'client']);

        $this->actingAs($client)
            ->get('/admin/reviews')
            ->assertForbidden();
    }

    private function createReview(): TemplateReview
    {
        $sector = Sector::create([
            'name' => 'Secteur Admin Avis',
            'slug' => 'secteur-admin-avis-'.uniqid(),
            'description' => 'Description',
            'icon' => 'Store',
            'gradient' => 'from-indigo-500 to-cyan-400',
            'is_active' => true,
        ]);

        $template = Template::create([
            'sector_id' => $sector->id,
            'name' => 'Template Admin Avis',
            'slug' => 'template-admin-avis-'.uniqid(),
            'description' => 'Description',
            'price' => 50000,
            'features' => ['A', 'B'],
            'is_active' => true,
        ]);

        $client = User::factory()->create(['role' => 'client']);

        return TemplateReview::create([
            'user_id' => $client->id,
            'template_id' => $template->id,
            'rating' => 5,
            'content' => 'Un avis client en attente de moderation pour le backoffice.',
            'status' => TemplateReview::STATUS_PENDING,
        ]);
    }
}
