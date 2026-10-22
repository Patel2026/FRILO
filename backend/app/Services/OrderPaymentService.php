<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\User;
use App\Notifications\OrderPaymentStatusUpdatedNotification;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class OrderPaymentService
{
    public function __construct(
        private readonly FedapayClient $fedapayClient,
        private readonly PlatformSettingsService $platformSettingsService,
        private readonly AdminNotificationService $adminNotificationService
    ) {}

    public function initiatePayment(Order $order, User $user, array $payload = []): array
    {
        if ((int) $order->user_id !== (int) $user->id) {
            throw new RuntimeException('Cette commande ne vous appartient pas.');
        }

        $mode = strtolower(trim((string) ($payload['mode'] ?? 'checkout'))) ?: 'checkout';
        $directMode = $mode !== 'checkout' ? $mode : null;
        $phoneNumber = $this->sanitizePhoneNumber($payload['phone_number'] ?? null);
        $paymentConfig = $this->platformSettingsService->getRuntimePaymentConfiguration();
        $this->fedapayClient->assertConfigured();

        // Commit the reservation before any external request. An interrupted request
        // must never release a potentially accepted payment for blind retry.
        [$order, $payment, $reserved] = DB::transaction(function () use ($order, $mode, $paymentConfig) {
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);
            $payment = $order->latestPayment()->first();
            if ($this->normalizeOrderPaymentStatus($order)->isPaid()) {
                return [$order, $payment, false];
            }
            if ($order->status === \App\Enums\OrderStatus::Cancelled || $this->normalizeOrderPaymentStatus($order) === PaymentStatus::Refunded) {
                throw new HttpException(409, 'Cette commande ne peut plus être payée.');
            }
            if ($payment && ($payment->status === 'checkout_token_failed' || ($payment->status === 'pending' && $payment->last_error_code === 'checkout_token_failed')) && $payment->fedapay_transaction_id && $mode === 'checkout' && $payment->mode === 'checkout') {
                $payment->update(['status' => 'initiating']);

                return [$order, $payment, true];
            }
            if ($payment && ! in_array($payment->status, ['initialization_failed', 'declined', 'canceled', 'cancelled', 'expired'], true)) {
                if ($payment->status === 'initiating' || ! $payment->checkout_url || $payment->mode !== $mode) {
                    throw new HttpException(409, 'Un paiement est déjà en cours de vérification. Consultez votre commande ou contactez le support avant de réessayer.');
                }

                return [$order, $payment, false];
            }
            $payment = PaymentTransaction::create([
                'order_id' => $order->id,
                'provider' => 'fedapay',
                'mode' => $mode,
                'amount' => (int) $order->price,
                'currency' => (string) ($paymentConfig['currency'] ?? 'XOF'),
                'status' => 'initiating',
                'initiated_at' => now(),
            ]);

            return [$order, $payment, true];
        });
        if (! $reserved) {
            return ['order' => $order->load('latestPayment'), 'payment' => $payment, 'already_paid' => $this->normalizeOrderPaymentStatus($order)->isPaid()];
        }

        if (! $payment->fedapay_transaction_id) {
            try {
                $customerId = $this->resolveFedapayCustomerId($user, $phoneNumber);
            } catch (\Throwable $exception) {
                $payment->update(['status' => 'initialization_failed']);
                throw $exception;
            }
            $paymentConfig = $this->platformSettingsService->getRuntimePaymentConfiguration();
            $transactionPayload = [
                'description' => 'Commande FRILO '.$this->orderReference($order->id),
                'amount' => (int) $order->price,
                'currency' => [
                    'iso' => (string) ($paymentConfig['currency'] ?? 'XOF'),
                ],
                'callback_url' => $this->buildCallbackUrl($order),
                'customer' => [
                    'id' => $customerId,
                ],
                'merchant_reference' => $this->merchantReference($order->id),
                'custom_metadata' => [
                    'order_id' => (string) $order->id,
                    'order_reference' => $this->orderReference($order->id),
                    'user_id' => (string) $user->id,
                ],
            ];

            if ($directMode) {
                $transactionPayload['mode'] = $directMode;
            }

            $transaction = $this->fedapayClient->createTransaction($transactionPayload);
            $transactionId = (int) ($transaction['id'] ?? 0);
            if ($transactionId < 1) {
                throw new RuntimeException('FedaPay n’a pas retourné un identifiant de transaction valide.');
            }

            $payment->update(['fedapay_transaction_id' => $transactionId]);
        } else {
            $transactionId = (int) $payment->fedapay_transaction_id;
            try {
                $transaction = $this->fedapayClient->getTransaction($transactionId);
            } catch (\Throwable $exception) {
                PaymentTransaction::whereKey($payment->id)->whereIn('status', ['initiating', 'pending'])->update(['status' => 'checkout_token_failed', 'last_error_code' => 'checkout_token_failed']);
                throw $exception;
            }
            if ($this->isFedapayFinalStatus((string) ($transaction['status'] ?? 'pending'))) {
                $this->updateFromTransactionPayload($order, $payment, $transaction);

                return ['order' => $order->fresh(['latestPayment']), 'payment' => $payment->fresh(), 'already_paid' => $this->mapFedapayStatus($transaction['status'])->isPaid()];
            }
        }

        try {
            $tokenData = $this->fedapayClient->createTransactionToken($transactionId);
            if (empty($tokenData['token']) || ($mode === 'checkout' && empty($tokenData['url']))) {
                throw new RuntimeException('Lien de paiement manquant.');
            }
        } catch (\Throwable $exception) {
            if ($mode === 'checkout') {
                PaymentTransaction::whereKey($payment->id)->whereIn('status', ['initiating', 'pending'])->update(['status' => 'checkout_token_failed', 'last_error_code' => 'checkout_token_failed']);
            }
            throw $exception;
        }
        $token = (string) ($tokenData['token'] ?? '');
        $checkoutUrl = Arr::get($tokenData, 'url');
        $checkoutUrl = is_string($checkoutUrl) ? $checkoutUrl : null;

        $remoteStatus = (string) ($transaction['status'] ?? 'pending');
        $sendResult = null;
        if ($directMode) {
            if ($token === '') {
                throw new RuntimeException('Impossible de lancer le paiement direct: token FedaPay manquant.');
            }

            $sendPayload = ['token' => $token];
            if ($phoneNumber) {
                $sendPayload['phone_number'] = $phoneNumber;
            }

            $sendResult = $this->fedapayClient->sendPayment($directMode, $sendPayload);
            $remoteStatus = (string) ($sendResult['status'] ?? $remoteStatus);
        }

        $payment->update([
            'order_id' => $order->id,
            'provider' => 'fedapay',
            'fedapay_transaction_id' => $transactionId,
            'fedapay_reference' => Arr::get($transaction, 'reference'),
            'payment_token' => $token !== '' ? $token : null,
            'checkout_url' => $checkoutUrl,
            'mode' => $directMode ?? 'checkout',
            'amount' => (int) $order->price,
            'currency' => (string) ($paymentConfig['currency'] ?? 'XOF'),
            'last_error_code' => Arr::get($transaction, 'last_error_code') ?? Arr::get($sendResult ?? [], 'last_error_code'),
            'raw_payload' => [
                'transaction' => $transaction,
                'token' => $tokenData,
                'send_result' => $sendResult,
            ],
            'initiated_at' => now(),
        ]);

        $this->updateFromTransactionPayload($order, $payment, array_replace($transaction, ['status' => $remoteStatus]));

        Log::info('payment.fedapay.initiated', [
            'order_id' => $order->id,
            'user_id' => $user->id,
            'payment_id' => $payment->id,
            'transaction_id' => $transactionId,
            'mode' => $payment->mode,
            'status' => $payment->status,
        ]);

        return [
            'order' => $order->fresh(['latestPayment']),
            'payment' => $payment->fresh(),
            'already_paid' => false,
        ];
    }

    public function refreshPaymentStatus(Order $order): Order
    {
        $payment = $order->latestPayment()->first();
        if (! $payment || ! $payment->fedapay_transaction_id) {
            return $order->fresh(['latestPayment']);
        }

        $this->refreshTransaction($payment);

        return $order->fresh(['latestPayment']);
    }

    public function refreshTransaction(PaymentTransaction $payment): PaymentTransaction
    {
        if (! $payment->fedapay_transaction_id) {
            throw new RuntimeException('Transaction FedaPay absente: synchronisation impossible.');
        }

        $order = $payment->order()->first();
        if (! $order) {
            throw new RuntimeException('Commande introuvable pour cette transaction.');
        }

        $transaction = $this->fedapayClient->getTransaction((int) $payment->fedapay_transaction_id);
        $this->updateFromTransactionPayload($order, $payment, $transaction);

        return $payment->fresh();
    }

    public function handleWebhook(string $payload, ?string $signatureHeader): void
    {
        $this->verifyWebhookSignature($payload, $signatureHeader);

        $event = json_decode($payload, true);
        if (! is_array($event)) {
            throw new RuntimeException('Payload webhook FedaPay invalide.');
        }

        $transactionId = $this->extractTransactionId($event);
        if (! $transactionId) {
            Log::warning('payment.fedapay.webhook.transaction_id_missing', [
                'event_name' => Arr::get($event, 'name'),
            ]);

            return;
        }

        $payment = PaymentTransaction::query()
            ->where('fedapay_transaction_id', $transactionId)
            ->latest('id')
            ->first();

        if (! $payment) {
            Log::warning('payment.fedapay.webhook.payment_not_found', [
                'transaction_id' => $transactionId,
                'event_name' => Arr::get($event, 'name'),
            ]);

            return;
        }

        $order = $payment->order;
        if (! $order) {
            Log::warning('payment.fedapay.webhook.order_not_found', [
                'payment_id' => $payment->id,
                'transaction_id' => $transactionId,
            ]);

            return;
        }

        $transactionPayload = $this->extractTransactionPayload($event);
        if (! is_array($transactionPayload) || ! isset($transactionPayload['status'])) {
            $transactionPayload = $this->fedapayClient->getTransaction($transactionId);
        }

        $this->updateFromTransactionPayload($order, $payment, $transactionPayload, $event);
    }

    private function updateFromTransactionPayload(
        Order $order,
        PaymentTransaction $payment,
        array $transactionPayload,
        ?array $eventPayload = null
    ): void {
        DB::transaction(function () use ($order, $payment, $transactionPayload, $eventPayload) {
            // Always lock in the same order as initiation; reload stale model instances.
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);
            $payment = PaymentTransaction::query()->lockForUpdate()->findOrFail($payment->id);
            $remoteStatus = strtolower((string) ($transactionPayload['status'] ?? $payment->status));
            $current = $this->mapFedapayStatus($payment->status);
            $incoming = $this->mapFedapayStatus($remoteStatus);
            if ($current === PaymentStatus::Refunded
                || ($current === PaymentStatus::Paid && ! in_array($incoming, [PaymentStatus::Paid, PaymentStatus::Refunded], true))
                || ($this->isFedapayFinalStatus($payment->status) && $incoming === PaymentStatus::AwaitingPayment)) {
                return;
            }
            $payment->update([
                'fedapay_reference' => Arr::get($transactionPayload, 'reference') ?? $payment->fedapay_reference,
                'status' => $remoteStatus,
                'last_error_code' => Arr::get($transactionPayload, 'last_error_code') ?? $payment->last_error_code,
                'raw_payload' => ['transaction' => $transactionPayload, 'event' => $eventPayload],
                'completed_at' => $this->isFedapayFinalStatus($remoteStatus) ? ($payment->completed_at ?? now()) : null,
            ]);

            // An old attempt may settle after a newer one: aggregate successful
            // transactions before considering the latest unsuccessful attempt.
            $payments = $order->payments()->orderByDesc('id')->get();
            $status = $this->mapFedapayStatus($payments->first()->status);
            foreach ($payments as $attempt) {
                if ($this->mapFedapayStatus($attempt->status) === PaymentStatus::Paid) {
                    $status = PaymentStatus::Paid;
                    break;
                }
                if ($this->mapFedapayStatus($attempt->status) === PaymentStatus::Refunded) {
                    $status = PaymentStatus::Refunded;
                }
            }
            $this->applyOrderPaymentStatus($order, $status);
            Log::info('payment.fedapay.status_synced', ['order_id' => $order->id, 'payment_id' => $payment->id, 'status' => $remoteStatus]);
        });
    }

    private function resolveFedapayCustomerId(User $user, ?array $phoneNumber): int
    {
        if ($user->fedapay_customer_id) {
            return (int) $user->fedapay_customer_id;
        }

        [$firstName, $lastName] = $this->splitName($user->name);

        $customerPayload = [
            'firstname' => $firstName,
            'lastname' => $lastName,
            'email' => $user->email,
        ];

        if ($phoneNumber) {
            $customerPayload['phone_number'] = $phoneNumber;
        }

        $customer = $this->fedapayClient->createCustomer($customerPayload);
        $customerId = (int) ($customer['id'] ?? 0);
        if ($customerId < 1) {
            throw new RuntimeException('Impossible de créer le client FedaPay.');
        }

        $user->update(['fedapay_customer_id' => $customerId]);

        return $customerId;
    }

    private function splitName(string $fullName): array
    {
        $trimmed = trim($fullName);
        if ($trimmed === '') {
            return ['Client', 'FRILO'];
        }

        $parts = preg_split('/\s+/', $trimmed) ?: [];
        $firstName = array_shift($parts) ?: 'Client';
        $lastName = trim(implode(' ', $parts));

        return [$firstName, $lastName !== '' ? $lastName : 'FRILO'];
    }

    private function buildCallbackUrl(Order $order): string
    {
        $paymentConfig = $this->platformSettingsService->getRuntimePaymentConfiguration();
        $baseCallbackUrl = (string) ($paymentConfig['callback_url'] ?? '');
        if ($baseCallbackUrl === '') {
            $baseCallbackUrl = rtrim((string) config('app.url'), '/').'/commande/paiement/retour';
        }

        $separator = str_contains($baseCallbackUrl, '?') ? '&' : '?';

        return $baseCallbackUrl.$separator.'order='.$order->id;
    }

    private function orderReference(int $orderId): string
    {
        return '#ORD-'.str_pad((string) $orderId, 5, '0', STR_PAD_LEFT);
    }

    private function merchantReference(int $orderId): string
    {
        return 'FRILO-ORD-'.str_pad((string) $orderId, 5, '0', STR_PAD_LEFT);
    }

    private function sanitizePhoneNumber(mixed $phoneNumber): ?array
    {
        if (! is_array($phoneNumber)) {
            return null;
        }

        $number = trim((string) ($phoneNumber['number'] ?? ''));
        $country = strtolower(trim((string) ($phoneNumber['country'] ?? '')));
        if ($number === '' || $country === '') {
            return null;
        }

        return [
            'number' => $number,
            'country' => $country,
        ];
    }

    private function applyOrderPaymentStatus(Order $order, PaymentStatus $paymentStatus): void
    {
        $current = $this->normalizeOrderPaymentStatus($order);
        $updates = [];
        $statusChanged = $current !== $paymentStatus;

        if ($statusChanged) {
            $updates['payment_status'] = $paymentStatus;
        }

        if ($paymentStatus->isPaid() && ! $order->paid_at) {
            $updates['paid_at'] = now();
        }

        if ($updates !== []) {
            $order->update($updates);
        }

        if ($statusChanged) {
            $order->loadMissing('user');
            if ($order->user && $order->user->isClient()) {
                $order->user->notify(
                    new OrderPaymentStatusUpdatedNotification($order, $current, $paymentStatus)
                );
            }

            $this->adminNotificationService->notifyPaymentStatusChanged($order, $current, $paymentStatus);
        }
    }

    private function normalizeOrderPaymentStatus(Order $order): PaymentStatus
    {
        if ($order->payment_status instanceof PaymentStatus) {
            return $order->payment_status;
        }

        return PaymentStatus::tryFrom((string) $order->payment_status) ?? PaymentStatus::AwaitingPayment;
    }

    private function mapFedapayStatus(string $fedapayStatus): PaymentStatus
    {
        return match (strtolower($fedapayStatus)) {
            'approved', 'transferred', 'approved_partially_refunded', 'transferred_partially_refunded' => PaymentStatus::Paid,
            'declined' => PaymentStatus::Failed,
            'canceled', 'cancelled' => PaymentStatus::Cancelled,
            'refunded' => PaymentStatus::Refunded,
            'expired' => PaymentStatus::Expired,
            default => PaymentStatus::AwaitingPayment,
        };
    }

    private function isFedapayFinalStatus(string $fedapayStatus): bool
    {
        return in_array(strtolower($fedapayStatus), [
            'approved',
            'transferred',
            'declined',
            'canceled',
            'cancelled',
            'refunded',
            'expired',
            'approved_partially_refunded',
            'transferred_partially_refunded',
        ], true);
    }

    private function extractTransactionId(array $event): ?int
    {
        $candidates = [
            Arr::get($event, 'entity.id'),
            Arr::get($event, 'entity_id'),
            Arr::get($event, 'object.id'),
            Arr::get($event, 'data.id'),
            Arr::get($event, 'data.object.id'),
        ];

        foreach ($candidates as $candidate) {
            if (is_numeric($candidate) && (int) $candidate > 0) {
                return (int) $candidate;
            }
        }

        return null;
    }

    private function extractTransactionPayload(array $event): ?array
    {
        $candidates = [
            Arr::get($event, 'entity'),
            Arr::get($event, 'object'),
            Arr::get($event, 'data'),
            Arr::get($event, 'data.object'),
        ];

        foreach ($candidates as $candidate) {
            if (is_array($candidate) && isset($candidate['id'])) {
                return $candidate;
            }
        }

        return null;
    }

    private function verifyWebhookSignature(string $payload, ?string $header): void
    {
        $paymentConfig = $this->platformSettingsService->getRuntimePaymentConfiguration();
        $secret = (string) ($paymentConfig['webhook_secret'] ?? '');
        if ($secret === '') {
            if (app()->environment('production')) {
                throw new RuntimeException('Secret webhook FedaPay manquant en production.');
            }

            return;
        }

        if (! is_string($header) || trim($header) === '') {
            throw new RuntimeException('Signature webhook FedaPay manquante.');
        }

        $items = array_map('trim', explode(',', $header));
        $timestamp = null;
        $signatures = [];

        foreach ($items as $item) {
            [$key, $value] = array_pad(explode('=', $item, 2), 2, null);
            if ($key === 't' && is_numeric($value)) {
                $timestamp = (int) $value;
            }
            if ($key === 's' && is_string($value) && $value !== '') {
                $signatures[] = $value;
            }
        }

        if (! $timestamp || $signatures === []) {
            throw new RuntimeException('En-tête signature webhook FedaPay invalide.');
        }

        $expected = hash_hmac('sha256', $timestamp.'.'.$payload, $secret);
        $signatureOk = false;
        foreach ($signatures as $signature) {
            if (hash_equals($expected, $signature)) {
                $signatureOk = true;
                break;
            }
        }

        if (! $signatureOk) {
            throw new RuntimeException('Signature webhook FedaPay invalide.');
        }

        $tolerance = (int) ($paymentConfig['webhook_tolerance'] ?? 300);
        if ($tolerance > 0 && abs(time() - $timestamp) > $tolerance) {
            throw new RuntimeException('Webhook FedaPay rejeté: timestamp hors fenêtre autorisée.');
        }
    }
}
