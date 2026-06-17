<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Template;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Template::class);

        $query = Template::active()->with('sector');

        if ($request->filled('sector_slug')) {
            $query->whereHas('sector', fn ($q) => $q->where('slug', $request->sector_slug));
        }

        return response()->json(
            $query->get()
                ->map(fn (Template $template) => $this->serializeTemplate($template))
                ->values()
        );
    }

    public function show(int $id): JsonResponse
    {
        $template = Template::active()->findOrFail($id);

        $this->authorize('view', $template);

        $template->load('sector');

        return response()->json($this->serializeTemplate($template));
    }

    private function serializeTemplate(Template $template): array
    {
        return [
            'id' => $template->id,
            'sector_id' => $template->sector_id,
            'name' => $template->name,
            'slug' => $template->slug,
            'description' => $template->description,
            'price' => (int) $template->effective_price,
            'normal_price' => (int) ($template->normal_price ?? $template->price),
            'promo_price' => $template->promo_price !== null ? (int) $template->promo_price : null,
            'features' => $template->features ?? [],
            'target_audience' => $template->target_audience ?? [],
            'included_features' => $template->included_features ?? ($template->features ?? []),
            'thumbnail' => $template->thumbnail,
            'full_thumbnail_url' => $template->full_thumbnail_url,
            'preview_url' => $template->preview_url,
            'preview_pages' => $template->preview_pages ?? [],
            'preview_gallery' => $template->preview_gallery ?? [],
            'is_active' => (bool) $template->is_active,
            'is_system' => (bool) ($template->is_system ?? false),
            'sector' => $template->sector,
            'created_at' => $template->created_at,
            'updated_at' => $template->updated_at,
        ];
    }
}
