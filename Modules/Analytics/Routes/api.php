<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Analytics API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your Analytics module.
| These routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->prefix('analytics')->name('analytics.api.')->group(function () {
    Route::get('/stats', function () {
        return response()->json([
            'data' => [
                'message' => 'Analytics stats endpoint - implement as needed'
            ]
        ]);
    })->name('stats');

    Route::get('/dashboard-data', function () {
        return response()->json([
            'data' => [
                'message' => 'Analytics dashboard data endpoint - implement as needed'
            ]
        ]);
    })->name('dashboard-data');

    Route::get('/reports', function () {
        return response()->json([
            'data' => [
                'message' => 'Analytics reports endpoint - implement as needed'
            ]
        ]);
    })->name('reports');
});
