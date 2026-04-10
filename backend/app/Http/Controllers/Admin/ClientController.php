<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AdminAuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function __construct(private readonly AdminAuditLogger $auditLogger) {}

    public function index()
    {
        $clients = User::where('role', 'client')
            ->withCount('orders')
            ->latest()
            ->paginate(20);

        return view('admin.clients.index', compact('clients'));
    }

    public function show(User $user)
    {
        abort_if($user->isAdmin(), 404);

        $user->load(['orders.template.sector']);

        return view('admin.clients.show', compact('user'));
    }

    public function toggleActive(Request $request, User $user): RedirectResponse
    {
        abort_if(! $user->isClient(), 404);

        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $isActive = (bool) $validated['is_active'];
        $user->update(['is_active' => $isActive]);

        if (! $isActive) {
            $user->tokens()->delete();
        }

        $this->auditLogger->record(
            event: 'client.account.toggled',
            payload: [
                'client_id' => $user->id,
                'is_active' => $isActive,
            ],
            actor: $request->user(),
            message: $isActive ? 'Réactivation compte client' : 'Désactivation compte client',
            targetType: 'user',
            targetId: (string) $user->id,
            request: $request
        );

        return redirect()
            ->route('admin.clients.show', $user)
            ->with(
                'success',
                $isActive
                    ? 'Compte client réactivé.'
                    : 'Compte client désactivé et tokens révoqués.'
            );
    }
}
