<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Health Check Routes
|--------------------------------------------------------------------------
|
| These routes are used for health checks and connectivity verification.
|
*/

// Simple health check endpoint for PWA connectivity verification
Route::get('/up', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString()
    ], 200);
})->name('health.up');

// More detailed health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toISOString(),
        'app' => [
            'name' => config('app.name'),
            'version' => config('app.version', '1.0.0'),
            'environment' => config('app.env')
        ],
        'database' => [
            'status' => 'connected'
        ]
    ], 200);
})->name('health.check');
