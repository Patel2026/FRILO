<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sector;
use Illuminate\Http\JsonResponse;

class SectorController extends Controller
{
    public function index(): JsonResponse
    {
        $sectors = Sector::active()->orderBy('name')->get();

        return response()->json($sectors);
    }
}
