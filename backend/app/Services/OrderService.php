<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Template;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\HttpException;

class OrderService
{
    /**
     * Créer une commande avec son instruction de personnalisation.
     * Le prix est snapshotté depuis le template — jamais accepté depuis le client.
     */
    public function createOrder(array $data, User $user): Order
    {
        $template = Template::active()->findOrFail($data['template_id']);

        return DB::transaction(function () use ($data, $user, $template) {
            $order = Order::create([
                'user_id'     => $user->id,
                'template_id' => $template->id,
                'status'      => OrderStatus::Pending,
                'price'       => $template->price, // snapshot
            ]);

            $order->instruction()->create([
                'enterprise_name'       => $data['enterprise_name'] ?? null,
                'activity_description'  => $data['activity_description'] ?? null,
                'colors'                => $data['colors'] ?? [],
                'specific_instructions' => $data['specific_instructions'] ?? null,
            ]);

            Log::info('order.created', [
                'order_id' => $order->id,
                'user_id' => $user->id,
                'template_id' => $template->id,
                'price' => $order->price,
            ]);

            return $order->load(['template.sector', 'instruction']);
        });
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

        $order->update(['status' => $newStatus]);

        Log::info('order.status.changed', [
            'order_id' => $order->id,
            'from' => $previousStatus->value,
            'to' => $newStatus->value,
        ]);

        return $order->fresh();
    }
}
