<?php

namespace Tests\Feature\Api;

use App\Models\Sector;
use App\Models\Template;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TemplateApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_templates_index_returns_active_templates_with_preview_configuration(): void
    {
        $sector = Sector::create([
            'name' => 'Restaurants',
            'slug' => 'restaurants',
            'description' => 'Secteur test',
            'icon' => 'Utensils',
            'gradient' => 'from-orange-400 to-red-500',
            'is_active' => true,
        ]);

        Template::create([
            'sector_id' => $sector->id,
            'name' => 'Template Visible',
            'slug' => 'template-visible',
            'description' => 'Visible',
            'price' => 50000,
            'features' => ['A', 'B'],
            'preview_url' => 'https://demo.example.com',
            'preview_pages' => [
                ['label' => 'Accueil', 'path' => '/'],
                ['label' => 'Services', 'path' => '/services'],
            ],
            'preview_gallery' => [
                'https://images.example.com/1.jpg',
                'https://images.example.com/2.jpg',
            ],
            'is_active' => true,
        ]);

        Template::create([
            'sector_id' => $sector->id,
            'name' => 'Template Inactif',
            'slug' => 'template-inactif',
            'description' => 'Invisible',
            'price' => 50000,
            'features' => ['A'],
            'is_active' => false,
        ]);

        $response = $this->getJson('/api/templates');

        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonStructure([
            '*' => [
                'id',
                'name',
                'slug',
                'preview_url',
                'preview_pages',
                'preview_gallery',
                'sector',
            ],
        ]);
        $response->assertJsonPath('0.slug', 'template-visible');
        $response->assertJsonPath('0.preview_pages.1.path', '/services');
    }

    public function test_template_show_returns_404_for_inactive_template(): void
    {
        $sector = Sector::create([
            'name' => 'BTP',
            'slug' => 'btp',
            'description' => 'Secteur test',
            'icon' => 'Hammer',
            'gradient' => 'from-slate-500 to-slate-700',
            'is_active' => true,
        ]);

        $inactiveTemplate = Template::create([
            'sector_id' => $sector->id,
            'name' => 'Template Inactif',
            'slug' => 'template-inactif-show',
            'description' => 'Invisible',
            'price' => 50000,
            'features' => ['A'],
            'is_active' => false,
        ]);

        $this->getJson('/api/templates/'.$inactiveTemplate->id)
            ->assertNotFound();
    }

    public function test_template_show_returns_pricing_and_separated_public_content_fields(): void
    {
        $sector = Sector::create([
            'name' => 'Restaurants',
            'slug' => 'restaurants',
            'description' => 'Secteur test',
            'icon' => 'Utensils',
            'gradient' => 'from-orange-400 to-red-500',
            'is_active' => true,
        ]);

        $template = Template::create([
            'sector_id' => $sector->id,
            'name' => 'Restaurant Pro',
            'slug' => 'restaurant-pro',
            'description' => 'Visible',
            'price' => 50000,
            'normal_price' => 50000,
            'promo_price' => 35000,
            'features' => ['Legacy'],
            'target_audience' => ['Restaurants', 'Maquis'],
            'included_features' => ['Site 5 pages', 'Hebergement 1 an'],
            'is_active' => true,
        ]);

        $this->getJson('/api/templates/'.$template->id)
            ->assertOk()
            ->assertJsonPath('price', 35000)
            ->assertJsonPath('normal_price', 50000)
            ->assertJsonPath('promo_price', 35000)
            ->assertJsonPath('target_audience.0', 'Restaurants')
            ->assertJsonPath('included_features.1', 'Hebergement 1 an');
    }

    public function test_template_show_does_not_fallback_public_content_to_legacy_features(): void
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
            'name' => 'Service Legacy',
            'slug' => 'service-legacy',
            'description' => 'Visible',
            'price' => 50000,
            'normal_price' => 50000,
            'features' => ['Legacy inclus 1', 'Legacy inclus 2'],
            'is_active' => true,
        ]);

        $this->getJson('/api/templates/'.$template->id)
            ->assertOk()
            ->assertJsonPath('features.0', 'Legacy inclus 1')
            ->assertJsonPath('target_audience', [])
            ->assertJsonPath('included_features', []);
    }

    public function test_template_show_ignores_missing_thumbnail_file(): void
    {
        Storage::fake('public');

        $sector = Sector::create([
            'name' => 'BTP',
            'slug' => 'btp',
            'description' => 'Secteur test',
            'icon' => 'Hammer',
            'gradient' => 'from-slate-500 to-slate-700',
            'is_active' => true,
        ]);

        $template = Template::create([
            'sector_id' => $sector->id,
            'name' => 'Template sans fichier',
            'slug' => 'template-sans-fichier',
            'description' => 'Visible',
            'price' => 50000,
            'features' => ['A'],
            'thumbnail' => 'templates/missing-thumbnail.png',
            'is_active' => true,
        ]);

        $this->getJson('/api/templates/'.$template->id)
            ->assertOk()
            ->assertJsonPath('thumbnail', 'templates/missing-thumbnail.png')
            ->assertJsonPath('full_thumbnail_url', null);
    }
}
