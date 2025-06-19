<?php

use Modules\MobileBridge\Http\Controllers\PWAController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// PWA Routes
Route::get('/manifest.json', [PWAController::class, 'manifest'])->name('pwa.manifest');
Route::get('/sw.js', [PWAController::class, 'serviceWorker'])->name('pwa.service-worker');
Route::get('/offline', [PWAController::class, 'offline'])->name('pwa.offline');

// PWA Management Page
Route::middleware(['web', 'auth'])->group(function() {
    Route::get('/pwa', [PWAController::class, 'index'])->name('pwa.index');
});

// PWA API Routes
Route::prefix('pwa')->name('pwa.')->group(function() {
    Route::post('/install', [PWAController::class, 'install'])->name('install');
    Route::get('/stats', [PWAController::class, 'stats'])->name('stats');
    Route::post('/subscribe', [PWAController::class, 'subscribe'])->name('subscribe');
    Route::post('/unsubscribe', [PWAController::class, 'unsubscribe'])->name('unsubscribe');
});

// Legacy MobileBridge routes - Temporarily disabled until controller is created
// Route::prefix('mobilebridge')->group(function() {
//     Route::get('/', 'MobileBridgeController@index');
// });

// TODO: Temporarily comment out all routes in this file to debug EmployeeManagement API and missing MobileBridgeController

Route::middleware(['web', 'auth', 'verified'])->prefix('mobile-bridge')->name('mobile-bridge.')->group(function () {
    // Dashboard and overview
    // Route::get('/', 'MobileBridgeController@index')->name('index');

    // API key management
    // Route::get('/api-keys', 'MobileBridgeController@apiKeys')->name('api-keys');
    // Route::post('/api-keys', 'MobileBridgeController@storeApiKey')->name('api-keys.store');
    // Route::put('/api-keys/{id}', 'MobileBridgeController@updateApiKey')->name('api-keys.update');
    // Route::delete('/api-keys/{id}', 'MobileBridgeController@destroyApiKey')->name('api-keys.destroy');

    // Synchronization management
    // Route::get('/sync-status', 'MobileBridgeController@syncStatus')->name('sync-status');
    // Route::post('/sync/trigger', 'MobileBridgeController@triggerSync')->name('sync.trigger');
    // Route::get('/sync/history', 'MobileBridgeController@syncHistory')->name('sync.history');
    // Route::get('/sync/log/{id}', 'MobileBridgeController@syncLog')->name('sync.log');

    // Mobile app configuration
    // Route::get('/config', 'MobileBridgeController@configuration')->name('config');
    // Route::post('/config', 'MobileBridgeController@updateConfiguration')->name('config.update');

    // User device management
    // Route::get('/devices', 'MobileBridgeController@devices')->name('devices');
    // Route::delete('/devices/{id}', 'MobileBridgeController@removeDevice')->name('devices.remove');

    // Feedback and support
    // Route::get('/feedback', 'MobileBridgeController@feedbackList')->name('feedback');
    // Route::get('/feedback/{id}', 'MobileBridgeController@viewFeedback')->name('feedback.view');
    // Route::post('/feedback/{id}/respond', 'MobileBridgeController@respondToFeedback')->name('feedback.respond');
});



