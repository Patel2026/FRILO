<?php

namespace Tests\Feature\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Sector;
use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderProductionCenterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);
    }

    private function superAdmin(): User
    {
        return User::factory()->create(['role' => 'super_admin']);
    }

    private function client(): User
    {
        return User::factory()->create(['role' => 'client', 'is_active' => true]);
    }

    private function createOrder(array $attributes = []): Order
    {
        $sector = Sector::create([
            'name' => 'Commerce',
            'slug' => 'commerce-'.uniqid(),
            'description' => 'Secteur test',
            'icon' => 'ShoppingBag',
            'gradient' => 'from-blue-400 to-indigo-500',
            'is_active' => true,
        ]);

        $template = Template::create([
            'sector_id' => $sector->id,
            'name' => 'Template Test',
            'slug' => 'template-test-'.uniqid(),
            'description' => 'Description test',
            'price' => 50000,
            'features' => ['Accueil', 'Contact'],
            'is_active' => true,
        ]);

        return Order::create(array_merge([
            'user_id' => $this->client()->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Pending,
            'payment_status' => PaymentStatus::Paid,
            'price' => 50000,
        ], $attributes));
    }

    public function test_new_orders_have_production_defaults(): void
    {
        $order = $this->createOrder();

        $this->assertFalse($order->material_activity_received);
        $this->assertFalse($order->material_logo_received);
        $this->assertFalse($order->production_template_adapted);
        $this->assertFalse($order->quality_mobile_checked);
        $this->assertFalse($order->delivery_ssl_checked);
        $this->assertSame(0, $order->client_reminder_count);
        $this->assertSame('A completer', $order->productionCompletenessLabel());
    }
}
