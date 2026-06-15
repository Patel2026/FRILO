<?php

namespace Tests\Feature\Admin;

use App\Models\Order;
use App\Models\OrderOption;
use App\Models\Sector;
use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderOptionAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);
    }

    public function test_super_admin_can_manage_order_options(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);

        $this->actingAs($admin)
            ->get('/admin/order-options')
            ->assertOk()
            ->assertSee('Options de commande');

        $this->actingAs($admin)
            ->post('/admin/order-options', [
                'name' => 'Formulaire avance',
                'slug' => 'formulaire-avance',
                'description' => 'Recevoir des demandes plus precises depuis le site.',
                'persona_hint' => 'BTP, immobilier, ecole',
                'price' => 15000,
                'sort_order' => 40,
                'is_active' => 1,
            ])
            ->assertRedirect('/admin/order-options');

        $option = OrderOption::query()->firstOrFail();

        $this->assertDatabaseHas('order_options', [
            'id' => $option->id,
            'name' => 'Formulaire avance',
            'slug' => 'formulaire-avance',
            'price' => 15000,
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('admin_audit_logs', [
            'event' => 'order_option.created',
            'actor_id' => $admin->id,
            'target_type' => 'order_option',
            'target_id' => (string) $option->id,
        ]);

        $this->actingAs($admin)
            ->put('/admin/order-options/'.$option->id, [
                'name' => 'Formulaire avance qualifie',
                'slug' => 'formulaire-avance',
                'description' => 'Recevoir des demandes plus precises depuis le site.',
                'persona_hint' => 'BTP, immobilier, ecole',
                'price' => 18000,
                'sort_order' => 45,
            ])
            ->assertRedirect('/admin/order-options');

        $this->assertDatabaseHas('order_options', [
            'id' => $option->id,
            'name' => 'Formulaire avance qualifie',
            'price' => 18000,
            'sort_order' => 45,
            'is_active' => false,
        ]);
    }

    public function test_client_cannot_access_order_options_admin_screen(): void
    {
        $client = User::factory()->create(['role' => 'client']);

        $this->actingAs($client)
            ->get('/admin/order-options')
            ->assertForbidden();
    }

    public function test_order_detail_displays_selected_options_and_price_breakdown(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        $client = User::factory()->create(['role' => 'client']);
        $sector = Sector::create([
            'name' => 'BTP',
            'slug' => 'btp',
            'description' => 'Secteur test',
            'icon' => 'HardHat',
            'gradient' => 'from-orange-400 to-red-500',
            'is_active' => true,
        ]);
        $template = Template::create([
            'sector_id' => $sector->id,
            'name' => 'BTP Pro',
            'slug' => 'btp-pro',
            'description' => 'Template test',
            'price' => 50000,
            'features' => ['Accueil', 'Contact'],
            'is_active' => true,
        ]);
        $option = OrderOption::factory()->create([
            'name' => 'Galerie chantiers',
            'price' => 12000,
        ]);
        $order = Order::create([
            'user_id' => $client->id,
            'template_id' => $template->id,
            'status' => 'pending',
            'payment_status' => 'awaiting_payment',
            'price' => 62000,
        ]);
        $order->options()->attach($option->id, [
            'name_snapshot' => 'Galerie chantiers',
            'price_snapshot' => 12000,
        ]);

        $this->actingAs($admin)
            ->get('/admin/orders/'.$order->id)
            ->assertOk()
            ->assertSee('Détail du prix')
            ->assertSee('Prix du template')
            ->assertSee('50 000 FCFA')
            ->assertSee('Galerie chantiers')
            ->assertSee('12 000 FCFA')
            ->assertSee('62 000 FCFA');
    }
}
