<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\AdminAuditLogger;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
        private readonly AdminAuditLogger $auditLogger
    ) {}

    public function index(Request $request)
    {
        $query = Order::with(['user', 'template.sector', 'instruction', 'latestPayment'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        $orders = $query->paginate(20);
        $statuses = OrderStatus::cases();
        $paymentStatuses = PaymentStatus::cases();

        return view('admin.orders.index', compact('orders', 'statuses', 'paymentStatuses'));
    }

    public function show(Order $order)
    {
        $order->load(['user', 'template.sector', 'instruction', 'latestPayment']);

        return view('admin.orders.show', compact('order'));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $statusValues = array_map(
            static fn (OrderStatus $status) => $status->value,
            OrderStatus::cases()
        );

        $request->validate([
            'status' => ['required', 'string', Rule::in($statusValues)],
        ]);

        $newStatus = OrderStatus::from($request->status);
        $previousStatus = $order->status;
        $this->orderService->updateStatus($order, $newStatus);

        Log::info('admin.order.status.changed', [
            'order_id' => $order->id,
            'new_status' => $newStatus->value,
            'admin_user_id' => $request->user()->id,
        ]);
        $this->auditLogger->record(
            event: 'order.status.changed',
            payload: [
                'order_id' => $order->id,
                'from' => $previousStatus->value,
                'to' => $newStatus->value,
            ],
            actor: $request->user(),
            message: 'Changement statut commande depuis backoffice',
            targetType: 'order',
            targetId: (string) $order->id,
            request: $request
        );

        return redirect()
            ->route('admin.orders.show', $order)
            ->with('success', 'Statut mis à jour : '.$newStatus->label());
    }
}
