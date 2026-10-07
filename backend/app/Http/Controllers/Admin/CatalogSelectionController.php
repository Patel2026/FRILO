<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BulkCatalogRequest;
use App\Services\CatalogSelectionService;
use Illuminate\Http\RedirectResponse;

class CatalogSelectionController extends Controller
{
    public function __construct(private readonly CatalogSelectionService $service) {}

    public function destroy(BulkCatalogRequest $request): RedirectResponse
    {
        $this->authorize('manageSelection', $request->modelClass());
        $count = $this->service->apply($request->modelClass(), $request->validated('ids'), 'delete', $request->user());

        return back()->with('success', $count.' élément(s) déplacé(s) dans la corbeille.');
    }

    public function restore(BulkCatalogRequest $request): RedirectResponse
    {
        $this->authorize('manageSelection', $request->modelClass());
        $count = $this->service->apply($request->modelClass(), $request->validated('ids'), 'restore', $request->user());

        return back()->with('success', $count.' élément(s) restauré(s).');
    }

    public function visibility(BulkCatalogRequest $request): RedirectResponse
    {
        $this->authorize('manageSelection', $request->modelClass());
        $count = $this->service->apply($request->modelClass(), $request->validated('ids'), 'visibility', $request->user(), $request->boolean('active'));

        return back()->with('success', $count.' secteur(s) '.($request->boolean('active') ? 'activé(s).' : 'désactivé(s).'));
    }
}
