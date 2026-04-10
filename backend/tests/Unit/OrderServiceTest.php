<?php

namespace Tests\Unit;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Sector;
use App\Models\Template;
use App\Models\User;
use App\Notifications\OrderStatusUpdatedNotification;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class OrderServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_order_snapshots_template_price(): void
    {
        $service = app(OrderService::class);
        $user = User::factory()->create();
        $template = $this->createTemplate(price: 50000, isActive: true);

        $order = $service->createOrder([
            'template_id' => $template->id,
            'enterprise_name' => 'Entreprise Test',
        ], $user);

        $this->assertSame(50000, $order->price);
        $this->assertSame(OrderStatus::Pending, $order->status);
        $this->assertSame(PaymentStatus::AwaitingPayment, $order->payment_status);
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'price' => 50000,
            'payment_status' => PaymentStatus::AwaitingPayment->value,
        ]);
    }

    public function test_update_status_allows_valid_transition(): void
    {
        Notification::fake();

        $service = app(OrderService::class);
        $order = $this->createOrderWithStatus(
            OrderStatus::Pending->value,
            PaymentStatus::Paid->value
        );
        $orderUser = User::findOrFail($order->user_id);

        $updated = $service->updateStatus($order, OrderStatus::Processing);

        $this->assertSame(OrderStatus::Processing, $updated->status);
        Notification::assertSentTo($orderUser, OrderStatusUpdatedNotification::class);
    }

    public function test_update_status_rejects_invalid_transition(): void
    {
        $this->expectException(HttpException::class);

        $service = app(OrderService::class);
        $order = $this->createOrderWithStatus(OrderStatus::Completed->value);

        $service->updateStatus($order, OrderStatus::Processing);
    }

    public function test_update_status_rejects_processing_transition_when_payment_not_paid(): void
    {
        $this->expectException(HttpException::class);

        $service = app(OrderService::class);
        $order = $this->createOrderWithStatus(
            OrderStatus::Pending->value,
            PaymentStatus::AwaitingPayment->value
        );

        $service->updateStatus($order, OrderStatus::Processing);
    }

    private function createOrderWithStatus(string $status, string $paymentStatus = 'awaiting_payment'): Order
    {
        $user = User::factory()->create();
        $template = $this->createTemplate();

        return Order::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'status' => $status,
            'payment_status' => $paymentStatus,
            'price' => 50000,
        ]);
    }

    private function createTemplate(int $price = 50000, bool $isActive = true): Template
    {
        $sector = Sector::create([
            'name' => 'Secteur Unit Test',
            'slug' => 'secteur-unit-test-'.uniqid(),
            'description' => 'Description',
            'icon' => 'Home',
            'gradient' => 'from-blue-500 to-cyan-400',
            'is_active' => true,
        ]);

        return Template::create([
            'sector_id' => $sector->id,
            'name' => 'Template Unit Test',
            'slug' => 'template-unit-test-'.uniqid(),
            'description' => 'Description',
            'price' => $price,
            'features' => ['A', 'B'],
            'is_active' => $isActive,
        ]);
    }
}
