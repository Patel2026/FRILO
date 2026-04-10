<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentTransaction;
use App\Services\AdminAuditLogger;
use App\Services\OrderPaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Throwable;

class PaymentTransactionController extends Controller
{
    public function __construct(
        private readonly OrderPaymentService $orderPaymentService,
        private readonly AdminAuditLogger $auditLogger
    ) {}

    public function index(Request $request): View
    {
        $query = PaymentTransaction::query()
            ->with(['order.user', 'order.template.sector'])
            ->latest('id');

        if ($request->filled('status')) {
            $query->where('status', (string) $request->string('status'));
        }

        if ($request->filled('mode')) {
            $query->where('mode', (string) $request->string('mode'));
        }

        if ($request->filled('provider')) {
            $query->where('provider', (string) $request->string('provider'));
        }

        if ($request->filled('order_reference')) {
            $orderId = $this->extractOrderIdFromReference((string) $request->string('order_reference'));
            if ($orderId !== null) {
                $query->where('order_id', $orderId);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        $payments = $query->paginate(20)->withQueryString();

        $statuses = PaymentTransaction::query()
            ->select('status')
            ->distinct()
            ->orderBy('status')
            ->pluck('status');

        $modes = PaymentTransaction::query()
            ->whereNotNull('mode')
            ->select('mode')
            ->distinct()
            ->orderBy('mode')
            ->pluck('mode');

        return view('admin.payments.index', [
            'payments' => $payments,
            'statuses' => $statuses,
            'modes' => $modes,
        ]);
    }

    public function show(PaymentTransaction $payment): View
    {
        $payment->load(['order.user', 'order.template.sector', 'order.instruction']);

        return view('admin.payments.show', [
            'payment' => $payment,
        ]);
    }

    public function sync(Request $request, PaymentTransaction $payment): RedirectResponse
    {
        try {
            $updatedPayment = $this->orderPaymentService->refreshTransaction($payment);
        } catch (Throwable $exception) {
            return redirect()
                ->route('admin.payments.show', $payment)
                ->withErrors([
                    'payment_sync' => 'Synchronisation paiement impossible: '.$exception->getMessage(),
                ]);
        }

        $this->auditLogger->record(
            event: 'payment.transaction.synced',
            payload: [
                'payment_id' => $updatedPayment->id,
                'order_id' => $updatedPayment->order_id,
                'fedapay_transaction_id' => $updatedPayment->fedapay_transaction_id,
                'status' => $updatedPayment->status,
            ],
            actor: $request->user(),
            message: 'Synchronisation manuelle transaction paiement',
            targetType: 'payment_transaction',
            targetId: (string) $updatedPayment->id,
            request: $request
        );

        return redirect()
            ->route('admin.payments.show', $payment)
            ->with('success', 'Transaction synchronisée. Nouveau statut: '.$updatedPayment->status);
    }

    private function extractOrderIdFromReference(string $reference): ?int
    {
        $normalized = strtoupper(trim($reference));
        if ($normalized === '') {
            return null;
        }

        if (preg_match('/(\d+)/', $normalized, $matches) !== 1) {
            return null;
        }

        $orderId = (int) ($matches[1] ?? 0);

        return $orderId > 0 ? $orderId : null;
    }
}
