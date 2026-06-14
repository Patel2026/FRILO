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

class OrderPreviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_show_includes_preview_url(): void
    {
        $user = User::factory()->create(['role' => 'client', 'is_active' => true]);
        $template = $this->createTemplate(price: 50000, isActive: true);
        $order = Order::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Processing->value,
            'payment_status' => PaymentStatus::Paid->value,
            'price' => 50000,
            'preview_url' => 'https://preview.frilo.bj/orders/42',
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->getJson("/api/orders/{$order->id}");

        $response->assertOk();
        $response->assertJsonPath('preview_url', 'https://preview.frilo.bj/orders/42');
        $response->assertJsonPath('client_feedback', null);
        $response->assertJsonPath('feedback_submitted_at', null);
    }

    public function test_client_can_submit_feedback_when_preview_url_set(): void
    {
        $user = User::factory()->create(['role' => 'client', 'is_active' => true]);
        $template = $this->createTemplate(price: 50000, isActive: true);
        $order = Order::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Processing->value,
            'payment_status' => PaymentStatus::Paid->value,
            'price' => 50000,
            'preview_url' => 'https://preview.frilo.bj/orders/42',
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson("/api/orders/{$order->id}/feedback", [
            'feedback' => 'Changer le logo et la couleur du header.',
        ]);

        $response->assertOk();
        $response->assertJsonPath('client_feedback', 'Changer le logo et la couleur du header.');
        $this->assertNotNull($order->fresh()->feedback_submitted_at);
    }

    public function test_client_cannot_submit_feedback_without_preview_url(): void
    {
        $user = User::factory()->create(['role' => 'client', 'is_active' => true]);
        $template = $this->createTemplate(price: 50000, isActive: true);
        $order = Order::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Pending->value,
            'payment_status' => PaymentStatus::AwaitingPayment->value,
            'price' => 50000,
            'preview_url' => null,
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson("/api/orders/{$order->id}/feedback", [
            'feedback' => 'Retour sans prévisualisation.',
        ]);

        $response->assertStatus(422);
    }

    public function test_client_cannot_submit_feedback_on_other_users_order(): void
    {
        $user = User::factory()->create(['role' => 'client', 'is_active' => true]);
        $otherUser = User::factory()->create(['role' => 'client', 'is_active' => true]);
        $template = $this->createTemplate(price: 50000, isActive: true);
        $order = Order::create([
            'user_id' => $otherUser->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Processing->value,
            'payment_status' => PaymentStatus::Paid->value,
            'price' => 50000,
            'preview_url' => 'https://preview.frilo.bj/orders/99',
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson("/api/orders/{$order->id}/feedback", [
            'feedback' => 'Retour non autorisé.',
        ]);

        $response->assertForbidden();
    }

    private function createTemplate(int $price = 50000, bool $isActive = true): Template
    {
        $sector = Sector::create([
            'name' => 'Restaurants & Traiteurs',
            'slug' => 'restaurants-preview-'.uniqid(),
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
