<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Template;
use App\Models\User;
use App\Services\PlatformSettingsService;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function __construct(private readonly PlatformSettingsService $platformSettingsService) {}

    public function index()
    {
        $stats = [
            'pending' => Order::where('status', OrderStatus::Pending)->count(),
            'processing' => Order::where('status', OrderStatus::Processing)->count(),
            'completed' => Order::where('status', OrderStatus::Completed)->count(),
            'cancelled' => Order::where('status', OrderStatus::Cancelled)->count(),
            'revenue' => Order::where('status', OrderStatus::Completed)->sum('price'),
            'clients' => User::where('role', 'client')->count(),
            'templates' => Template::active()->count(),
        ];

        $recentOrders = Order::with(['user', 'template.sector'])
            ->latest()
            ->limit(10)
            ->get();

        $sla = $this->platformSettingsService->getRuntimeSlaConfiguration();
        $confirmationMinutes = max(1, (int) ($sla['confirmation_minutes'] ?? 120));
        $deliveryHours = max(1, (int) ($sla['delivery_hours'] ?? 48));

        $pendingCutoff = Carbon::now()->subMinutes($confirmationMinutes);
        $processingCutoff = Carbon::now()->subHours($deliveryHours);

        $overdueConfirmationCount = Order::query()
            ->where('status', OrderStatus::Pending)
            ->where('created_at', '<', $pendingCutoff)
            ->count();

        $overdueDeliveryCount = Order::query()
            ->where('status', OrderStatus::Processing)
            ->where('created_at', '<', $processingCutoff)
            ->count();

        $slaOverdueOrders = Order::query()
            ->with(['user', 'template.sector'])
            ->where(function ($query) use ($pendingCutoff, $processingCutoff): void {
                $query
                    ->where(function ($subQuery) use ($pendingCutoff): void {
                        $subQuery
                            ->where('status', OrderStatus::Pending)
                            ->where('created_at', '<', $pendingCutoff);
                    })
                    ->orWhere(function ($subQuery) use ($processingCutoff): void {
                        $subQuery
                            ->where('status', OrderStatus::Processing)
                            ->where('created_at', '<', $processingCutoff);
                    });
            })
            ->latest()
            ->limit(10)
            ->get();

        $slaAlerts = [
            'confirmation_minutes' => $confirmationMinutes,
            'delivery_hours' => $deliveryHours,
            'overdue_confirmation_count' => $overdueConfirmationCount,
            'overdue_delivery_count' => $overdueDeliveryCount,
        ];

        return view('admin.dashboard', compact('stats', 'recentOrders', 'slaAlerts', 'slaOverdueOrders'));
    }
}
