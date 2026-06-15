<?php

use App\Http\Controllers\Admin\AdminNotificationController;
use App\Http\Controllers\Admin\AuditLogController as AdminAuditLogController;
use App\Http\Controllers\Admin\ClientController;
use App\Http\Controllers\Admin\ContactRequestController as AdminContactRequestController;
use App\Http\Controllers\Admin\ContentBlockController as AdminContentBlockController;
use App\Http\Controllers\Admin\ContentRevisionController as AdminContentRevisionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DataBackupController;
use App\Http\Controllers\Admin\DeadlineController as AdminDeadlineController;
use App\Http\Controllers\Admin\FaqController as AdminFaqController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\OrderOptionController as AdminOrderOptionController;
use App\Http\Controllers\Admin\PaymentTransactionController as AdminPaymentTransactionController;
use App\Http\Controllers\Admin\PublicPageController as AdminPublicPageController;
use App\Http\Controllers\Admin\PublicSectionController as AdminPublicSectionController;
use App\Http\Controllers\Admin\SectorController as AdminSectorController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Admin\TemplateController as AdminTemplateController;
use App\Http\Controllers\Admin\TemplateReviewController as AdminTemplateReviewController;
use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth — session-based pour le backoffice admin
|--------------------------------------------------------------------------
*/
$adminEntryPath = (string) config('frilo.admin_entry_path', 'frilo-console');

Route::prefix($adminEntryPath)->name('admin.')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('/', [LoginController::class, 'showLoginForm'])->name('login');
        Route::post('/', [LoginController::class, 'login'])
            ->middleware('throttle:admin-login')
            ->name('login.submit');
    });
});

Route::get('/admin/login', function () {
    abort(404);
});

Route::post('/admin/logout', [LoginController::class, 'logout'])
    ->middleware('auth')
    ->name('admin.logout');

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
    Route::patch('orders/{order}/preview', [AdminOrderController::class, 'setPreviewUrl'])->name('orders.preview');
    Route::patch('orders/{order}/site', [AdminOrderController::class, 'setSiteInfo'])->name('orders.site');
    Route::patch('orders/{order}/assignment', [AdminOrderController::class, 'updateAssignment'])->name('orders.assignment');
    Route::patch('orders/{order}/material', [AdminOrderController::class, 'updateMaterial'])->name('orders.material');
    Route::patch('orders/{order}/production', [AdminOrderController::class, 'updateProduction'])->name('orders.production');
    Route::patch('orders/{order}/quality', [AdminOrderController::class, 'updateQuality'])->name('orders.quality');
    Route::patch('orders/{order}/reminder', [AdminOrderController::class, 'recordReminder'])->name('orders.reminder');

    // Paiements
    Route::resource('payments', AdminPaymentTransactionController::class)->only(['index', 'show']);
    Route::post('payments/{payment}/sync', [AdminPaymentTransactionController::class, 'sync'])
        ->name('payments.sync');

    // Templates
    Route::resource('templates', AdminTemplateController::class)->except(['show']);

    // Options payantes du tunnel de commande
    Route::resource('order-options', AdminOrderOptionController::class)->except(['show']);

    // Avis clients
    Route::get('reviews', [AdminTemplateReviewController::class, 'index'])->name('reviews.index');
    Route::patch('reviews/{review}', [AdminTemplateReviewController::class, 'update'])->name('reviews.update');

    // FAQ publique
    Route::resource('faqs', AdminFaqController::class)->except(['show']);

    // Contenu public
    Route::get('content/pages', [AdminPublicPageController::class, 'index'])->name('content.pages.index');
    Route::get('content/pages/{publicPage}/edit', [AdminPublicPageController::class, 'edit'])->name('content.pages.edit');
    Route::patch('content/pages/{publicPage}', [AdminPublicPageController::class, 'update'])->name('content.pages.update');
    Route::post('content/pages/{publicPage}/blocks', [AdminContentBlockController::class, 'store'])->name('content.pages.blocks.store');
    Route::patch('content/pages/{publicPage}/blocks/order', [AdminPublicPageController::class, 'reorderBlocks'])->name('content.pages.blocks.order');
    Route::patch('content/sections/{publicSection}', [AdminPublicSectionController::class, 'update'])->name('content.sections.update');
    Route::patch('content/blocks/{contentBlock}', [AdminContentBlockController::class, 'update'])->name('content.blocks.update');
    Route::delete('content/blocks/{contentBlock}', [AdminContentBlockController::class, 'destroy'])->name('content.blocks.destroy');
    Route::get('content/history', [AdminContentRevisionController::class, 'index'])->name('content.history.index');
    Route::post('content/history/{contentRevision}/restore', [AdminContentRevisionController::class, 'restore'])->name('content.history.restore');

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

    // Échéances système
    Route::resource('deadlines', AdminDeadlineController::class)->except(['show']);

    // Journal d'audit
    Route::get('audit-logs', [AdminAuditLogController::class, 'index'])->name('audit-logs.index');
});

/*
|--------------------------------------------------------------------------
| Redirect racine vers login ou dashboard
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return auth()->check() ? redirect()->route('admin.dashboard') : redirect()->route('admin.login');
});
