<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sector;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SectorController extends Controller
{
    public function index()
    {
        $sectors = Sector::withCount('templates')->orderBy('name')->paginate(20);

        return view('admin.sectors.index', compact('sectors'));
    }

    public function create()
    {
        return view('admin.sectors.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'icon'        => ['nullable', 'string', 'max:100'],
            'gradient'    => ['nullable', 'string', 'max:255'],
            'is_active'   => ['boolean'],
        ]);

        $data['slug'] = Str::slug($data['name']);

        Sector::create($data);

        return redirect()->route('admin.sectors.index')->with('success', 'Secteur créé.');
    }

    public function edit(Sector $sector)
    {
        return view('admin.sectors.edit', compact('sector'));
    }

    public function update(Request $request, Sector $sector)
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'icon'        => ['nullable', 'string', 'max:100'],
            'gradient'    => ['nullable', 'string', 'max:255'],
            'is_active'   => ['boolean'],
        ]);

        $sector->update($data);

        return redirect()->route('admin.sectors.index')->with('success', 'Secteur mis à jour.');
    }

    public function destroy(Sector $sector)
    {
        $sector->update(['is_active' => false]);

        return redirect()->route('admin.sectors.index')->with('success', 'Secteur désactivé.');
    }
}
