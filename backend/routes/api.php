<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SectorController;
use App\Http\Controllers\Api\TemplateController;
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
});
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:contact');

Route::get('/sectors', [SectorController::class, 'index']);
Route::get('/templates', [TemplateController::class, 'index']);
Route::get('/templates/{id}', [TemplateController::class, 'show']);

/*
|--- Routes authentifiées (token Bearer Sanctum) ---
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'updateProfile']);

    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/summary', [OrderController::class, 'summary']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
});
