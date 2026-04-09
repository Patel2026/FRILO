<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\SubmitContactRequest;
use App\Models\ContactRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    public function store(SubmitContactRequest $request): JsonResponse
    {
        $contactRequest = ContactRequest::create([
            ...$request->validated(),
            'status' => ContactRequest::STATUS_NEW,
        ]);

        Log::info('contact.request.created', [
            'contact_request_id' => $contactRequest->id,
            'email' => $contactRequest->email,
        ]);

        return response()->json([
            'id' => $contactRequest->id,
            'status' => $contactRequest->status,
            'message' => 'Votre demande a été enregistrée. Notre équipe vous répond rapidement.',
            'created_at' => optional($contactRequest->created_at)?->toISOString(),
        ], 201);
    }
}
