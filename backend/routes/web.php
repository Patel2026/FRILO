<?php

use App\Http\Controllers\Admin\AdminNotificationController;
use App\Http\Controllers\Admin\AuditLogController as AdminAuditLogController;
use App\Http\Controllers\Admin\ClientController;
use App\Http\Controllers\Admin\ContactRequestController as AdminContactRequestController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DataBackupController;
use App\Http\Controllers\Admin\FaqController as AdminFaqController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\PaymentTransactionController as AdminPaymentTransactionController;
use App\Http\Controllers\Admin\SectorController as AdminSectorController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Admin\TemplateController as AdminTemplateController;
use App\Http\Controllers\Admin\TemplateReviewController as AdminTemplateReviewController;
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
Route::prefix('admin')->name('admin.')->middleware(['auth', 'super_admin'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::redirect('/', '/admin/dashboard');

    // Commandes
    Route::resource('orders', AdminOrderController::class)->only(['index', 'show']);
    Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status');

    // Paiements
    Route::resource('payments', AdminPaymentTransactionController::class)->only(['index', 'show']);
    Route::post('payments/{payment}/sync', [AdminPaymentTransactionController::class, 'sync'])
        ->name('payments.sync');

    // Templates
    Route::resource('templates', AdminTemplateController::class)->except(['show']);

    // Avis clients
    Route::get('reviews', [AdminTemplateReviewController::class, 'index'])->name('reviews.index');
    Route::patch('reviews/{review}', [AdminTemplateReviewController::class, 'update'])->name('reviews.update');

    // FAQ publique
    Route::resource('faqs', AdminFaqController::class)->except(['show']);

    // Secteurs
    Route::resource('sectors', AdminSectorController::class)->except(['show']);

    // Clients
    Route::get('clients', [ClientController::class, 'index'])->name('clients.index');
    Route::get('clients/{user}', [ClientController::class, 'show'])->name('clients.show');
    Route::patch('clients/{user}/active', [ClientController::class, 'toggleActive'])->name('clients.toggle-active');

    // Demandes de contact
    Route::get('contact-requests', [AdminContactRequestController::class, 'index'])->name('contact-requests.index');
    Route::patch('contact-requests/{contactRequest}/status', [AdminContactRequestController::class, 'updateStatus'])
        ->name('contact-requests.status');

    // Sauvegardes/restaurations données
    Route::get('backups', [DataBackupController::class, 'index'])->name('backups.index');
    Route::post('backups', [DataBackupController::class, 'store'])->name('backups.store');
    Route::get('backups/{backup}/download', [DataBackupController::class, 'download'])->name('backups.download');
    Route::post('backups/{backup}/restore', [DataBackupController::class, 'restore'])->name('backups.restore');

    // Notifications admin
    Route::get('notifications', [AdminNotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/send', [AdminNotificationController::class, 'send'])->name('notifications.send');
    Route::post('notifications/{id}/read', [AdminNotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('notifications/{id}/unread', [AdminNotificationController::class, 'markUnread'])->name('notifications.unread');
    Route::post('notifications/read-all', [AdminNotificationController::class, 'markAllRead'])->name('notifications.read-all');

    // Paramètres plateforme
    Route::get('settings', [AdminSettingsController::class, 'index'])->name('settings.index');
    Route::patch('settings/{section}', [AdminSettingsController::class, 'updateSection'])->name('settings.update-section');
    Route::post('settings/payment/test', [AdminSettingsController::class, 'testPayment'])->name('settings.payment.test');
    Route::post('settings/publish', [AdminSettingsController::class, 'publish'])->name('settings.publish');
    Route::get('settings/history', [AdminSettingsController::class, 'history'])->name('settings.history');
    Route::get('settings/history/compare', [AdminSettingsController::class, 'compare'])->name('settings.history.compare');
    Route::post('settings/history/{revision}/restore-draft', [AdminSettingsController::class, 'restoreDraft'])
        ->name('settings.history.restore-draft');

    // Journal d'audit
    Route::get('audit-logs', [AdminAuditLogController::class, 'index'])->name('audit-logs.index');
});

/*
|--------------------------------------------------------------------------
| Redirect racine vers login ou dashboard
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return auth()->check() ? redirect()->route('admin.dashboard') : redirect()->route('login');
});
