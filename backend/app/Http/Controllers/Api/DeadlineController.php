<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreDeadlineRequest;
use App\Http\Requests\Api\UpdateDeadlineRequest;
use App\Models\Deadline;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeadlineController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Deadline::class);

        $deadlines = Deadline::where(function ($q) use ($request) {
            $q->where('is_system', true)
              ->orWhere('user_id', $request->user()->id);
        })
        ->orderBy('due_date')
        ->get();

        return response()->json(
            $deadlines->map(fn (Deadline $d) => $this->transform($d))->values()
        );
    }

    public function store(StoreDeadlineRequest $request): JsonResponse
    {
        $deadline = Deadline::create([
            ...$request->validated(),
            'user_id'   => $request->user()->id,
            'is_system' => false,
        ]);

        return response()->json($this->transform($deadline), 201);
    }

    public function update(UpdateDeadlineRequest $request, Deadline $deadline): JsonResponse
    {
        $this->authorize('update', $deadline);

        $deadline->update($request->validated());

        return response()->json($this->transform($deadline->fresh()));
    }

    public function destroy(Deadline $deadline): JsonResponse
    {
        $this->authorize('delete', $deadline);

        $deadline->delete();

        return response()->json(null, 204);
    }

    private function transform(Deadline $deadline): array
    {
        return [
            'id'             => $deadline->id,
            'title'          => $deadline->title,
            'description'    => $deadline->description,
            'due_date'       => $deadline->due_date->toDateString(),
            'is_system'      => $deadline->is_system,
            'days_remaining' => $deadline->days_remaining,
        ];
    }
}
