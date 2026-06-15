<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RecordRenewalReminderRequest;
use App\Models\Order;
use App\Services\RenewalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\View\View;

class RenewalController extends Controller
{
    public function __construct(private readonly RenewalService $renewalService) {}

    public function index(Request $request): View
    {
        $cutoff = Carbon::now()->addDays(60)->toDateString();

        $orders = Order::query()
            ->with(['user', 'template.sector'])
            ->whereNotNull('hosting_expires_at')
            ->whereDate('hosting_expires_at', '<=', $cutoff)
            ->when($request->filled('status'), fn ($query) => $query->where('hosting_renewal_status', $request->string('status')))
            ->orderBy('hosting_expires_at')
            ->paginate(20)
            ->withQueryString();

        return view('admin.renewals.index', [
            'orders' => $orders,
            'statuses' => ['unpaid', 'reminded', 'paid'],
        ]);
    }

    public function recordReminder(RecordRenewalReminderRequest $request, Order $order): RedirectResponse
    {
        $this->renewalService->recordReminder($order, $request->validated(), $request->user(), $request);

        return redirect()
            ->route('admin.renewals.index')
            ->with('success', 'Relance renouvellement enregistrée.');
    }

    public function markPaid(Request $request, Order $order): RedirectResponse
    {
        abort_unless($request->user()?->hasAnyAdminRole(['finance_admin']) === true, 403);

        $this->renewalService->markPaid($order, $request->user(), $request);

        return redirect()
            ->route('admin.renewals.index')
            ->with('success', 'Renouvellement marqué payé.');
    }
}
