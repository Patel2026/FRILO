<?php

namespace Tests\Feature\Api;

use App\Models\Sector;
use App\Models\Template;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
