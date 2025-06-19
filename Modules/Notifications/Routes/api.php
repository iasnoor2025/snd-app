<?php

use Illuminate\Support\Facades\Route;
use Modules\Notifications\Http\Controllers\Api\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group.
|
*/

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    // User notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/unread', [NotificationController::class, 'unread']);
    Route::get('notifications/stats', [NotificationController::class, 'stats']);
    Route::get('notifications/types', [NotificationController::class, 'types']);
    Route::get('notifications/{id}', [NotificationController::class, 'show']);
    Route::post('notifications/mark-as-read/{id}', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead']);
    Route::post('notifications/bulk-action', [NotificationController::class, 'bulkAction']);
    Route::delete('notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('notifications/clear-all', [NotificationController::class, 'destroyAll']);
});
