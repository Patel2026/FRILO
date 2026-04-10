<?php

namespace Tests\Feature\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\Sector;
use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PaymentTransactionAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);

        config([
            'services.fedapay.enabled' => true,
            'services.fedapay.secret_key' => 'fedapay_test_secret',
            'services.fedapay.base_url' => 'https://sandbox-api.fedapay.com/v1',
            'services.fedapay.webhook_secret' => 'whsec_test',
            'services.fedapay.webhook_tolerance' => 300,
        ]);
    }

    public function test_super_admin_can_sync_payment_transaction_from_backoffice(): void
    {
        Http::fake([
            'https://sandbox-api.fedapay.com/v1/transactions/777' => Http::response([
                'id' => 777,
                'reference' => 'tr_777',
                'status' => 'approved',
            ], 200),
        ]);

        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        $client = User::factory()->create(['role' => 'client']);
        $template = $this->createTemplate();
        $order = Order::create([
            'user_id' => $client->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Pending->value,
            'payment_status' => PaymentStatus::AwaitingPayment->value,
            'price' => 50000,
        ]);
        $payment = PaymentTransaction::create([
            'order_id' => $order->id,
            'provider' => 'fedapay',
            'fedapay_transaction_id' => 777,
            'fedapay_reference' => 'tr_777',
            'mode' => 'checkout',
            'amount' => 50000,
            'currency' => 'XOF',
            'status' => 'pending',
        ]);

        $this->actingAs($superAdmin)
            ->post('/admin/payments/'.$payment->id.'/sync')
            ->assertRedirect('/admin/payments/'.$payment->id);

        $this->assertDatabaseHas('payment_transactions', [
            'id' => $payment->id,
            'status' => 'approved',
        ]);
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'payment_status' => PaymentStatus::Paid->value,
        ]);
        $this->assertDatabaseHas('admin_audit_logs', [
            'event' => 'payment.transaction.synced',
            'actor_id' => $superAdmin->id,
            'target_type' => 'payment_transaction',
            'target_id' => (string) $payment->id,
        ]);
    }

    private function createTemplate(int $price = 50000): Template
    {
        $sector = Sector::create([
            'name' => 'Secteur Paiement Admin Test',
            'slug' => 'secteur-paiement-admin-test-'.uniqid(),
            'description' => 'Description',
            'icon' => 'Store',
            'gradient' => 'from-indigo-500 to-cyan-400',
            'is_active' => true,
        ]);

        return Template::create([
            'sector_id' => $sector->id,
            'name' => 'Template Paiement Admin Test',
            'slug' => 'template-paiement-admin-test-'.uniqid(),
            'description' => 'Description',
            'price' => $price,
            'features' => ['A', 'B'],
            'is_active' => true,
        ]);
    }
}
