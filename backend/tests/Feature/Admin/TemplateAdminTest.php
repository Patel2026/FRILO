<?php

namespace Tests\Feature\Admin;

use App\Models\Sector;
use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TemplateAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);
    }

    public function test_template_pricing_fields_are_cast_and_effective_price_prefers_promo(): void
    {
        $sector = Sector::create([
            'name' => 'Services',
            'slug' => 'services',
            'description' => 'Secteur test',
            'icon' => 'Briefcase',
            'gradient' => 'from-blue-500 to-purple-600',
            'is_active' => true,
        ]);

        $template = Template::create([
            'sector_id' => $sector->id,
            'name' => 'Service Pro',
            'slug' => 'service-pro',
            'description' => 'Template test',
            'price' => 35000,
            'normal_price' => 50000,
            'promo_price' => 35000,
            'features' => ['Ancienne feature'],
            'target_audience' => ['Commercants', 'Independants'],
            'included_features' => ['Site 5 pages', 'Hebergement 1 an'],
            'is_active' => true,
        ]);

        $this->assertSame(50000, $template->normal_price);
        $this->assertSame(35000, $template->promo_price);
        $this->assertSame(35000, $template->effective_price);
        $this->assertSame(['Commercants', 'Independants'], $template->target_audience);
        $this->assertSame(['Site 5 pages', 'Hebergement 1 an'], $template->included_features);
    }

    public function test_super_admin_can_create_template_with_normal_and_promo_price(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'super_admin']);
        $sector = Sector::create([
            'name' => 'Restaurants',
            'slug' => 'restaurants',
            'description' => 'Secteur test',
            'icon' => 'Utensils',
            'gradient' => 'from-orange-400 to-red-500',
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->post('/admin/templates', [
                'sector_id' => $sector->id,
                'name' => 'Restaurant Promo',
                'description' => 'Template restaurant',
                'normal_price' => 50000,
                'promo_price' => 35000,
                'target_audience_raw' => "Restaurants\nMaquis\nSnacks",
                'included_features_raw' => "Site 5 pages\nHebergement 1 an\nSSL securise",
                'features_raw' => 'Legacy feature',
                'preview_source' => 'external',
                'preview_url' => 'https://demo.example.com',
                'preview_pages_raw' => "Accueil|/\nMenu|/menu",
                'preview_gallery_raw' => 'https://images.example.com/home.jpg',
                'is_active' => 1,
                'thumbnail' => UploadedFile::fake()->image('restaurant.jpg'),
            ])
            ->assertRedirect('/admin/templates');

        $template = Template::query()->where('slug', 'restaurant-promo')->firstOrFail();

        $this->assertSame(50000, $template->normal_price);
        $this->assertSame(35000, $template->promo_price);
        $this->assertSame(35000, $template->price);
        $this->assertSame(['Restaurants', 'Maquis', 'Snacks'], $template->target_audience);
        $this->assertSame(['Site 5 pages', 'Hebergement 1 an', 'SSL securise'], $template->included_features);
        $this->assertNotNull($template->thumbnail);
        Storage::disk('public')->assertExists($template->thumbnail);
    }

    public function test_super_admin_can_update_template_and_effective_price_falls_back_to_normal_price(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        $sector = Sector::create([
            'name' => 'BTP',
            'slug' => 'btp',
            'description' => 'Secteur test',
            'icon' => 'HardHat',
            'gradient' => 'from-slate-500 to-slate-700',
            'is_active' => true,
        ]);
        $template = Template::create([
            'sector_id' => $sector->id,
            'name' => 'BTP Old',
            'slug' => 'btp-old',
            'description' => 'Ancien',
            'price' => 35000,
            'normal_price' => 50000,
            'promo_price' => 35000,
            'features' => ['Legacy'],
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->put('/admin/templates/'.$template->id, [
                'sector_id' => $sector->id,
                'name' => 'BTP Standard',
                'description' => 'Mis a jour',
                'normal_price' => 50000,
                'promo_price' => null,
                'target_audience_raw' => "Artisans\nEntreprises BTP",
                'included_features_raw' => "Site 5 pages\nFormulaire de contact",
                'features_raw' => 'Legacy',
                'preview_source' => 'external',
                'preview_url' => null,
                'preview_pages_raw' => '',
                'preview_gallery_raw' => '',
                'is_active' => 1,
            ])
            ->assertRedirect('/admin/templates');

        $template->refresh();

        $this->assertSame('BTP Standard', $template->name);
        $this->assertSame(50000, $template->normal_price);
        $this->assertNull($template->promo_price);
        $this->assertSame(50000, $template->price);
        $this->assertSame(['Artisans', 'Entreprises BTP'], $template->target_audience);
        $this->assertSame(['Site 5 pages', 'Formulaire de contact'], $template->included_features);
    }

    public function test_template_form_exposes_pricing_and_content_sections(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);

        $this->actingAs($admin)
            ->get('/admin/templates/create')
            ->assertOk()
            ->assertSee('Prix normal')
            ->assertSee('Prix promo')
            ->assertSee('Pensé pour')
            ->assertSeeText("Inclus dans l'offre", false)
            ->assertSee('Thumbnail')
            ->assertSee('Mode de prévisualisation');
    }
}
