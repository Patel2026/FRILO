<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sector;
use Illuminate\Http\JsonResponse;

class SectorController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Sector::class);

        $sectors = Sector::active()->orderBy('name')->get();

        return response()->json($sectors);
    }
}
