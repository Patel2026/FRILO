<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CashEntryController;
use App\Http\Controllers\Api\ClientContactController;
use App\Http\Controllers\Api\DeadlineController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\FaqController;
use App\Http\Controllers\Api\FedapayWebhookController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderOptionController;
use App\Http\Controllers\Api\OrderPaymentController;
use App\Http\Controllers\Api\PublicContentController;
use App\Http\Controllers\Api\PublicPricingController;
use App\Http\Controllers\Api\SectorController;
use App\Http\Controllers\Api\TemplateController;
use App\Http\Controllers\Api\TemplateReviewController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — FRILO
| Base URL : /api
|--------------------------------------------------------------------------
*/

/*
|--- Routes publiques (sans token) ---
*/
Route::middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:contact');
Route::post('/payments/fedapay/webhook', [FedapayWebhookController::class, 'store'])
    ->middleware('throttle:fedapay-webhook');

Route::get('/faqs', [FaqController::class, 'index']);
Route::get('/order-options', [OrderOptionController::class, 'index']);
Route::get('/public/content/{pageKey}', [PublicContentController::class, 'show']);
Route::get('/public/pricing', [PublicPricingController::class, 'show']);
Route::get('/sectors', [SectorController::class, 'index']);
Route::get('/testimonials', [TemplateReviewController::class, 'testimonials']);
Route::get('/templates', [TemplateController::class, 'index']);
Route::get('/templates/{id}', [TemplateController::class, 'show']);
Route::get('/templates/{id}/reviews', [TemplateReviewController::class, 'indexForTemplate']);

/*
|--- Routes authentifiées (token Bearer Sanctum) ---
*/
Route::middleware(['auth:sanctum', 'active_user'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);

    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/summary', [OrderController::class, 'summary']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::get('/templates/{id}/review-eligibility', [TemplateReviewController::class, 'eligibility']);
    Route::post('/templates/{id}/reviews', [TemplateReviewController::class, 'store']);
    Route::post('/orders/{id}/payment-link', [OrderPaymentController::class, 'store'])
        ->middleware('throttle:payments');
    Route::post('/orders/{id}/feedback', [OrderController::class, 'submitFeedback']);
    Route::get('/orders/{id}/payment-status', [OrderPaymentController::class, 'show']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    Route::apiResource('contacts', ClientContactController::class);

    Route::get('cash/summary', [CashEntryController::class, 'summary']);
    Route::apiResource('cash', CashEntryController::class)->except(['show']);

    Route::apiResource('deadlines', DeadlineController::class)->except(['show']);
});
