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
use Tests\TestCase;

class OperationalBackofficeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);
    }

    private function userWithRole(string $role): User
    {
        return User::factory()->create([
            'role' => $role,
            'is_active' => true,
        ]);
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
            'user_id' => User::factory()->create(['role' => 'client', 'is_active' => true])->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Processing,
            'payment_status' => PaymentStatus::Paid,
            'price' => 75000,
            'paid_at' => now(),
        ], $attributes));
    }

    public function test_admin_roles_have_separate_permissions(): void
    {
        $order = $this->createOrder();

        $this->actingAs($this->userWithRole('ops_admin'))
            ->get(route('admin.orders.show', $order))
            ->assertOk();

        $this->actingAs($this->userWithRole('ops_admin'))
            ->get(route('admin.settings.index'))
            ->assertForbidden();

        $this->actingAs($this->userWithRole('content_admin'))
            ->get(route('admin.orders.show', $order))
            ->assertForbidden();

        $this->actingAs($this->userWithRole('finance_admin'))
            ->get(route('admin.payments.index'))
            ->assertOk();

        $this->actingAs($this->userWithRole('finance_admin'))
            ->get(route('admin.content.pages.index'))
            ->assertForbidden();
    }

    public function test_order_can_be_assigned_to_admin_team_members(): void
    {
        $superAdmin = $this->userWithRole('super_admin');
        $clientManager = $this->userWithRole('ops_admin');
        $technician = $this->userWithRole('ops_admin');
        $qualityValidator = $this->userWithRole('ops_admin');
        $order = $this->createOrder();

        $this->actingAs($superAdmin)
            ->patch(route('admin.orders.assignment', $order), [
                'client_manager_id' => $clientManager->id,
                'technician_id' => $technician->id,
                'quality_validator_id' => $qualityValidator->id,
                'production_assigned_at' => '2026-06-15 10:30',
            ])
            ->assertRedirect(route('admin.orders.show', $order));

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'client_manager_id' => $clientManager->id,
            'technician_id' => $technician->id,
            'quality_validator_id' => $qualityValidator->id,
        ]);
    }

    public function test_completed_status_requires_quality_and_delivery_completion(): void
    {
        $admin = $this->userWithRole('ops_admin');
        $order = $this->createOrder([
            'status' => OrderStatus::Processing,
            'quality_mobile_checked' => true,
            'quality_form_checked' => true,
            'quality_links_checked' => true,
            'quality_spelling_checked' => true,
            'quality_business_info_checked' => true,
            'quality_final_preview_validated' => false,
            'site_url' => 'https://client.test',
            'domain' => 'client.test',
            'hosting_expires_at' => '2027-06-15',
            'delivery_ssl_checked' => true,
            'delivery_form_checked' => true,
            'delivery_mobile_checked' => true,
            'delivery_access_transferred' => true,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.orders.status', $order), ['status' => OrderStatus::Completed->value])
            ->assertSessionHasErrors('status');

        $order->update(['quality_final_preview_validated' => true]);

        $this->actingAs($admin)
            ->patch(route('admin.orders.status', $order), ['status' => OrderStatus::Completed->value])
            ->assertRedirect(route('admin.orders.show', $order));

        $this->assertSame(OrderStatus::Completed, $order->fresh()->status);
    }

    public function test_reminder_stores_message_and_notifies_client(): void
    {
        $admin = $this->userWithRole('ops_admin');
        $order = $this->createOrder(['client_reminder_count' => 0]);

        $this->actingAs($admin)
            ->patch(route('admin.orders.reminder', $order), [
                'last_client_reminder_reason' => 'Logo manquant',
                'last_client_reminder_message' => 'Bonjour, merci de nous envoyer votre logo.',
                'internal_follow_up_note' => 'Relance via espace client.',
            ])
            ->assertRedirect(route('admin.orders.show', $order));

        $order->refresh();

        $this->assertSame(1, $order->client_reminder_count);
        $this->assertSame('Bonjour, merci de nous envoyer votre logo.', $order->last_client_reminder_message);
        $this->assertDatabaseHas('notifications', [
            'notifiable_type' => User::class,
            'notifiable_id' => $order->user_id,
        ]);
    }

    public function test_order_detail_displays_timeline_and_receipt_link(): void
    {
        $admin = $this->userWithRole('super_admin');
        $order = $this->createOrder([
            'site_url' => 'https://client.test',
            'domain' => 'client.test',
            'hosting_expires_at' => '2027-06-15',
        ]);

        PaymentTransaction::create([
            'order_id' => $order->id,
            'amount' => 75000,
            'currency' => 'XOF',
            'status' => 'approved',
            'fedapay_reference' => 'FP-123',
            'completed_at' => now(),
        ]);

        $this->actingAs($admin)
            ->get(route('admin.orders.show', $order))
            ->assertOk()
            ->assertSee('Timeline commande')
            ->assertSee('Commande créée')
            ->assertSee('Paiement reçu')
            ->assertSee(route('admin.orders.receipt', $order));

        $this->actingAs($admin)
            ->get(route('admin.orders.receipt', $order))
            ->assertOk()
            ->assertSee('Reçu FRILO')
            ->assertSee('FP-123')
            ->assertSee('75 000 FCFA');
    }

    public function test_finance_admin_can_manage_hosting_renewals(): void
    {
        $finance = $this->userWithRole('finance_admin');
        $order = $this->createOrder([
            'site_url' => 'https://client.test',
            'domain' => 'client.test',
            'hosting_expires_at' => now()->addDays(20)->toDateString(),
            'hosting_renewal_status' => 'unpaid',
            'hosting_renewal_reminder_count' => 0,
        ]);

        $this->actingAs($finance)
            ->get(route('admin.renewals.index'))
            ->assertOk()
            ->assertSee('Renouvellements')
            ->assertSee('client.test');

        $this->actingAs($finance)
            ->patch(route('admin.renewals.reminder', $order), [
                'hosting_renewal_note' => 'Relance renouvellement envoyee.',
            ])
            ->assertRedirect(route('admin.renewals.index'));

        $this->assertSame(1, $order->fresh()->hosting_renewal_reminder_count);

        $this->actingAs($finance)
            ->patch(route('admin.renewals.mark-paid', $order))
            ->assertRedirect(route('admin.renewals.index'));

        $this->assertSame('paid', $order->fresh()->hosting_renewal_status);
        $this->assertNotNull($order->fresh()->hosting_renewal_paid_at);
    }

    public function test_super_admin_can_manage_admin_team(): void
    {
        $superAdmin = $this->userWithRole('super_admin');

        $this->actingAs($superAdmin)
            ->get(route('admin.team.index'))
            ->assertOk()
            ->assertSee('Equipe admin');

        $this->actingAs($superAdmin)
            ->post(route('admin.team.store'), [
                'name' => 'Awa Ops',
                'email' => 'awa.ops@example.test',
                'role' => 'ops_admin',
                'password' => 'Password123!',
                'is_active' => '1',
            ])
            ->assertRedirect(route('admin.team.index'));

        $this->assertDatabaseHas('users', [
            'email' => 'awa.ops@example.test',
            'role' => 'ops_admin',
            'is_active' => true,
        ]);
    }
}
