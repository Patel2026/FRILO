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
use Illuminate\Support\Str;
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

        $key = $data['idempotency_key'] ?? (string) Str::uuid();
        $canonical = [];
        foreach (['template_id', 'enterprise_name', 'activity_description', 'colors', 'specific_instructions', 'color_palette_id', 'font_pairing_id'] as $field) {
            $canonical[$field] = $data[$field] ?? null;
        }
        $canonical['template_id'] = (int) $data['template_id'];
        $canonical['option_ids'] = $optionIds->sort()->values()->all();
        $fingerprint = hash('sha256', json_encode($canonical, JSON_THROW_ON_ERROR));
        $created = false;

        $order = DB::transaction(function () use ($data, $user, $optionIds, $key, $fingerprint, &$created) {
            // Serialize submissions for one customer, including the first insert.
            User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            $existing = Order::withTrashed()->where('user_id', $user->id)->where('idempotency_key', $key)->first();
            if ($existing) {
                if ($existing->trashed() || ! hash_equals($existing->request_fingerprint, $fingerprint)) {
                    throw new HttpException(409, 'Cette soumission a déjà été utilisée pour une autre commande.');
                }

                return $existing->load(['template.sector', 'instruction', 'optionSelections']);
            }

            $template = Template::query()
                ->active()
                ->lockForUpdate()
                ->find($data['template_id']);
            if (! $template) {
                throw ValidationException::withMessages(['template_id' => 'Ce modèle n’est plus disponible.']);
            }

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
                $errors = ['option_ids' => 'Une ou plusieurs options sélectionnées ne sont plus disponibles.'];
                foreach ($data['option_ids'] ?? [] as $index => $optionId) {
                    if (! $options->contains('id', (int) $optionId)) {
                        $errors['option_ids.'.$index] = 'Cette option n’est plus disponible.';
                    }
                }
                throw ValidationException::withMessages($errors);
            }

            $optionsTotal = (int) $options->sum('price');
            $totalPrice = (int) $template->price + $optionsTotal;
            $selectedColorPalette = $this->resolveTemplateChoice(
                $template->color_palettes ?? [],
                $data['color_palette_id'] ?? null,
                $template->default_color_palette,
                'color_palette_id'
            );
            $selectedFontPairing = $this->resolveTemplateChoice(
                $template->font_pairings ?? [],
                $data['font_pairing_id'] ?? null,
                $template->default_font_pairing,
                'font_pairing_id'
            );

            $order = Order::create([
                'idempotency_key' => $key,
                'request_fingerprint' => $fingerprint,
                'user_id' => $user->id,
                'template_id' => $template->id,
                'status' => OrderStatus::Pending,
                'payment_status' => PaymentStatus::AwaitingPayment,
                'price' => $totalPrice,
                'selected_color_palette' => $selectedColorPalette,
                'selected_font_pairing' => $selectedFontPairing,
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

            $created = true;

            return $order->load(['template.sector', 'instruction', 'optionSelections']);
        });

        if (! $created) {
            return $order;
        }

        if ($user->isClient()) {
            $user->notify(new OrderCreatedNotification($order));
        }
        $this->adminNotificationService->notifyOrderCreated($order);

        return $order;
    }

    private function resolveTemplateChoice(array $choices, ?string $requestedId, ?string $defaultId, string $field): ?array
    {
        if ($choices === []) {
            return null;
        }

        $requestedId = trim((string) ($requestedId ?: $defaultId ?: ''));

        if ($requestedId === '') {
            $firstChoice = $choices[0] ?? null;

            return is_array($firstChoice) ? $firstChoice : null;
        }

        foreach ($choices as $choice) {
            if (is_array($choice) && (string) ($choice['id'] ?? '') === $requestedId) {
                return $choice;
            }
        }

        throw ValidationException::withMessages([
            $field => 'Le choix de personnalisation selectionne n est pas disponible pour ce template.',
        ]);
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
