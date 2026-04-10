<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FaqItem;
use App\Services\FaqItemService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function __construct(private readonly FaqItemService $faqItemService) {}

    public function index(Request $request): JsonResponse
    {
        $limit = $request->filled('limit') ? (int) $request->integer('limit') : null;
        $faqs = $this->faqItemService->publishedFaqs($limit);

        return response()->json(
            $faqs->map(fn (FaqItem $faqItem) => [
                'id' => $faqItem->id,
                'question' => $faqItem->question,
                'answer' => $faqItem->answer,
                'sort_order' => $faqItem->sort_order,
            ])->values()
        );
    }
}
