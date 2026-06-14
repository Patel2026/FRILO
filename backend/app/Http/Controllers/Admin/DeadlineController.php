<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deadline;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DeadlineController extends Controller
{
    public function index(): View
    {
        $deadlines = Deadline::where('is_system', true)
            ->orderBy('due_date')
            ->get();

        return view('admin.deadlines.index', compact('deadlines'));
    }

    public function create(): View
    {
        return view('admin.deadlines.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:1000'],
            'due_date'    => ['required', 'date'],
        ]);

        Deadline::create([...$validated, 'is_system' => true, 'user_id' => null]);

        return redirect()->route('admin.deadlines.index')
            ->with('success', 'Échéance créée.');
    }

    public function edit(Deadline $deadline): View
    {
        abort_unless($deadline->is_system, 404);

        return view('admin.deadlines.edit', compact('deadline'));
    }

    public function update(Request $request, Deadline $deadline): RedirectResponse
    {
        abort_unless($deadline->is_system, 403);

        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:1000'],
            'due_date'    => ['required', 'date'],
        ]);

        $deadline->update($validated);

        return redirect()->route('admin.deadlines.index')
            ->with('success', 'Échéance mise à jour.');
    }

    public function destroy(Deadline $deadline): RedirectResponse
    {
        abort_unless($deadline->is_system, 403);

        $deadline->delete();

        return redirect()->route('admin.deadlines.index')
            ->with('success', 'Échéance supprimée.');
    }
}
