<?php

use Illuminate\Support\Facades\Route;
use Modules\Notifications\Http\Controllers\Api\NotificationsApiController;
use Modules\Notifications\Http\Controllers\Api\NotificationPreferencesApiController;
use Modules\Notifications\Http\Controllers\Api\NotificationChannelsApiController;
use Modules\Notifications\Http\Controllers\Api\NotificationDevicesApiController;

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

// TODO: Temporarily comment out all routes in this file to debug EmployeeManagement API

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    // User notifications
    // Route::get('notifications', [NotificationsApiController::class, 'index']);
    // Route::get('notifications/unread', [NotificationsApiController::class, 'unread']);
    // Route::get('notifications/{id}', [NotificationsApiController::class, 'show']);
    // Route::post('notifications/mark-as-read/{id}', [NotificationsApiController::class, 'markAsRead']);
    // Route::post('notifications/mark-all-as-read', [NotificationsApiController::class, 'markAllAsRead']);
    // Route::delete('notifications/{id}', [NotificationsApiController::class, 'destroy']);
    // Route::delete('notifications/clear-all', [NotificationsApiController::class, 'clearAll']);

    // Notification preferences
    // Route::get('notifications/preferences', [NotificationPreferencesApiController::class, 'getPreferences']);
    // Route::post('notifications/preferences', [NotificationPreferencesApiController::class, 'updatePreferences']);
    // Route::post('notifications/preferences/reset', [NotificationPreferencesApiController::class, 'resetToDefault']);

    // Notification channels
    // Route::get('notifications/channels', [NotificationChannelsApiController::class, 'getChannels']);
    // Route::post('notifications/channels/email/verify', [NotificationChannelsApiController::class, 'verifyEmail']);
    // Route::post('notifications/channels/sms/verify', [NotificationChannelsApiController::class, 'verifySms']);

    // Push notifications
    // Route::post('notifications/devices/register', [NotificationDevicesApiController::class, 'register']);
    // Route::delete('notifications/devices/{token}', [NotificationDevicesApiController::class, 'unregister']);
});

