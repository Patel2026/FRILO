<?php

namespace Tests\Feature\Admin;

use App\Models\Order;
use App\Models\Sector;
use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderSiteInfoTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser(): User
    {
        return User::factory()->create(['role' => 'super_admin']);
    }

    private function clientUser(): User
    {
        return User::factory()->create(['role' => 'client']);
    }

    private function createOrder(): Order
    {
        $sector = Sector::create([
            'name'     => 'Commerce',
            'slug'     => 'commerce-'.uniqid(),
            'description' => 'Secteur test',
            'icon'     => 'ShoppingBag',
            'gradient' => 'from-blue-400 to-indigo-500',
            'is_active' => true,
        ]);

        $template = Template::create([
            'sector_id'   => $sector->id,
            'name'        => 'Template Test',
            'slug'        => 'template-test-'.uniqid(),
            'description' => 'Description test',
            'price'       => 50000,
            'features'    => ['A', 'B'],
            'is_active'   => true,
        ]);

        $user = User::factory()->create(['role' => 'client', 'is_active' => true]);

        return Order::create([
            'user_id'        => $user->id,
            'template_id'    => $template->id,
            'status'         => 'processing',
            'payment_status' => 'paid',
            'price'          => 50000,
        ]);
    }

    public function test_super_admin_can_set_site_info(): void
    {
        $admin = $this->adminUser();
        $order = $this->createOrder();

        $this->actingAs($admin)
            ->patch(route('admin.orders.site', $order), [
                'site_url'           => 'https://monboutique.com',
                'domain'             => 'monboutique.com',
                'hosting_expires_at' => '2027-06-01',
            ])
            ->assertRedirect(route('admin.orders.show', $order));

        $this->assertDatabaseHas('orders', [
            'id'       => $order->id,
            'site_url' => 'https://monboutique.com',
            'domain'   => 'monboutique.com',
        ]);
    }

    public function test_client_cannot_access_admin_site_route(): void
    {
        $client = $this->clientUser();
        $order  = $this->createOrder();

        // AdminMiddleware retourne abort(403) pour un utilisateur connecté non super_admin
        $this->actingAs($client)
            ->patch(route('admin.orders.site', $order), [
                'site_url' => 'https://hack.com',
            ])
            ->assertStatus(403);
    }

    public function test_invalid_site_url_is_rejected(): void
    {
        $admin = $this->adminUser();
        $order = $this->createOrder();

        $this->actingAs($admin)
            ->patch(route('admin.orders.site', $order), [
                'site_url' => 'javascript:alert(1)',
            ])
            ->assertSessionHasErrors(['site_url']);
    }

    public function test_site_fields_can_be_cleared(): void
    {
        $admin = $this->adminUser();
        $order = $this->createOrder();

        $order->update(['site_url' => 'https://old.com', 'domain' => 'old.com']);

        $this->actingAs($admin)
            ->patch(route('admin.orders.site', $order), [
                'site_url' => null,
                'domain'   => null,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'site_url' => null]);
    }
}
