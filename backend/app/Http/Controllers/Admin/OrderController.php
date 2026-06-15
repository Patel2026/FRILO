<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RecordOrderReminderRequest;
use App\Http\Requests\Admin\UpdateOrderAssignmentRequest;
use App\Http\Requests\Admin\UpdateOrderDeliveryRequest;
use App\Http\Requests\Admin\UpdateOrderMaterialRequest;
use App\Http\Requests\Admin\UpdateOrderProductionRequest;
use App\Http\Requests\Admin\UpdateOrderQualityRequest;
use App\Models\Order;
use App\Models\User;
use App\Services\AdminAuditLogger;
use App\Services\OrderProductionService;
use App\Services\OrderService;
use App\Services\OrderTimelineService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
        private readonly OrderProductionService $orderProductionService,
        private readonly OrderTimelineService $orderTimelineService,
        private readonly AdminAuditLogger $auditLogger
    ) {}

    public function index(Request $request): \Illuminate\View\View
    {
        $query = Order::with(['user', 'template.sector', 'instruction', 'latestPayment', 'options', 'clientManager', 'technician', 'qualityValidator'])->latest();

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

    public function show(Order $order): \Illuminate\View\View
    {
        $this->authorize('update', $order);

        $order->load(['user', 'template.sector', 'instruction', 'latestPayment', 'payments', 'options', 'clientManager', 'technician', 'qualityValidator']);

        $adminUsers = User::query()
            ->whereIn('role', ['super_admin', 'ops_admin'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $timeline = $this->orderTimelineService->forOrder($order);

        return view('admin.orders.show', compact('order', 'adminUsers', 'timeline'));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $this->authorize('update', $order);

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

    public function setPreviewUrl(Request $request, Order $order): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('update', $order);

        $request->validate([
            'preview_url' => ['nullable', 'string', 'max:500', 'regex:/^(https?:\/\/|\/).*/'],
        ]);

        $order->preview_url = $request->preview_url ?: null;
        $order->save();

        $this->auditLogger->record(
            event: 'order.preview_url.set',
            payload: [
                'order_id' => $order->id,
                'preview_url' => $order->preview_url,
            ],
            actor: $request->user(),
            message: 'Lien de prévisualisation défini depuis le backoffice',
            targetType: 'order',
            targetId: (string) $order->id,
            request: $request
        );

        return redirect()
            ->route('admin.orders.show', $order)
            ->with('success', 'Lien de prévisualisation mis à jour.');
    }

    public function updateAssignment(UpdateOrderAssignmentRequest $request, Order $order): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('updateProduction', $order);

        $this->orderProductionService->updateAssignment(
            $order,
            $request->validated(),
            $request->user(),
            $request
        );

        return redirect()
            ->route('admin.orders.show', $order)
            ->with('success', 'Assignation de production mise a jour.');
    }

    public function updateMaterial(UpdateOrderMaterialRequest $request, Order $order): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('updateProduction', $order);

        $this->orderProductionService->updateMaterial(
            $order,
            $request->productionData(),
            $request->user(),
            $request
        );

        return redirect()
            ->route('admin.orders.show', $order)
            ->with('success', 'Elements client mis a jour.');
    }

    public function updateProduction(UpdateOrderProductionRequest $request, Order $order): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('updateProduction', $order);

        $this->orderProductionService->updateProduction(
            $order,
            $request->productionData(),
            $request->user(),
            $request
        );

        return redirect()
            ->route('admin.orders.show', $order)
            ->with('success', 'Suivi de production mis a jour.');
    }

    public function updateQuality(UpdateOrderQualityRequest $request, Order $order): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('updateProduction', $order);

        $this->orderProductionService->updateQuality(
            $order,
            $request->productionData(),
            $request->user(),
            $request
        );

        return redirect()
            ->route('admin.orders.show', $order)
            ->with('success', 'Controle qualite mis a jour.');
    }

    public function recordReminder(RecordOrderReminderRequest $request, Order $order): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('updateProduction', $order);

        $this->orderProductionService->recordReminder(
            $order,
            $request->validated(),
            $request->user(),
            $request
        );

        return redirect()
            ->route('admin.orders.show', $order)
            ->with('success', 'Relance client enregistree.');
    }

    public function setSiteInfo(UpdateOrderDeliveryRequest $request, Order $order): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('updateProduction', $order);

        $this->orderProductionService->updateDelivery(
            $order,
            $request->productionData(),
            $request->user(),
            $request
        );

        return redirect()
            ->route('admin.orders.show', $order)
            ->with('success', 'Informations du site mises a jour.');
    }

    public function receipt(Order $order): \Illuminate\View\View
    {
        abort_unless(request()->user()?->hasAnyAdminRole(['ops_admin', 'finance_admin']) === true, 403);

        $order->load(['user', 'template.sector', 'latestPayment', 'payments', 'options']);

        return view('admin.orders.receipt', compact('order'));
    }
}
