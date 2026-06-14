<?php

namespace Tests\Feature\Api;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderOption;
use App\Models\Sector;
use App\Models\Template;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderOptionsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_only_active_options_sorted_by_sort_order_then_name(): void
    {
        $second = OrderOption::factory()->create([
            'name' => 'Page supplémentaire',
            'slug' => 'page-supplementaire',
            'description' => 'Ajoutez une page dédiée à votre activité.',
            'persona_hint' => 'Pour présenter un service en détail.',
            'price' => 10000,
            'is_active' => true,
            'sort_order' => 20,
        ]);
        $firstAlphabetically = OrderOption::factory()->create([
            'name' => 'Catalogue organisé',
            'slug' => 'catalogue-organise',
            'description' => 'Présentez vos offres dans un catalogue clair.',
            'persona_hint' => 'Pour les entreprises avec plusieurs offres.',
            'price' => 25000,
            'is_active' => true,
            'sort_order' => 10,
        ]);
        $secondAlphabetically = OrderOption::factory()->create([
            'name' => 'Galerie photos',
            'slug' => 'galerie-photos',
            'description' => 'Mettez en valeur vos réalisations.',
            'persona_hint' => 'Pour montrer votre savoir-faire en images.',
            'price' => 10000,
            'is_active' => true,
            'sort_order' => 10,
        ]);
        OrderOption::factory()->create([
            'name' => 'Option inactive',
            'slug' => 'option-inactive',
            'is_active' => false,
            'sort_order' => 0,
        ]);

        $response = $this->getJson('/api/order-options');

        $response->assertOk()->assertExactJson([
            [
                'id' => $firstAlphabetically->id,
                'name' => $firstAlphabetically->name,
                'slug' => $firstAlphabetically->slug,
                'description' => $firstAlphabetically->description,
                'persona_hint' => $firstAlphabetically->persona_hint,
                'price' => $firstAlphabetically->price,
            ],
            [
                'id' => $secondAlphabetically->id,
                'name' => $secondAlphabetically->name,
                'slug' => $secondAlphabetically->slug,
                'description' => $secondAlphabetically->description,
                'persona_hint' => $secondAlphabetically->persona_hint,
                'price' => $secondAlphabetically->price,
            ],
            [
                'id' => $second->id,
                'name' => $second->name,
                'slug' => $second->slug,
                'description' => $second->description,
                'persona_hint' => $second->persona_hint,
                'price' => $second->price,
            ],
        ]);
    }

    public function test_order_option_has_active_scope_and_price_cast(): void
    {
        OrderOption::factory()->create([
            'name' => 'Galerie photos',
            'slug' => 'galerie-photos',
            'price' => 10000,
            'is_active' => true,
        ]);
        OrderOption::factory()->create([
            'name' => 'Ancienne option',
            'slug' => 'ancienne-option',
            'price' => 5000,
            'is_active' => false,
        ]);

        $active = OrderOption::active()->get();

        $this->assertCount(1, $active);
        $this->assertSame('Galerie photos', $active->first()->name);
        $this->assertSame(10000, $active->first()->price);
    }

    public function test_order_can_snapshot_selected_options(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        $template = $this->createTemplate(price: 50000, isActive: true);
        $option = OrderOption::factory()->create(['price' => 15000, 'is_active' => true]);

        $order = Order::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Pending->value,
            'price' => 65000,
        ]);

        $order->options()->attach($option->id, [
            'name_snapshot' => $option->name,
            'price_snapshot' => $option->price,
        ]);

        $order->load('options');

        $this->assertSame($option->name, $order->options->first()->pivot->name_snapshot);
        $this->assertSame(15000, $order->options->first()->pivot->price_snapshot);
    }

    public function test_option_snapshot_remains_accessible_after_catalogue_option_is_deleted(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        $template = $this->createTemplate();
        $option = OrderOption::factory()->create(['name' => 'Catalogue organisé', 'price' => 25000]);
        $order = Order::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Pending->value,
            'price' => 75000,
        ]);

        $order->options()->attach($option->id, [
            'name_snapshot' => $option->name,
            'price_snapshot' => $option->price,
        ]);

        $option->delete();
        $selection = $order->optionSelections()->firstOrFail();

        $this->assertNull($selection->order_option_id);
        $this->assertSame('Catalogue organisé', $selection->name_snapshot);
        $this->assertSame(25000, $selection->price_snapshot);
    }

    public function test_same_option_cannot_be_attached_twice_to_an_order(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        $template = $this->createTemplate();
        $option = OrderOption::factory()->create();
        $order = Order::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Pending->value,
            'price' => 50000,
        ]);
        $snapshot = [
            'name_snapshot' => $option->name,
            'price_snapshot' => $option->price,
        ];

        $order->options()->attach($option->id, $snapshot);

        $this->expectException(QueryException::class);
        $order->options()->attach($option->id, $snapshot);
    }

    private function createTemplate(int $price = 50000, bool $isActive = true): Template
    {
        $sector = Sector::create([
            'name' => 'Restaurants & Traiteurs',
            'slug' => 'restaurants-'.uniqid(),
            'description' => 'Secteur test',
            'icon' => 'Utensils',
            'gradient' => 'from-orange-400 to-red-500',
            'is_active' => true,
        ]);

        return Template::create([
            'sector_id' => $sector->id,
            'name' => 'Template Test',
            'slug' => 'template-test-'.uniqid(),
            'description' => 'Description',
            'price' => $price,
            'features' => ['A', 'B'],
            'is_active' => $isActive,
        ]);
    }
}
