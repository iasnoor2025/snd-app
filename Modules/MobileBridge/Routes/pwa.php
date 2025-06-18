<?php

use Illuminate\Support\Facades\Route;
use Modules\MobileBridge\Http\Controllers\PWAController;

/*
|--------------------------------------------------------------------------
| PWA Routes
|--------------------------------------------------------------------------
|
| Here is where you can register PWA routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::middleware(['web'])->group(function () {
    // PWA Manifest
    Route::get('/manifest.json', [PWAController::class, 'manifest'])
        ->name('pwa.manifest');

    // Service Worker
    Route::get('/sw.js', [PWAController::class, 'serviceWorker'])
        ->name('pwa.sw');

    // Offline Page
    Route::get('/offline', [PWAController::class, 'offline'])
        ->name('pwa.offline');
});

Route::middleware(['web', 'auth'])->group(function () {
    // PWA Management Page
    Route::get('/pwa', [PWAController::class, 'index'])
        ->name('pwa.index');

    // PWA Installation
    Route::post('/pwa/install', [PWAController::class, 'install'])
        ->name('pwa.install');

    // PWA Statistics
    Route::get('/pwa/stats', [PWAController::class, 'stats'])
        ->name('pwa.stats');

    // Push Notification Subscription
    Route::post('/pwa/subscribe', [PWAController::class, 'subscribe'])
        ->name('pwa.subscribe');

    // Push Notification Unsubscription
    Route::post('/pwa/unsubscribe', [PWAController::class, 'unsubscribe'])
        ->name('pwa.unsubscribe');
});
