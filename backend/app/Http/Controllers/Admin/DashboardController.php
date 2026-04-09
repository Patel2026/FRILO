<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Template;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'pending'    => Order::where('status', OrderStatus::Pending)->count(),
            'processing' => Order::where('status', OrderStatus::Processing)->count(),
            'completed'  => Order::where('status', OrderStatus::Completed)->count(),
            'cancelled'  => Order::where('status', OrderStatus::Cancelled)->count(),
            'revenue'    => Order::where('status', OrderStatus::Completed)->sum('price'),
            'clients'    => User::where('role', 'client')->count(),
            'templates'  => Template::active()->count(),
        ];

        $recentOrders = Order::with(['user', 'template.sector'])
            ->latest()
            ->limit(10)
            ->get();

        return view('admin.dashboard', compact('stats', 'recentOrders'));
    }
}
