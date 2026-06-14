<?php

namespace Tests\Feature\Api;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\PlatformSettingRevision;
use App\Models\Sector;
use App\Models\Template;
use App\Models\User;
use App\Services\PlatformSettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderPaymentApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.fedapay.secret_key' => 'fedapay_test_secret',
            'services.fedapay.base_url' => 'https://sandbox-api.fedapay.com/v1',
            'services.fedapay.currency' => 'XOF',
            'services.fedapay.callback_url' => 'http://localhost:3000/commande/paiement/retour',
            'services.fedapay.webhook_secret' => 'whsec_test',
            'services.fedapay.webhook_tolerance' => 300,
        ]);

        app(PlatformSettingsService::class)->clearRuntimeCache();
    }

    public function test_authenticated_user_can_initiate_fedapay_payment_for_own_order(): void
    {
        Http::fake([
            'https://sandbox-api.fedapay.com/v1/customers' => Http::response([
                'id' => 901,
            ], 201),
            'https://sandbox-api.fedapay.com/v1/transactions' => Http::response([
                'id' => 777,
                'reference' => 'tr_777',
                'status' => 'pending',
            ], 201),
            'https://sandbox-api.fedapay.com/v1/transactions/777/token' => Http::response([
                'token' => 'tok_777',
                'url' => 'https://checkout.fedapay.com/pay/tok_777',
            ], 200),
        ]);

        $user = User::factory()->create([
            'name' => 'Client Paiement',
            'email' => 'client.payment@example.com',
        ]);
        Sanctum::actingAs($user);

        $template = $this->createTemplate();
        $order = Order::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Pending->value,
            'payment_status' => PaymentStatus::AwaitingPayment->value,
            'price' => 50000,
        ]);

        $response = $this->postJson("/api/orders/{$order->id}/payment-link", [
            'mode' => 'checkout',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('payment.checkout_url', 'https://checkout.fedapay.com/pay/tok_777');
        $response->assertJsonPath('order.payment_status', PaymentStatus::AwaitingPayment->value);

        Http::assertSent(function ($request) use ($order, $user): bool {
            if ($request->url() !== 'https://sandbox-api.fedapay.com/v1/transactions') {
                return false;
            }

            $payload = $request->data();

            return ($payload['merchant_reference'] ?? null) === 'FRILO-ORD-'.str_pad((string) $order->id, 5, '0', STR_PAD_LEFT)
                && ($payload['custom_metadata']['order_id'] ?? null) === (string) $order->id
                && ($payload['custom_metadata']['order_reference'] ?? null) === '#ORD-'.str_pad((string) $order->id, 5, '0', STR_PAD_LEFT)
                && ($payload['custom_metadata']['user_id'] ?? null) === (string) $user->id
                && ! array_key_exists('metadata', $payload);
        });

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'fedapay_customer_id' => 901,
        ]);
        $this->assertDatabaseHas('payment_transactions', [
            'order_id' => $order->id,
            'provider' => 'fedapay',
            'fedapay_transaction_id' => 777,
            'fedapay_reference' => 'tr_777',
            'status' => 'pending',
        ]);
    }

    public function test_user_cannot_initiate_payment_for_other_user_order(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        Sanctum::actingAs($intruder);

        $template = $this->createTemplate();
        $order = Order::create([
            'user_id' => $owner->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Pending->value,
            'payment_status' => PaymentStatus::AwaitingPayment->value,
            'price' => 50000,
        ]);

        $this->postJson("/api/orders/{$order->id}/payment-link")
            ->assertForbidden();
    }

    public function test_payment_status_endpoint_can_refresh_remote_status(): void
    {
        Http::fake([
            'https://sandbox-api.fedapay.com/v1/transactions/777' => Http::response([
                'id' => 777,
                'reference' => 'tr_777',
                'status' => 'approved',
            ], 200),
        ]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $template = $this->createTemplate();
        $order = Order::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Pending->value,
            'payment_status' => PaymentStatus::AwaitingPayment->value,
            'price' => 50000,
        ]);

        PaymentTransaction::create([
            'order_id' => $order->id,
            'provider' => 'fedapay',
            'fedapay_transaction_id' => 777,
            'fedapay_reference' => 'tr_777',
            'mode' => 'checkout',
            'amount' => 50000,
            'currency' => 'XOF',
            'status' => 'pending',
        ]);

        $response = $this->getJson("/api/orders/{$order->id}/payment-status?refresh=1");

        $response->assertOk();
        $response->assertJsonPath('order.payment_status', PaymentStatus::Paid->value);
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'payment_status' => PaymentStatus::Paid->value,
        ]);
        $this->assertDatabaseHas('payment_transactions', [
            'order_id' => $order->id,
            'fedapay_transaction_id' => 777,
            'status' => 'approved',
        ]);
    }

    public function test_fedapay_webhook_updates_payment_status_when_signature_is_valid(): void
    {
        Http::fake([
            'https://sandbox-api.fedapay.com/v1/transactions/777' => Http::response([
                'id' => 777,
                'reference' => 'tr_777',
                'status' => 'approved',
            ], 200),
        ]);

        $user = User::factory()->create();
        $template = $this->createTemplate();
        $order = Order::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Pending->value,
            'payment_status' => PaymentStatus::AwaitingPayment->value,
            'price' => 50000,
        ]);

        PaymentTransaction::create([
            'order_id' => $order->id,
            'provider' => 'fedapay',
            'fedapay_transaction_id' => 777,
            'fedapay_reference' => 'tr_777',
            'mode' => 'checkout',
            'amount' => 50000,
            'currency' => 'XOF',
            'status' => 'pending',
        ]);

        $payload = json_encode([
            'name' => 'transaction.approved',
            'entity' => [
                'id' => 777,
                'status' => 'approved',
            ],
        ], JSON_THROW_ON_ERROR);

        $timestamp = time();
        $signature = hash_hmac('sha256', $timestamp.'.'.$payload, 'whsec_test');
        $header = sprintf('t=%d,s=%s', $timestamp, $signature);

        $response = $this->call('POST', '/api/payments/fedapay/webhook', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X_FEDAPAY_SIGNATURE' => $header,
        ], $payload);

        $response->assertOk();
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'payment_status' => PaymentStatus::Paid->value,
        ]);
        $this->assertDatabaseHas('payment_transactions', [
            'order_id' => $order->id,
            'fedapay_transaction_id' => 777,
            'status' => 'approved',
        ]);
    }

    public function test_initiate_payment_uses_published_platform_payment_configuration_when_available(): void
    {
        PlatformSettingRevision::create([
            'status' => PlatformSettingRevision::STATUS_PUBLISHED,
            'payload' => [
                'payment' => [
                    'fedapay' => [
                        'enabled' => true,
                        'environment' => 'sandbox',
                        'base_url' => 'https://custom-api.fedapay.com/v1',
                        'currency' => 'XOF',
                        'callback_url' => 'http://localhost:3000/commande/paiement/retour',
                        'webhook_tolerance' => 300,
                    ],
                ],
            ],
            'secret_payload' => [
                'payment' => [
                    'fedapay' => [
                        'secret_key' => 'published_secret_key',
                        'webhook_secret' => 'published_webhook_secret',
                    ],
                ],
            ],
            'published_at' => now(),
        ]);
        app(PlatformSettingsService::class)->clearRuntimeCache();

        Http::fake([
            'https://custom-api.fedapay.com/v1/customers' => Http::response([
                'id' => 981,
            ], 201),
            'https://custom-api.fedapay.com/v1/transactions' => Http::response([
                'id' => 887,
                'reference' => 'tr_887',
                'status' => 'pending',
            ], 201),
            'https://custom-api.fedapay.com/v1/transactions/887/token' => Http::response([
                'token' => 'tok_887',
                'url' => 'https://checkout.fedapay.com/pay/tok_887',
            ], 200),
        ]);

        $user = User::factory()->create([
            'name' => 'Client Runtime Config',
            'email' => 'client.runtime.config@example.com',
        ]);
        Sanctum::actingAs($user);

        $template = $this->createTemplate();
        $order = Order::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Pending->value,
            'payment_status' => PaymentStatus::AwaitingPayment->value,
            'price' => 50000,
        ]);

        $response = $this->postJson("/api/orders/{$order->id}/payment-link", [
            'mode' => 'checkout',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('payment.checkout_url', 'https://checkout.fedapay.com/pay/tok_887');

        Http::assertSent(function ($request): bool {
            $url = $request->url();
            if (! str_starts_with($url, 'https://custom-api.fedapay.com/v1/')) {
                return false;
            }

            return in_array('Bearer published_secret_key', $request->header('Authorization'), true);
        });
    }

    private function createTemplate(int $price = 50000): Template
    {
        $sector = Sector::create([
            'name' => 'Secteur Paiement Test',
            'slug' => 'secteur-paiement-test-'.uniqid(),
            'description' => 'Description',
            'icon' => 'Store',
            'gradient' => 'from-indigo-500 to-cyan-400',
            'is_active' => true,
        ]);

        return Template::create([
            'sector_id' => $sector->id,
            'name' => 'Template Paiement Test',
            'slug' => 'template-paiement-test-'.uniqid(),
            'description' => 'Description',
            'price' => $price,
            'features' => ['A', 'B'],
            'is_active' => true,
        ]);
    }
}
