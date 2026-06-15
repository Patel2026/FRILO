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

    public function test_super_admin_can_update_assignment(): void
    {
        $admin = $this->superAdmin();
        $order = $this->createOrder();

        $this->actingAs($admin)
            ->patch(route('admin.orders.assignment', $order), [
                'production_owner_name' => 'Awa Production',
                'production_assigned_at' => '2026-06-15 10:30',
            ])
            ->assertRedirect(route('admin.orders.show', $order));

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'production_owner_name' => 'Awa Production',
        ]);

        $this->assertDatabaseHas('admin_audit_logs', [
            'event' => 'order.production.assignment.updated',
            'actor_id' => $admin->id,
            'target_type' => 'order',
            'target_id' => (string) $order->id,
        ]);
    }

    public function test_super_admin_can_update_material_checks(): void
    {
        $admin = $this->superAdmin();
        $order = $this->createOrder();

        $this->actingAs($admin)
            ->patch(route('admin.orders.material', $order), [
                'material_activity_received' => '1',
                'material_logo_received' => '1',
                'material_photos_received' => '0',
                'material_texts_received' => '1',
                'material_contacts_received' => '1',
                'material_colors_received' => '0',
                'material_missing_note' => 'Photos et couleurs a confirmer.',
            ])
            ->assertRedirect(route('admin.orders.show', $order));

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'material_activity_received' => true,
            'material_logo_received' => true,
            'material_photos_received' => false,
            'material_texts_received' => true,
            'material_contacts_received' => true,
            'material_colors_received' => false,
            'material_missing_note' => 'Photos et couleurs a confirmer.',
        ]);
    }

    public function test_material_patch_preserves_absent_check_fields(): void
    {
        $admin = $this->superAdmin();
        $order = $this->createOrder([
            'material_logo_received' => true,
            'material_photos_received' => true,
            'material_missing_note' => 'Note existante.',
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.orders.material', $order), [
                'material_activity_received' => '1',
            ])
            ->assertRedirect(route('admin.orders.show', $order));

        $order->refresh();

        $this->assertTrue($order->material_activity_received);
        $this->assertTrue($order->material_logo_received);
        $this->assertTrue($order->material_photos_received);
        $this->assertSame('Note existante.', $order->material_missing_note);
    }

    public function test_super_admin_can_update_production_and_quality_checks(): void
    {
        $admin = $this->superAdmin();
        $order = $this->createOrder();

        $this->actingAs($admin)
            ->patch(route('admin.orders.production', $order), [
                'production_template_adapted' => '1',
                'production_content_integrated' => '1',
                'production_preview_prepared' => '1',
                'production_preview_sent_at' => '2026-06-15 12:00',
                'production_feedback_received' => '0',
                'production_corrections_completed' => '0',
            ])
            ->assertRedirect(route('admin.orders.show', $order));

        $this->actingAs($admin)
            ->patch(route('admin.orders.quality', $order), [
                'quality_mobile_checked' => '1',
                'quality_form_checked' => '1',
                'quality_links_checked' => '1',
                'quality_spelling_checked' => '1',
                'quality_business_info_checked' => '1',
                'quality_final_preview_validated' => '1',
            ])
            ->assertRedirect(route('admin.orders.show', $order));

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'production_template_adapted' => true,
            'production_content_integrated' => true,
            'production_preview_prepared' => true,
            'quality_mobile_checked' => true,
            'quality_form_checked' => true,
            'quality_links_checked' => true,
            'quality_spelling_checked' => true,
            'quality_business_info_checked' => true,
            'quality_final_preview_validated' => true,
        ]);
    }

    public function test_super_admin_can_record_client_reminder(): void
    {
        $admin = $this->superAdmin();
        $order = $this->createOrder(['client_reminder_count' => 1]);

        $this->actingAs($admin)
            ->patch(route('admin.orders.reminder', $order), [
                'last_client_reminder_reason' => 'Logo manquant',
                'internal_follow_up_note' => 'Relance WhatsApp envoyee au client.',
            ])
            ->assertRedirect(route('admin.orders.show', $order));

        $order->refresh();

        $this->assertSame(2, $order->client_reminder_count);
        $this->assertSame('Logo manquant', $order->last_client_reminder_reason);
        $this->assertNotNull($order->last_client_reminder_at);
    }

    public function test_client_cannot_update_order_production_data(): void
    {
        $client = $this->client();
        $order = $this->createOrder();

        $this->actingAs($client)
            ->patch(route('admin.orders.material', $order), [
                'material_activity_received' => '1',
            ])
            ->assertForbidden();
    }
}
