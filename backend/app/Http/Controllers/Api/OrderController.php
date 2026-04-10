<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CreateOrderRequest;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function __construct(private OrderService $orderService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Order::class);

        $perPage = (int) $request->integer('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $orders = Order::with(['template.sector', 'instruction', 'latestPayment'])
            ->forUser($request->user()->id)
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'data' => $orders->getCollection()
                ->map(fn (Order $order) => $this->transformOrder($order))
                ->values(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
            'links' => [
                'first' => $orders->url(1),
                'last' => $orders->url($orders->lastPage()),
                'prev' => $orders->previousPageUrl(),
                'next' => $orders->nextPageUrl(),
            ],
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Order::class);

        $counts = Order::query()
            ->forUser($request->user()->id)
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $statusCounts = [
            OrderStatus::Pending->value => (int) ($counts[OrderStatus::Pending->value] ?? 0),
            OrderStatus::Processing->value => (int) ($counts[OrderStatus::Processing->value] ?? 0),
            OrderStatus::Completed->value => (int) ($counts[OrderStatus::Completed->value] ?? 0),
            OrderStatus::Cancelled->value => (int) ($counts[OrderStatus::Cancelled->value] ?? 0),
        ];

        return response()->json([
            'total' => array_sum($statusCounts),
            ...$statusCounts,
        ]);
    }

    public function store(CreateOrderRequest $request): JsonResponse
    {
        $this->authorize('create', Order::class);

        $order = $this->orderService->createOrder(
            $request->validated(),
            $request->user()
        );

        Log::info('api.order.store.success', [
            'order_id' => $order->id,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($this->transformOrder($order), 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::with(['template.sector', 'instruction', 'latestPayment'])
            ->findOrFail($id);

        $this->authorize('view', $order);

        return response()->json($this->transformOrder($order));
    }

    private function transformOrder(Order $order): array
    {
        $instruction = $order->instruction ? [
            'id' => $order->instruction->id,
            'enterprise_name' => $order->instruction->enterprise_name,
            'activity_description' => $order->instruction->activity_description,
            'colors' => $order->instruction->colors ?? [],
            'specific_instructions' => $order->instruction->specific_instructions,
        ] : null;

        $status = $order->status instanceof OrderStatus
            ? $order->status->value
            : (string) $order->status;

        $paymentStatus = $order->payment_status instanceof PaymentStatus
            ? $order->payment_status->value
            : (string) $order->payment_status;

        return [
            'id' => $order->id,
            'status' => $status,
            'payment_status' => $paymentStatus,
            'paid_at' => optional($order->paid_at)?->toISOString(),
            'price' => (int) $order->price,
            'created_at' => optional($order->created_at)?->toISOString(),
            'template' => $order->template ? [
                'id' => $order->template->id,
                'name' => $order->template->name,
                'sector' => $order->template->sector ? [
                    'id' => $order->template->sector->id,
                    'name' => $order->template->sector->name,
                    'slug' => $order->template->sector->slug,
                ] : null,
            ] : null,
            // Contract V1 canonical
            'instruction' => $instruction,
            // Backward compatibility for existing front implementations
            'instructions' => $instruction ? [$instruction] : [],
            'payment' => $order->latestPayment ? [
                'id' => $order->latestPayment->id,
                'provider' => $order->latestPayment->provider,
                'status' => $order->latestPayment->status,
                'mode' => $order->latestPayment->mode,
                'reference' => $order->latestPayment->fedapay_reference,
                'checkout_url' => $order->latestPayment->checkout_url,
                'fedapay_transaction_id' => $order->latestPayment->fedapay_transaction_id,
            ] : null,
        ];
    }
}
