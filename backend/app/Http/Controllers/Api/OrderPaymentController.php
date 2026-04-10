<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\InitiateOrderPaymentRequest;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Services\OrderPaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class OrderPaymentController extends Controller
{
    public function __construct(private readonly OrderPaymentService $orderPaymentService) {}

    public function store(InitiateOrderPaymentRequest $request, int $id): JsonResponse
    {
        $order = Order::with(['latestPayment'])->findOrFail($id);
        $this->authorize('view', $order);

        try {
            $result = $this->orderPaymentService->initiatePayment(
                $order,
                $request->user(),
                $request->validated()
            );
        } catch (Throwable $exception) {
            throw new HttpException(422, $exception->getMessage(), $exception);
        }

        /** @var Order $updatedOrder */
        $updatedOrder = $result['order'];
        /** @var PaymentTransaction|null $payment */
        $payment = $result['payment'];

        return response()->json([
            'order' => $this->transformOrder($updatedOrder),
            'payment' => $this->transformPayment($payment),
            'already_paid' => (bool) ($result['already_paid'] ?? false),
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::with(['latestPayment'])->findOrFail($id);
        $this->authorize('view', $order);

        $refresh = $request->boolean('refresh', false);
        if ($refresh) {
            try {
                $order = $this->orderPaymentService->refreshPaymentStatus($order);
            } catch (Throwable $exception) {
                throw new HttpException(422, $exception->getMessage(), $exception);
            }
        } else {
            $order = $order->fresh(['latestPayment']);
        }

        return response()->json([
            'order' => $this->transformOrder($order),
            'payment' => $this->transformPayment($order->latestPayment),
        ]);
    }

    private function transformOrder(Order $order): array
    {
        $orderStatus = is_object($order->status) && isset($order->status->value)
            ? $order->status->value
            : (string) $order->status;

        $paymentStatus = $order->payment_status instanceof PaymentStatus
            ? $order->payment_status->value
            : (string) $order->payment_status;

        return [
            'id' => $order->id,
            'status' => $orderStatus,
            'payment_status' => $paymentStatus,
            'paid_at' => optional($order->paid_at)?->toISOString(),
            'price' => (int) $order->price,
        ];
    }

    private function transformPayment(?PaymentTransaction $payment): ?array
    {
        if (! $payment) {
            return null;
        }

        return [
            'id' => $payment->id,
            'provider' => $payment->provider,
            'status' => $payment->status,
            'mode' => $payment->mode,
            'amount' => (int) $payment->amount,
            'currency' => $payment->currency,
            'fedapay_transaction_id' => $payment->fedapay_transaction_id,
            'reference' => $payment->fedapay_reference,
            'checkout_url' => $payment->checkout_url,
            'initiated_at' => optional($payment->initiated_at)?->toISOString(),
            'completed_at' => optional($payment->completed_at)?->toISOString(),
        ];
    }
}
