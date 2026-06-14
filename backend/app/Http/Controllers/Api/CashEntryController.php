<?php

namespace App\Http\Controllers\Api;

use App\Enums\CashEntryType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreCashEntryRequest;
use App\Http\Requests\Api\UpdateCashEntryRequest;
use App\Models\CashEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashEntryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', CashEntry::class);

        $month = $request->get('month', now()->format('Y-m'));
        [$year, $m] = explode('-', $month);

        $entries = CashEntry::where('user_id', $request->user()->id)
            ->whereYear('entry_date', (int) $year)
            ->whereMonth('entry_date', (int) $m)
            ->orderBy('entry_date', 'desc')
            ->paginate(50);

        return response()->json([
            'data' => $entries->getCollection()
                ->map(fn (CashEntry $e) => $this->transform($e))
                ->values(),
            'meta' => [
                'current_page' => $entries->currentPage(),
                'last_page'    => $entries->lastPage(),
                'per_page'     => $entries->perPage(),
                'total'        => $entries->total(),
            ],
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $this->authorize('viewAny', CashEntry::class);

        $month = $request->get('month', now()->format('Y-m'));
        [$year, $m] = explode('-', $month);

        $rows = CashEntry::where('user_id', $request->user()->id)
            ->whereYear('entry_date', (int) $year)
            ->whereMonth('entry_date', (int) $m)
            ->selectRaw('type, SUM(amount) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        $income   = (int) ($rows[CashEntryType::Income->value]  ?? 0);
        $expenses = (int) ($rows[CashEntryType::Expense->value] ?? 0);

        return response()->json([
            'month'    => $month,
            'income'   => $income,
            'expenses' => $expenses,
            'balance'  => $income - $expenses,
        ]);
    }

    public function store(StoreCashEntryRequest $request): JsonResponse
    {
        $entry = CashEntry::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return response()->json($this->transform($entry), 201);
    }

    public function update(UpdateCashEntryRequest $request, int $id): JsonResponse
    {
        $entry = CashEntry::findOrFail($id);
        $this->authorize('update', $entry);

        $entry->update($request->validated());

        return response()->json($this->transform($entry->fresh()));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $entry = CashEntry::findOrFail($id);
        $this->authorize('delete', $entry);

        $entry->delete();

        return response()->json(null, 204);
    }

    private function transform(CashEntry $entry): array
    {
        return [
            'id'         => $entry->id,
            'type'       => $entry->type->value,
            'amount'     => $entry->amount,
            'label'      => $entry->label,
            'entry_date' => $entry->entry_date->toDateString(),
            'notes'      => $entry->notes,
        ];
    }
}
