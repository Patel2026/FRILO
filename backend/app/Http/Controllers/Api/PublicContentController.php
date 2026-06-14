<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PublicContentService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;

class PublicContentController extends Controller
{
    public function __construct(private readonly PublicContentService $publicContentService) {}

    public function show(string $pageKey): JsonResponse
    {
        try {
            return response()->json($this->publicContentService->publicPage($pageKey));
        } catch (InvalidArgumentException|ModelNotFoundException) {
            return response()->json([
                'message' => 'Contenu public introuvable.',
            ], 404);
        }
    }
}
