<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_notifications_with_unread_count(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $this->createNotification($user, read: false, title: 'Commande créée');
        $this->createNotification($user, read: true, title: 'Paiement mis à jour');
        $this->createNotification($otherUser, read: false, title: 'Autre client');

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/notifications?per_page=10');

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'type',
                    'title',
                    'message',
                    'action_url',
                    'action_label',
                    'is_read',
                    'read_at',
                    'created_at',
                    'data',
                ],
            ],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            'links' => ['first', 'last', 'prev', 'next'],
            'unread_count',
        ]);
        $response->assertJsonPath('meta.total', 2);
        $response->assertJsonPath('unread_count', 1);
    }

    public function test_authenticated_user_can_mark_single_notification_as_read(): void
    {
        $user = User::factory()->create();
        $notification = $this->createNotification($user, read: false);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/notifications/{$notification->id}/read");

        $response->assertOk();
        $response->assertJsonPath('notification.id', $notification->id);
        $response->assertJsonPath('notification.is_read', true);
        $response->assertJsonPath('unread_count', 0);

        $this->assertNotNull(
            $user->notifications()->whereKey($notification->id)->first()?->read_at
        );
    }

    public function test_authenticated_user_can_mark_all_notifications_as_read(): void
    {
        $user = User::factory()->create();
        $this->createNotification($user, read: false, title: 'N1');
        $this->createNotification($user, read: false, title: 'N2');
        $this->createNotification($user, read: true, title: 'N3');

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/notifications/read-all');

        $response->assertOk();
        $response->assertJsonPath('marked_all_read', true);
        $response->assertJsonPath('unread_count', 0);

        $this->assertSame(0, $user->unreadNotifications()->count());
    }

    public function test_user_cannot_mark_notification_of_another_user(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $foreignNotification = $this->createNotification($owner, read: false);

        Sanctum::actingAs($intruder);

        $this->postJson("/api/notifications/{$foreignNotification->id}/read")
            ->assertNotFound();
    }

    private function createNotification(User $user, bool $read, string $title = 'Notification test'): DatabaseNotification
    {
        /** @var DatabaseNotification $notification */
        $notification = $user->notifications()->create([
            'id' => (string) Str::uuid(),
            'type' => 'App\\Notifications\\TestNotification',
            'data' => [
                'type' => 'test_notification',
                'title' => $title,
                'message' => 'Message de test',
                'action_url' => '/dashboard/orders/1',
                'action_label' => 'Voir',
            ],
            'read_at' => $read ? Carbon::now() : null,
        ]);

        return $notification;
    }
}
