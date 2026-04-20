<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\SubmitContactRequest;
use App\Models\ContactRequest;
use App\Services\AdminNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ContactController extends Controller
{
    public function __construct(private readonly AdminNotificationService $adminNotificationService) {}

    public function store(SubmitContactRequest $request): JsonResponse
    {
        $this->authorize('create', ContactRequest::class);

        $payload = $request->validated();
        $payload['order_reference'] = $this->normalizeOrderReference($payload['order_reference'] ?? null);

        $contactRequest = ContactRequest::create([
            ...$payload,
            'status' => ContactRequest::STATUS_NEW,
            'accepted_terms_at' => now(),
        ]);

        Log::info('contact.request.created', [
            'contact_request_id' => $contactRequest->id,
            'email' => $contactRequest->email,
        ]);
        $this->adminNotificationService->notifyContactRequestCreated($contactRequest);

        return response()->json([
            'id' => $contactRequest->id,
            'status' => $contactRequest->status,
            'order_reference' => $contactRequest->order_reference,
            'message' => 'Votre demande a été enregistrée. Notre équipe vous répond rapidement.',
            'created_at' => optional($contactRequest->created_at)?->toISOString(),
        ], 201);
    }

    private function normalizeOrderReference(?string $reference): ?string
    {
        if ($reference === null) {
            return null;
        }

        $trimmed = trim($reference);
        if ($trimmed === '') {
            return null;
        }

        $normalized = strtoupper($trimmed);

        return Str::startsWith($normalized, '#') ? $normalized : "#{$normalized}";
    }
}
