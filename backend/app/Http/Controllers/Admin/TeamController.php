<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAdminTeamMemberRequest;
use App\Http\Requests\Admin\UpdateAdminTeamMemberRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class TeamController extends Controller
{
    public function index(): View
    {
        $admins = User::query()
            ->whereIn('role', User::ADMIN_ROLES)
            ->orderBy('role')
            ->orderBy('name')
            ->get();

        return view('admin.team.index', [
            'admins' => $admins,
            'roles' => User::ADMIN_ROLES,
        ]);
    }

    public function store(StoreAdminTeamMemberRequest $request): RedirectResponse
    {
        $data = $request->validated();

        User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'is_active' => $request->boolean('is_active'),
        ]);

        return redirect()
            ->route('admin.team.index')
            ->with('success', 'Administrateur créé.');
    }

    public function update(UpdateAdminTeamMemberRequest $request, User $user): RedirectResponse
    {
        abort_unless($user->isAdmin(), 404);

        $data = $request->validated();
        $updates = [
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
            'is_active' => $request->boolean('is_active'),
        ];

        if (! empty($data['password'])) {
            $updates['password'] = Hash::make($data['password']);
        }

        $user->update($updates);

        return redirect()
            ->route('admin.team.index')
            ->with('success', 'Administrateur mis à jour.');
    }
}
