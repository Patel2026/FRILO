<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\OrderOption;
use App\Models\Template;
use App\Models\User;
use App\Notifications\OrderCreatedNotification;
use App\Notifications\OrderStatusUpdatedNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class OrderService
{
    public function __construct(private readonly AdminNotificationService $adminNotificationService) {}

    /**
     * Créer une commande avec son instruction de personnalisation.
     * Le prix est snapshotté depuis le template — jamais accepté depuis le client.
     */
    public function createOrder(array $data, User $user): Order
    {
        $optionIds = collect($data['option_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $order = DB::transaction(function () use ($data, $user, $optionIds) {
            $template = Template::query()
                ->active()
                ->lockForUpdate()
                ->findOrFail($data['template_id']);

            $options = $optionIds->isEmpty()
                ? collect()
                : OrderOption::query()
                    ->active()
                    ->whereIn('id', $optionIds)
                    ->orderBy('sort_order')
                    ->orderBy('name')
                    ->lockForUpdate()
                    ->get();

            if ($options->count() !== $optionIds->count()) {
                throw ValidationException::withMessages([
                    'option_ids' => 'Une ou plusieurs options sélectionnées ne sont plus disponibles.',
                ]);
            }

            $optionsTotal = (int) $options->sum('price');
            $totalPrice = (int) $template->price + $optionsTotal;

            $order = Order::create([
                'user_id' => $user->id,
                'template_id' => $template->id,
                'status' => OrderStatus::Pending,
                'payment_status' => PaymentStatus::AwaitingPayment,
                'price' => $totalPrice,
            ]);

            $order->instruction()->create([
                'enterprise_name' => $data['enterprise_name'] ?? null,
                'activity_description' => $data['activity_description'] ?? null,
                'colors' => $data['colors'] ?? [],
                'specific_instructions' => $data['specific_instructions'] ?? null,
            ]);

            foreach ($options as $option) {
                $order->optionSelections()->create([
                    'order_option_id' => $option->id,
                    'name_snapshot' => $option->name,
                    'price_snapshot' => (int) $option->price,
                ]);
            }

            Log::info('order.created', [
                'order_id' => $order->id,
                'user_id' => $user->id,
                'template_id' => $template->id,
                'base_price' => (int) $template->price,
                'options_total' => $optionsTotal,
                'price' => (int) $order->price,
            ]);

            return $order->load(['template.sector', 'instruction', 'optionSelections']);
        });

        if ($user->isClient()) {
            $user->notify(new OrderCreatedNotification($order));
        }
        $this->adminNotificationService->notifyOrderCreated($order);

        return $order;
    }

    /**
     * Mettre à jour le statut d'une commande.
     * Toute transition invalide est rejetée avec HTTP 409.
     */
    public function updateStatus(Order $order, OrderStatus $newStatus): Order
    {
        $previousStatus = $order->status;

        if (! $order->status->canTransitionTo($newStatus)) {
            throw new HttpException(409, sprintf(
                'Transition "%s" → "%s" non autorisée.',
                $order->status->value,
                $newStatus->value
            ));
        }

        $paymentStatus = $order->payment_status instanceof PaymentStatus
            ? $order->payment_status
            : PaymentStatus::tryFrom((string) $order->payment_status);

        if (
            in_array($newStatus, [OrderStatus::Processing, OrderStatus::Completed], true)
            && $paymentStatus !== PaymentStatus::Paid
        ) {
            throw new HttpException(409, 'Paiement non confirmé: impossible de traiter ou livrer cette commande.');
        }

        if ($newStatus === OrderStatus::Completed && ! $order->canBeCompletedOperationally()) {
            $missing = array_merge($order->missingQualityChecks(), $order->missingDeliveryChecks());

            throw ValidationException::withMessages([
                'status' => 'Impossible de livrer: contrôles incomplets ('.implode(', ', $missing).').',
            ]);
        }

        $order->update(['status' => $newStatus]);

        Log::info('order.status.changed', [
            'order_id' => $order->id,
            'from' => $previousStatus->value,
            'to' => $newStatus->value,
        ]);

        $order->loadMissing('user');
        if ($order->user && $order->user->isClient()) {
            $order->user->notify(
                new OrderStatusUpdatedNotification($order, $previousStatus, $newStatus)
            );
        }

        return $order->fresh();
    }

    public function submitFeedback(Order $order, string $feedback): Order
    {
        if (! $order->preview_url) {
            throw new HttpException(422, 'Aucun lien de prévisualisation disponible pour cette commande.');
        }

        $order->client_feedback = $feedback;
        $order->feedback_submitted_at = now();
        $order->save();

        Log::info('order.feedback.submitted', [
            'order_id' => $order->id,
            'user_id' => $order->user_id,
        ]);

        return $order->fresh();
    }
}
