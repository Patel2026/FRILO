<?php

namespace Tests\Feature\Api;

use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\Sector;
use App\Models\Template;
use App\Models\User;
use App\Services\OrderPaymentService;
use App\Services\PlatformSettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PaymentReliabilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Notification::fake();
        Http::preventStrayRequests();
        config(['services.fedapay.secret_key' => 'fake-only', 'services.fedapay.base_url' => 'https://provider.test/v1', 'services.fedapay.webhook_secret' => 'test-signature']);
        app(PlatformSettingsService::class)->clearRuntimeCache();
    }

    private function order(): Order
    {
        $user = User::factory()->create(['fedapay_customer_id' => 901, 'role' => 'client']);
        Sanctum::actingAs($user);
        $sector = Sector::create(['name' => 'QA', 'slug' => (string) Str::uuid(), 'is_active' => true]);
        $template = Template::create(['sector_id' => $sector->id, 'name' => 'QA', 'slug' => (string) Str::uuid(), 'price' => 50000, 'is_active' => true]);

        return Order::create(['user_id' => $user->id, 'template_id' => $template->id, 'price' => 50000, 'status' => 'pending', 'payment_status' => 'awaiting_payment']);
    }

    private function provider(): void
    {
        Http::fake([
            '*/transactions' => Http::response(['id' => 777, 'status' => 'pending'], 201),
            '*/transactions/777/token' => Http::response(['token' => 'fake-token', 'url' => 'https://provider.test/checkout/777']),
        ]);
    }

    private function webhook(int $id, string $status): void
    {
        $payload = json_encode(['name' => 'transaction.'.$status, 'entity' => ['id' => $id, 'status' => $status]], JSON_THROW_ON_ERROR);
        $timestamp = time();
        app(OrderPaymentService::class)->handleWebhook($payload, 't='.$timestamp.',s='.hash_hmac('sha256', $timestamp.'.'.$payload, 'test-signature'));
    }

    public function test_replayed_order_submission_returns_one_order_and_one_notification(): void
    {
        $fixture = $this->order();
        $payload = ['template_id' => $fixture->template_id, 'enterprise_name' => 'QA', 'idempotency_key' => (string) Str::uuid()];
        $first = $this->postJson('/api/orders', $payload)->assertCreated()->json('id');
        $this->postJson('/api/orders', $payload)->assertCreated()->assertJsonPath('id', $first);
        $this->assertDatabaseCount('orders', 2);
        Notification::assertSentToTimes($fixture->user, \App\Notifications\OrderCreatedNotification::class, 1);
        $this->postJson('/api/orders', array_replace($payload, ['enterprise_name' => 'Changed']))->assertConflict();
    }

    public function test_order_submission_requires_a_key(): void
    {
        $order = $this->order();
        $this->postJson('/api/orders', ['template_id' => $order->template_id])->assertUnprocessable()->assertJsonValidationErrors('idempotency_key');
    }

    public function test_payment_replay_reuses_the_checkout(): void
    {
        $order = $this->order();
        $this->provider();
        $id = $this->postJson("/api/orders/{$order->id}/payment-link")->assertCreated()->json('payment.id');
        $this->postJson("/api/orders/{$order->id}/payment-link")->assertCreated()->assertJsonPath('payment.id', $id);
        $this->assertDatabaseCount('payment_transactions', 1);
        Http::assertSentCount(2);
    }

    public function test_timeout_is_sanitized_and_retry_does_not_create_another_transaction(): void
    {
        $order = $this->order();
        Http::fake(fn () => throw new ConnectionException('cURL error 28 internal-secret-url'));
        $response = $this->postJson("/api/orders/{$order->id}/payment-link");
        $response->assertStatus(503);
        $this->assertStringNotContainsString('cURL', $response->getContent());
        $this->assertStringNotContainsString('internal-secret', $response->getContent());
        $this->provider();
        $this->postJson("/api/orders/{$order->id}/payment-link")->assertConflict();
        $this->assertDatabaseCount('payment_transactions', 1);
        Http::assertNothingSent();
    }

    public function test_paid_and_refunded_cannot_be_regressed_by_late_events(): void
    {
        $order = $this->order();
        $this->provider();
        $this->postJson("/api/orders/{$order->id}/payment-link")->assertCreated();
        $this->webhook(777, 'approved');
        $paidAt = $order->fresh()->paid_at->toISOString();
        foreach (['pending', 'declined', 'canceled', 'approved'] as $status) {
            $this->webhook(777, $status);
            $this->assertSame('paid', $order->fresh()->payment_status->value);
            $this->assertSame('approved', PaymentTransaction::first()->status);
            $this->assertSame($paidAt, $order->fresh()->paid_at->toISOString());
        }
        $this->webhook(777, 'refunded');
        $this->webhook(777, 'approved');
        $this->assertSame('refunded', $order->fresh()->payment_status->value);
        $this->assertSame('refunded', PaymentTransaction::first()->status);
    }

    public function test_customer_failure_can_be_retried_without_creating_a_payment_twice(): void
    {
        $order = $this->order();
        $order->user->update(['fedapay_customer_id' => null]);
        Sanctum::actingAs($order->user->fresh());
        Http::fake([
            '*/customers' => Http::sequence()->push(['message' => 'unavailable'], 503)->push(['id' => 901], 201),
            '*/transactions' => Http::response(['id' => 777, 'status' => 'pending'], 201),
            '*/transactions/777/token' => Http::response(['token' => 'fake', 'url' => 'https://provider.test/pay']),
        ]);
        $this->postJson("/api/orders/{$order->id}/payment-link")->assertStatus(503);
        $this->postJson("/api/orders/{$order->id}/payment-link")->assertCreated();
        $this->assertSame(1, PaymentTransaction::whereNotNull('fedapay_transaction_id')->count());
    }

    public function test_token_failure_recovers_existing_transaction(): void
    {
        $order = $this->order();
        Http::fake([
            '*/transactions' => Http::response(['id' => 777, 'status' => 'pending'], 201),
            '*/transactions/777' => Http::response(['id' => 777, 'status' => 'pending']),
            '*/transactions/777/token' => Http::sequence()->push(['message' => 'token unavailable'], 503)->push(['token' => 'fake', 'url' => 'https://provider.test/pay']),
        ]);
        $this->postJson("/api/orders/{$order->id}/payment-link")->assertStatus(503);
        $this->getJson("/api/orders/{$order->id}/payment-status?refresh=1")->assertOk();
        $this->postJson("/api/orders/{$order->id}/payment-link")->assertCreated()->assertJsonPath('payment.fedapay_transaction_id', 777);
        $this->assertDatabaseCount('payment_transactions', 1);
        Http::assertSentCount(5);
    }

    public function test_approval_received_during_token_creation_is_not_overwritten(): void
    {
        $order = $this->order();
        Http::fake([
            '*/transactions' => Http::response(['id' => 777, 'status' => 'pending'], 201),
            '*/transactions/777/token' => function () {
                $this->webhook(777, 'approved');

                return Http::response(['token' => 'fake', 'url' => 'https://provider.test/pay']);
            },
        ]);
        $this->postJson("/api/orders/{$order->id}/payment-link")->assertCreated()->assertJsonPath('order.payment_status', 'paid');
        $this->assertSame('approved', PaymentTransaction::first()->status);
        $this->assertNotNull(PaymentTransaction::first()->completed_at);
    }

    public function test_same_order_key_is_scoped_to_customer_and_new_key_allows_distinct_purchase(): void
    {
        $order = $this->order();
        $payload = ['template_id' => $order->template_id, 'idempotency_key' => (string) Str::uuid()];
        $first = $this->postJson('/api/orders', $payload)->assertCreated()->json('id');
        Sanctum::actingAs(User::factory()->create(['role' => 'client']));
        $second = $this->postJson('/api/orders', $payload)->assertCreated()->json('id');
        $this->assertNotSame($first, $second);
        $payload['idempotency_key'] = (string) Str::uuid();
        $third = $this->postJson('/api/orders', $payload)->assertCreated()->json('id');
        $this->assertNotSame($second, $third);
    }

    public function test_order_replay_keeps_snapshot_after_template_deactivation(): void
    {
        $order = $this->order();
        $payload = ['template_id' => $order->template_id, 'idempotency_key' => (string) Str::uuid()];
        $first = $this->postJson('/api/orders', $payload)->assertCreated()->json('id');
        $order->template->update(['is_active' => false, 'price' => 90000]);
        $this->postJson('/api/orders', $payload)->assertCreated()->assertJsonPath('id', $first)->assertJsonPath('price', 50000);
        $payload['idempotency_key'] = (string) Str::uuid();
        $this->postJson('/api/orders', $payload)->assertUnprocessable();
    }

    public function test_recovery_read_failure_does_not_overwrite_a_concurrent_approval(): void
    {
        $order = $this->order();
        PaymentTransaction::create(['order_id' => $order->id, 'fedapay_transaction_id' => 777, 'amount' => 50000, 'mode' => 'checkout', 'status' => 'checkout_token_failed']);
        Http::fake(['*/transactions/777' => function () {
            $this->webhook(777, 'approved');
            throw new ConnectionException('simulated read timeout');
        }]);
        $this->postJson("/api/orders/{$order->id}/payment-link")->assertStatus(503);
        $this->assertSame('approved', PaymentTransaction::first()->status);
        $this->assertSame('paid', $order->fresh()->payment_status->value);
        $this->postJson("/api/orders/{$order->id}/payment-link")->assertCreated()->assertJsonPath('already_paid', true);
    }

    public function test_old_failed_attempt_does_not_override_newer_paid_attempt(): void
    {
        $order = $this->order();
        foreach ([776, 777] as $id) {
            PaymentTransaction::create(['order_id' => $order->id, 'fedapay_transaction_id' => $id, 'amount' => 50000, 'status' => 'pending']);
        }
        $this->webhook(777, 'approved');
        $this->webhook(776, 'declined');
        $this->assertSame('paid', $order->fresh()->payment_status->value);
    }
}
