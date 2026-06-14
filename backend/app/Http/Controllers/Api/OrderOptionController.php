<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderOption;
use Illuminate\Http\JsonResponse;

class OrderOptionController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', OrderOption::class);

        $options = OrderOption::query()
            ->active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (OrderOption $option) => [
                'id' => $option->id,
                'name' => $option->name,
                'slug' => $option->slug,
                'description' => $option->description,
                'persona_hint' => $option->persona_hint,
                'price' => (int) $option->price,
            ])
            ->values();

        return response()->json($options);
    }
}
