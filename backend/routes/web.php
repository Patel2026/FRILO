<?php

use App\Http\Controllers\Admin\ClientController;
use App\Http\Controllers\Admin\ContactRequestController as AdminContactRequestController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\SectorController as AdminSectorController;
use App\Http\Controllers\Admin\TemplateController as AdminTemplateController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth — session-based pour le backoffice admin
|--------------------------------------------------------------------------
*/
Auth::routes(['register' => false]);

/*
|--------------------------------------------------------------------------
| Backoffice Admin (Velzon)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::redirect('/', '/admin/dashboard');

    // Commandes
    Route::resource('orders', AdminOrderController::class)->only(['index', 'show']);
    Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status');

    // Templates
    Route::resource('templates', AdminTemplateController::class)->except(['show']);

    // Secteurs
    Route::resource('sectors', AdminSectorController::class)->except(['show']);

    // Clients
    Route::get('clients', [ClientController::class, 'index'])->name('clients.index');
    Route::get('clients/{user}', [ClientController::class, 'show'])->name('clients.show');

    // Demandes de contact
    Route::get('contact-requests', [AdminContactRequestController::class, 'index'])->name('contact-requests.index');
    Route::patch('contact-requests/{contactRequest}/status', [AdminContactRequestController::class, 'updateStatus'])
        ->name('contact-requests.status');
});

/*
|--------------------------------------------------------------------------
| Redirect racine vers login ou dashboard
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return auth()->check() ? redirect()->route('admin.dashboard') : redirect()->route('login');
});
