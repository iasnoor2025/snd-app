<?php

use Illuminate\Support\Facades\Route;
use Modules\Notifications\Http\Controllers\Api\NotificationController;
use Modules\Notifications\Http\Controllers\Api\PushNotificationController;
use Modules\Notifications\Http\Controllers\Api\SmsNotificationController;
use Modules\Notifications\Http\Controllers\Api\InAppNotificationController;
use Modules\Notifications\Http\Controllers\Api\NotificationPreferenceController;
use Modules\Notifications\Http\Controllers\Api\ScheduledNotificationController;

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

    // Push notifications
    Route::post('notifications/push/register', [PushNotificationController::class, 'registerToken']);
    Route::post('notifications/push/test', [PushNotificationController::class, 'sendTest']);

    // SMS notifications
    Route::post('notifications/sms/test', [SmsNotificationController::class, 'sendTest']);

    // In-app notifications
    Route::get('notifications/in-app', [InAppNotificationController::class, 'index']);
    Route::post('notifications/in-app/{id}/read', [InAppNotificationController::class, 'markAsRead']);
    Route::delete('notifications/in-app/clear', [InAppNotificationController::class, 'clearAll']);

    // Notification preferences
    Route::get('notifications/preferences', [NotificationPreferenceController::class, 'get']);
    Route::post('notifications/preferences', [NotificationPreferenceController::class, 'update']);

    // Scheduled notifications
    Route::get('notifications/scheduled', [ScheduledNotificationController::class, 'index']);
    Route::post('notifications/scheduled', [ScheduledNotificationController::class, 'store']);
    Route::post('notifications/scheduled/{id}/cancel', [ScheduledNotificationController::class, 'cancel']);
});
