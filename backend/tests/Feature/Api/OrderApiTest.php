<?php

namespace Tests\Feature\Api;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Sector;
use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_order_with_snapshotted_price(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $template = $this->createTemplate(price: 50000, isActive: true);

        $payload = [
            'template_id' => $template->id,
            'enterprise_name' => 'Chez Marcel',
            'activity_description' => 'Restaurant gastronomique',
            'colors' => ['#2563EB', '#7E22CE'],
            'specific_instructions' => 'Mettre le logo en header.',
            // champs hostiles (doivent être ignorés)
            'status' => 'completed',
            'price' => 1,
            'user_id' => 999,
        ];

        $response = $this->postJson('/api/orders', $payload);

        $response->assertCreated();
        $response->assertJsonPath('status', OrderStatus::Pending->value);
        $response->assertJsonPath('payment_status', PaymentStatus::AwaitingPayment->value);
        $response->assertJsonPath('price', 50000);

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Pending->value,
            'payment_status' => PaymentStatus::AwaitingPayment->value,
            'price' => 50000,
        ]);

        $orderId = (int) $response->json('id');
        $this->assertDatabaseHas('order_instructions', [
            'order_id' => $orderId,
            'enterprise_name' => 'Chez Marcel',
        ]);
    }

    public function test_order_creation_fails_for_inactive_template(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $template = $this->createTemplate(price: 50000, isActive: false);

        $this->postJson('/api/orders', [
            'template_id' => $template->id,
        ])->assertStatus(422);
    }

    public function test_orders_index_is_paginated_and_scoped_to_authenticated_user(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $template = $this->createTemplate();

        Order::create([
            'user_id' => $userA->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Pending->value,
            'price' => 50000,
        ]);

        Order::create([
            'user_id' => $userA->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Processing->value,
            'price' => 50000,
        ]);

        Order::create([
            'user_id' => $userB->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Pending->value,
            'price' => 50000,
        ]);

        Sanctum::actingAs($userA);

        $response = $this->getJson('/api/orders?per_page=1');

        $response->assertOk();
        $response->assertJsonStructure([
            'data',
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            'links' => ['first', 'last', 'prev', 'next'],
        ]);
        $response->assertJsonPath('meta.total', 2);
        $this->assertCount(1, $response->json('data'));
    }

    public function test_orders_summary_returns_status_counts_for_authenticated_user_only(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $template = $this->createTemplate();

        Order::create([
            'user_id' => $userA->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Pending->value,
            'price' => 50000,
        ]);

        Order::create([
            'user_id' => $userA->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Processing->value,
            'price' => 50000,
        ]);

        Order::create([
            'user_id' => $userA->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Completed->value,
            'price' => 50000,
        ]);

        Order::create([
            'user_id' => $userB->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Cancelled->value,
            'price' => 50000,
        ]);

        Sanctum::actingAs($userA);

        $response = $this->getJson('/api/orders/summary');

        $response->assertOk();
        $response->assertExactJson([
            'total' => 3,
            'pending' => 1,
            'processing' => 1,
            'completed' => 1,
            'cancelled' => 0,
        ]);
    }

    public function test_user_cannot_view_other_user_order(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $template = $this->createTemplate();

        $order = Order::create([
            'user_id' => $userB->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Pending->value,
            'price' => 50000,
        ]);

        Sanctum::actingAs($userA);

        $this->getJson('/api/orders/'.$order->id)
            ->assertForbidden();
    }

    private function createTemplate(int $price = 50000, bool $isActive = true): Template
    {
        $sector = Sector::create([
            'name' => 'Restaurants & Traiteurs',
            'slug' => 'restaurants',
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
