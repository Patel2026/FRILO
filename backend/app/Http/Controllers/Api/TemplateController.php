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

        return response()->json($query->get());
    }

    public function show(int $id): JsonResponse
    {
        $template = Template::active()->findOrFail($id);

        $this->authorize('view', $template);

        $template->load('sector');

        return response()->json($template);
    }
}
