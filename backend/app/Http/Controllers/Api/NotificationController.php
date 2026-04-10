<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->integer('per_page', 20);
        $perPage = max(1, min($perPage, 100));

        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'data' => $notifications->getCollection()
                ->map(fn (DatabaseNotification $notification) => $this->transformNotification($notification))
                ->values(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
            'links' => [
                'first' => $notifications->url(1),
                'last' => $notifications->url($notifications->lastPage()),
                'prev' => $notifications->previousPageUrl(),
                'next' => $notifications->nextPageUrl(),
            ],
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->whereKey($id)
            ->firstOrFail();

        if (! $notification->read_at) {
            $notification->markAsRead();
            $notification->refresh();
        }

        return response()->json([
            'notification' => $this->transformNotification($notification),
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'marked_all_read' => true,
            'unread_count' => 0,
        ]);
    }

    private function transformNotification(DatabaseNotification $notification): array
    {
        $data = is_array($notification->data) ? $notification->data : [];
        $fallbackType = Str::snake(class_basename($notification->type));

        return [
            'id' => $notification->id,
            'type' => (string) ($data['type'] ?? $fallbackType),
            'title' => (string) ($data['title'] ?? 'Notification'),
            'message' => (string) ($data['message'] ?? ''),
            'action_url' => isset($data['action_url']) && is_string($data['action_url']) ? $data['action_url'] : null,
            'action_label' => isset($data['action_label']) && is_string($data['action_label']) ? $data['action_label'] : null,
            'is_read' => $notification->read_at !== null,
            'read_at' => optional($notification->read_at)?->toISOString(),
            'created_at' => optional($notification->created_at)?->toISOString(),
            'data' => $data,
        ];
    }
}
