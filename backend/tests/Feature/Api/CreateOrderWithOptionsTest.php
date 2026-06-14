<?php

namespace Tests\Feature\Api;

use App\Models\OrderOption;
use App\Models\Sector;
use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CreateOrderWithOptionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_without_options_uses_template_price(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'client']));
        $template = $this->createTemplate();

        $response = $this->postJson('/api/orders', [
            'template_id' => $template->id,
            'enterprise_name' => 'ABC SARL',
        ]);

        $response->assertCreated()
            ->assertJsonPath('price', 50000)
            ->assertJsonPath('selected_options', []);
    }

    public function test_order_with_active_options_snapshots_total_price(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'client']));
        $template = $this->createTemplate();
        $gallery = OrderOption::factory()->create([
            'name' => 'Galerie photos',
            'price' => 10000,
            'is_active' => true,
            'sort_order' => 10,
        ]);
        $catalogue = OrderOption::factory()->create([
            'name' => 'Catalogue organisé',
            'price' => 25000,
            'is_active' => true,
            'sort_order' => 20,
        ]);

        $response = $this->postJson('/api/orders', [
            'template_id' => $template->id,
            'enterprise_name' => 'ABC SARL',
            'option_ids' => [$gallery->id, $catalogue->id, $gallery->id],
            'price' => 1,
        ]);

        $response->assertCreated()
            ->assertJsonPath('price', 85000)
            ->assertJsonPath('selected_options.0.name', 'Galerie photos')
            ->assertJsonPath('selected_options.0.price', 10000)
            ->assertJsonPath('selected_options.1.name', 'Catalogue organisé')
            ->assertJsonPath('selected_options.1.price', 25000);

        $this->assertDatabaseHas('orders', ['price' => 85000]);
        $this->assertDatabaseCount('order_order_option', 2);
        $this->assertDatabaseHas('order_order_option', [
            'name_snapshot' => 'Galerie photos',
            'price_snapshot' => 10000,
        ]);
    }

    public function test_inactive_option_is_rejected(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'client']));
        $template = $this->createTemplate();
        $inactive = OrderOption::factory()->create(['is_active' => false]);

        $this->postJson('/api/orders', [
            'template_id' => $template->id,
            'option_ids' => [$inactive->id],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('option_ids.0');
    }

    private function createTemplate(): Template
    {
        $sector = Sector::create([
            'name' => 'Secteur options',
            'slug' => 'secteur-options-'.uniqid(),
            'description' => 'Secteur test',
            'icon' => 'Home',
            'gradient' => 'from-blue-500 to-cyan-400',
            'is_active' => true,
        ]);

        return Template::create([
            'sector_id' => $sector->id,
            'name' => 'Template options',
            'slug' => 'template-options-'.uniqid(),
            'description' => 'Description',
            'price' => 50000,
            'features' => ['A', 'B'],
            'is_active' => true,
        ]);
    }
}
