<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OrderPaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class FedapayWebhookController extends Controller
{
    public function __construct(private readonly OrderPaymentService $orderPaymentService) {}

    public function store(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->header('X-FEDAPAY-SIGNATURE');

        try {
            $this->orderPaymentService->handleWebhook($payload, $signature);
        } catch (Throwable $exception) {
            Log::warning('payment.fedapay.webhook.rejected', [
                'message' => $exception->getMessage(),
            ]);

            throw new HttpException(400, $exception->getMessage(), $exception);
        }

        return response()->json(['received' => true]);
    }
}
