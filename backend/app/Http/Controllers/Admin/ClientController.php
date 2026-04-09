<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;

class ClientController extends Controller
{
    public function index()
    {
        $clients = User::where('role', 'client')
            ->withCount('orders')
            ->latest()
            ->paginate(20);

        return view('admin.clients.index', compact('clients'));
    }

    public function show(User $user)
    {
        abort_if($user->isAdmin(), 404);

        $user->load(['orders.template.sector']);

        return view('admin.clients.show', compact('user'));
    }
}
