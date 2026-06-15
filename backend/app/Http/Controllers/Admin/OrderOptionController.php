<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOrderOptionRequest;
use App\Http\Requests\Admin\UpdateOrderOptionRequest;
use App\Models\OrderOption;
use App\Services\OrderOptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class OrderOptionController extends Controller
{
    public function __construct(private readonly OrderOptionService $orderOptionService) {}

    public function index(Request $request): View
    {
        $this->authorize('viewAny', OrderOption::class);

        $search = trim((string) $request->string('search', ''));
        $visibility = (string) $request->string('visibility', '');

        $orderOptions = OrderOption::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('name', 'like', '%'.$search.'%')
                        ->orWhere('slug', 'like', '%'.$search.'%')
                        ->orWhere('description', 'like', '%'.$search.'%')
                        ->orWhere('persona_hint', 'like', '%'.$search.'%');
                });
            })
            ->when($visibility === 'active', fn ($query) => $query->where('is_active', true))
            ->when($visibility === 'inactive', fn ($query) => $query->where('is_active', false))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->paginate(20)
            ->withQueryString();

        return view('admin.order-options.index', [
            'orderOptions' => $orderOptions,
            'filters' => [
                'search' => $search,
                'visibility' => $visibility,
            ],
        ]);
    }

    public function create(): View
    {
        $this->authorize('create', OrderOption::class);

        return view('admin.order-options.create', [
            'orderOption' => new OrderOption([
                'is_active' => true,
                'sort_order' => (int) (OrderOption::max('sort_order') ?? 0) + 10,
            ]),
        ]);
    }

    public function store(StoreOrderOptionRequest $request): RedirectResponse
    {
        $this->authorize('create', OrderOption::class);

        $this->orderOptionService->create($request->validated(), $request->user());

        return redirect()
            ->route('admin.order-options.index')
            ->with('success', 'Option de commande ajoutee.');
    }

    public function edit(OrderOption $orderOption): View
    {
        $this->authorize('view', $orderOption);

        return view('admin.order-options.edit', ['orderOption' => $orderOption]);
    }

    public function update(UpdateOrderOptionRequest $request, OrderOption $orderOption): RedirectResponse
    {
        $this->authorize('update', $orderOption);

        $this->orderOptionService->update($orderOption, $request->validated(), $request->user());

        return redirect()
            ->route('admin.order-options.index')
            ->with('success', 'Option de commande mise a jour.');
    }

    public function destroy(Request $request, OrderOption $orderOption): RedirectResponse
    {
        $this->authorize('delete', $orderOption);

        $this->orderOptionService->delete($orderOption, $request->user());

        return redirect()
            ->route('admin.order-options.index')
            ->with('success', 'Option de commande desactivee.');
    }
}
