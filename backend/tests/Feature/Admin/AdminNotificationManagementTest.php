<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Tests\TestCase;

class AdminNotificationManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);
    }

    public function test_super_admin_can_send_manual_notification_to_selected_users(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        $clientA = User::factory()->create(['role' => 'client']);
        $clientB = User::factory()->create(['role' => 'client']);

        $this->actingAs($superAdmin)
            ->post('/admin/notifications/send', [
                'audience' => 'selected_users',
                'user_ids' => [$clientA->id],
                'title' => 'Maintenance FRILO',
                'message' => 'Une maintenance est prévue ce soir.',
                'action_url' => '/dashboard',
                'action_label' => 'Voir le dashboard',
                'send_email' => 0,
            ])
            ->assertRedirect('/admin/notifications');

        $notification = DatabaseNotification::query()
            ->where('notifiable_type', User::class)
            ->where('notifiable_id', $clientA->id)
            ->latest('created_at')
            ->first();

        $this->assertNotNull($notification);
        $this->assertSame('Maintenance FRILO', data_get($notification->data, 'title'));

        $missingForClientB = DatabaseNotification::query()
            ->where('notifiable_type', User::class)
            ->where('notifiable_id', $clientB->id)
            ->where('created_at', '>=', now()->subMinute())
            ->exists();
        $this->assertFalse($missingForClientB);
    }

    public function test_super_admin_can_mark_notification_read_and_unread(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        $target = User::factory()->create(['role' => 'client']);

        $this->actingAs($superAdmin)
            ->post('/admin/notifications/send', [
                'audience' => 'selected_users',
                'user_ids' => [$target->id],
                'title' => 'Info',
                'message' => 'Message test',
            ]);

        $notification = DatabaseNotification::query()
            ->where('notifiable_type', User::class)
            ->where('notifiable_id', $target->id)
            ->latest('created_at')
            ->firstOrFail();

        $this->assertNull($notification->read_at);

        $this->actingAs($superAdmin)
            ->post('/admin/notifications/'.$notification->id.'/read')
            ->assertRedirect('/admin/notifications');

        $notification->refresh();
        $this->assertNotNull($notification->read_at);

        $this->actingAs($superAdmin)
            ->post('/admin/notifications/'.$notification->id.'/unread')
            ->assertRedirect('/admin/notifications');

        $notification->refresh();
        $this->assertNull($notification->read_at);
    }

    public function test_client_cannot_access_admin_notification_center(): void
    {
        $client = User::factory()->create(['role' => 'client']);

        $this->actingAs($client)
            ->get('/admin/notifications')
            ->assertForbidden();
    }
}
