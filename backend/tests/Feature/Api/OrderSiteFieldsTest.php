<?php

namespace Tests\Feature\Api;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Sector;
use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderSiteFieldsTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_response_includes_site_fields(): void
    {
        $user = User::factory()->create(['role' => 'client', 'is_active' => true]);
        $template = $this->createTemplate();
        $order = Order::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Completed->value,
            'payment_status' => PaymentStatus::Paid->value,
            'price' => 50000,
            'site_url' => 'https://monboutique.com',
            'domain' => 'monboutique.com',
            'hosting_expires_at' => '2027-06-01',
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->getJson("/api/orders/{$order->id}");

        $response->assertOk()
            ->assertJsonPath('site_url', 'https://monboutique.com')
            ->assertJsonPath('domain', 'monboutique.com')
            ->assertJsonPath('hosting_expires_at', '2027-06-01');
    }

    public function test_order_response_site_fields_null_by_default(): void
    {
        $user = User::factory()->create(['role' => 'client', 'is_active' => true]);
        $template = $this->createTemplate();
        $order = Order::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Pending->value,
            'payment_status' => PaymentStatus::AwaitingPayment->value,
            'price' => 50000,
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->getJson("/api/orders/{$order->id}");

        $response->assertOk()
            ->assertJsonPath('site_url', null)
            ->assertJsonPath('domain', null)
            ->assertJsonPath('hosting_expires_at', null);
    }

    private function createTemplate(): Template
    {
        $sector = Sector::create([
            'name' => 'Commerce & Boutiques',
            'slug' => 'commerce-site-'.uniqid(),
            'description' => 'Secteur test',
            'icon' => 'ShoppingBag',
            'gradient' => 'from-blue-400 to-indigo-500',
            'is_active' => true,
        ]);

        return Template::create([
            'sector_id' => $sector->id,
            'name' => 'Template Site Test',
            'slug' => 'template-site-'.uniqid(),
            'description' => 'Description test',
            'price' => 50000,
            'features' => ['A', 'B'],
            'is_active' => true,
        ]);
    }
}
