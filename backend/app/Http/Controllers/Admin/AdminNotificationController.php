<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SendAdminNotificationRequest;
use App\Models\User;
use App\Notifications\AdminManualNotification;
use App\Services\AdminAuditLogger;
use App\Services\AdminNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\View\View;

class AdminNotificationController extends Controller
{
    public function __construct(
        private readonly AdminNotificationService $adminNotificationService,
        private readonly AdminAuditLogger $auditLogger
    ) {}

    public function index(Request $request): View
    {
        $audience = (string) $request->string('audience', 'all');
        $status = (string) $request->string('status', 'all');
        $search = trim((string) $request->string('search', ''));

        $query = DatabaseNotification::query()
            ->where('notifiable_type', User::class)
            ->with('notifiable')
            ->latest('created_at');

        if ($audience === 'clients') {
            $query->whereHasMorph('notifiable', [User::class], function ($userQuery): void {
                $userQuery->where('role', 'client');
            });
        } elseif ($audience === 'super_admins') {
            $query->whereHasMorph('notifiable', [User::class], function ($userQuery): void {
                $userQuery->where('role', 'super_admin');
            });
        }

        if ($status === 'unread') {
            $query->whereNull('read_at');
        } elseif ($status === 'read') {
            $query->whereNotNull('read_at');
        }

        if ($search !== '') {
            $query->whereHasMorph('notifiable', [User::class], function ($userQuery) use ($search): void {
                $userQuery
                    ->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%');
            });
        }

        $notifications = $query->paginate(25)->withQueryString();

        return view('admin.notifications.index', [
            'notifications' => $notifications,
            'clients' => User::query()
                ->where('role', 'client')
                ->where('is_active', true)
                ->orderBy('name')
                ->limit(300)
                ->get(['id', 'name', 'email']),
            'superAdmins' => User::query()
                ->where('role', 'super_admin')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
            'filters' => [
                'audience' => $audience,
                'status' => $status,
                'search' => $search,
            ],
            'stats' => [
                'total' => (int) DatabaseNotification::query()->where('notifiable_type', User::class)->count(),
                'unread' => (int) DatabaseNotification::query()->where('notifiable_type', User::class)->whereNull('read_at')->count(),
                'clients' => (int) User::query()->where('role', 'client')->count(),
            ],
        ]);
    }

    public function send(SendAdminNotificationRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $audience = (string) $validated['audience'];

        $recipients = match ($audience) {
            'all_clients' => User::query()
                ->where('role', 'client')
                ->where('is_active', true)
                ->orderBy('id')
                ->get(),
            'all_super_admins' => User::query()
                ->where('role', 'super_admin')
                ->where('is_active', true)
                ->orderBy('id')
                ->get(),
            default => User::query()
                ->whereIn('id', $validated['user_ids'] ?? [])
                ->where('is_active', true)
                ->orderBy('id')
                ->get(),
        };

        if ($recipients->isEmpty()) {
            return back()->withErrors(['notifications' => 'Aucun destinataire actif trouvé pour cet envoi.']);
        }

        $notification = new AdminManualNotification(
            payload: [
                'title' => $validated['title'],
                'message' => $validated['message'],
                'action_url' => $validated['action_url'] ?? null,
                'action_label' => $validated['action_label'] ?? null,
                'sent_by_id' => $request->user()->id,
                'sent_by_name' => $request->user()->name,
                'audience' => $audience,
            ],
            sendEmail: (bool) ($validated['send_email'] ?? false)
        );

        $count = $this->adminNotificationService->notifyUsers($recipients, $notification);

        $this->auditLogger->record(
            event: 'admin.notification.sent',
            payload: [
                'audience' => $audience,
                'count' => $count,
                'title' => $validated['title'],
            ],
            actor: $request->user(),
            message: 'Envoi notification admin',
            targetType: 'notification',
            targetId: null
        );

        return redirect()
            ->route('admin.notifications.index')
            ->with('success', 'Notification envoyée à '.$count.' utilisateur(s).');
    }

    public function markRead(Request $request, string $id): RedirectResponse
    {
        $notification = $this->findNotificationOrFail($id);
        $notification->update(['read_at' => now()]);

        $this->auditLogger->record(
            event: 'admin.notification.marked_read',
            payload: ['notification_id' => $notification->id],
            actor: $request->user(),
            message: 'Notification marquée lue',
            targetType: 'notification',
            targetId: $notification->id
        );

        return redirect()->route('admin.notifications.index')->with('success', 'Notification marquée comme lue.');
    }

    public function markUnread(Request $request, string $id): RedirectResponse
    {
        $notification = $this->findNotificationOrFail($id);
        $notification->update(['read_at' => null]);

        $this->auditLogger->record(
            event: 'admin.notification.marked_unread',
            payload: ['notification_id' => $notification->id],
            actor: $request->user(),
            message: 'Notification marquée non lue',
            targetType: 'notification',
            targetId: $notification->id
        );

        return redirect()->route('admin.notifications.index')->with('success', 'Notification marquée comme non lue.');
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $updated = DatabaseNotification::query()
            ->where('notifiable_type', User::class)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $this->auditLogger->record(
            event: 'admin.notification.marked_all_read',
            payload: ['count' => $updated],
            actor: $request->user(),
            message: 'Toutes les notifications marquées lues',
            targetType: 'notification',
            targetId: null
        );

        return redirect()
            ->route('admin.notifications.index')
            ->with('success', $updated.' notification(s) marquée(s) comme lue(s).');
    }

    private function findNotificationOrFail(string $id): DatabaseNotification
    {
        return DatabaseNotification::query()
            ->where('id', $id)
            ->where('notifiable_type', User::class)
            ->firstOrFail();
    }
}
