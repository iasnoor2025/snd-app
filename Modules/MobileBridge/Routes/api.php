<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Modules\MobileBridge\Http\Controllers\Api\MobileSyncApiController;
use Modules\MobileBridge\Http\Controllers\Api\DeviceInfoApiController;
use Modules\MobileBridge\Http\Controllers\Api\MobileConfigApiController;
use Modules\MobileBridge\Http\Controllers\Api\MobileAuthApiController;
use Modules\MobileBridge\Http\Controllers\Api\MobileFeedbackApiController;
use Modules\MobileBridge\Http\Controllers\Api\MobileSupportApiController;
use Modules\MobileBridge\Http\Controllers\Api\MobileNotificationApiController;
use Modules\MobileBridge\Http\Controllers\PushNotificationController;
use Modules\MobileBridge\Http\Controllers\PWAController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Push Notification API Routes
// VAPID key endpoint - public access needed for client-side setup
Route::prefix('push-notifications')->group(function () {
    Route::get('/vapid-key', [PushNotificationController::class, 'getVapidKey']);
});

// Authenticated push notification routes
Route::prefix('push-notifications')->middleware('auth:sanctum')->group(function () {
    // Subscription management
    Route::post('/subscribe', [PushNotificationController::class, 'subscribe']);
    Route::post('/unsubscribe', [PushNotificationController::class, 'unsubscribe']);
    Route::post('/sync-subscription', [PushNotificationController::class, 'syncSubscription']);

    // User subscription management
    Route::get('/subscriptions', [PushNotificationController::class, 'getUserSubscriptions']);
    Route::delete('/subscriptions/{id}', [PushNotificationController::class, 'deleteSubscription']);

    // Notification interaction tracking
    Route::post('/track-interaction', [PushNotificationController::class, 'trackInteraction']);

    // Statistics and analytics
    Route::get('/stats', [PushNotificationController::class, 'getStats']);

    // Test notification
    Route::post('/test', [PushNotificationController::class, 'sendTestNotification']);
});

// PWA API Routes
Route::prefix('pwa')->group(function () {
    // Public routes (no auth required)
    Route::get('/manifest', [PWAController::class, 'manifest']);
    Route::get('/service-worker', [PWAController::class, 'serviceWorker']);

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/install', [PWAController::class, 'install']);
        Route::get('/stats', [PWAController::class, 'getStats']);
        Route::post('/update-check', [PWAController::class, 'checkForUpdates']);
        Route::post('/clear-cache', [PWAController::class, 'clearCache']);
    });
});

// Mobile Bridge API Routes
Route::prefix('mobile')->middleware('auth:sanctum')->group(function () {
    // Offline sync endpoints
    Route::post('/sync/queue-action', [MobileSyncApiController::class, 'queueAction']);
    Route::get('/sync/pending-actions', [MobileSyncApiController::class, 'getPendingActions']);
    Route::post('/sync/complete-action', [MobileSyncApiController::class, 'completeAction']);
    Route::get('/sync/stats', [MobileSyncApiController::class, 'getSyncStats']);
    Route::delete('/sync/clear-completed', [MobileSyncApiController::class, 'clearCompleted']);

    // Device information and management
    Route::post('/device/register', [DeviceInfoApiController::class, 'registerDevice']);
    Route::post('/device/update-last-seen', [DeviceInfoApiController::class, 'updateLastSeen']);
    Route::get('/device/info', [DeviceInfoApiController::class, 'getDeviceInfo']);
    Route::get('/devices', [DeviceInfoApiController::class, 'getUserDevices']);
    Route::post('/device/deactivate', [DeviceInfoApiController::class, 'deactivateDevice']);
    Route::get('/device/stats', [DeviceInfoApiController::class, 'getDeviceStats']);

    // App version check
    Route::post('/version/check', [DeviceInfoApiController::class, 'checkVersion']);
});

// Mobile API Routes - All controllers are now implemented

Route::middleware(['auth:sanctum'])->prefix('v1/mobile')->group(function () {
    // Mobile Sync - Data synchronization and offline support
    Route::post('sync/queue-action', [MobileSyncApiController::class, 'queueAction']);
    Route::get('sync/pending-actions', [MobileSyncApiController::class, 'getPendingActions']);
    Route::post('sync/complete-action', [MobileSyncApiController::class, 'completeAction']);
    Route::get('sync/stats', [MobileSyncApiController::class, 'getSyncStats']);
    Route::delete('sync/clear-completed', [MobileSyncApiController::class, 'clearCompleted']);

    // Device Information
    Route::post('device/register', [DeviceInfoApiController::class, 'registerDevice']);
    Route::post('device/update-last-seen', [DeviceInfoApiController::class, 'updateLastSeen']);
    Route::get('device/info', [DeviceInfoApiController::class, 'getDeviceInfo']);
    Route::get('device/user-devices', [DeviceInfoApiController::class, 'getUserDevices']);
    Route::get('device/check-version', [DeviceInfoApiController::class, 'checkVersion']);
    Route::post('device/deactivate', [DeviceInfoApiController::class, 'deactivateDevice']);
    Route::get('device/stats', [DeviceInfoApiController::class, 'getDeviceStats']);

    // Mobile App Configuration
    Route::get('config', [MobileConfigApiController::class, 'getConfig']);
    Route::post('config/update', [MobileConfigApiController::class, 'updateConfig']);
    Route::get('config/app-version', [MobileConfigApiController::class, 'getAppVersion']);
    Route::post('config/reset', [MobileConfigApiController::class, 'resetConfig']);
    Route::get('config/feature-flags', [MobileConfigApiController::class, 'getFeatureFlags']);

    // User Management and Authentication
    Route::get('user', [MobileAuthApiController::class, 'getUser']);
    Route::post('user/profile', [MobileAuthApiController::class, 'updateProfile']);
    Route::post('user/settings', [MobileAuthApiController::class, 'updateSettings']);
    Route::post('user/change-password', [MobileAuthApiController::class, 'changePassword']);
    Route::get('user/activity-log', [MobileAuthApiController::class, 'getActivityLog']);
    Route::get('user/sessions', [MobileAuthApiController::class, 'getSessions']);
    Route::delete('user/sessions/{tokenId}', [MobileAuthApiController::class, 'revokeSession']);
    Route::post('user/logout-all', [MobileAuthApiController::class, 'logoutAllDevices']);
    Route::get('user/stats', [MobileAuthApiController::class, 'getUserStats']);

    // Feedback System
    Route::post('feedback', [MobileFeedbackApiController::class, 'storeFeedback']);
    Route::get('feedback', [MobileFeedbackApiController::class, 'getUserFeedback']);
    Route::get('feedback/{feedbackId}', [MobileFeedbackApiController::class, 'getFeedback']);
    Route::put('feedback/{feedbackId}', [MobileFeedbackApiController::class, 'updateFeedback']);
    Route::delete('feedback/{feedbackId}', [MobileFeedbackApiController::class, 'deleteFeedback']);
    Route::get('feedback/stats', [MobileFeedbackApiController::class, 'getFeedbackStats']);

    // Support System
    Route::get('support/faqs', [MobileSupportApiController::class, 'getFaqs']);
    Route::get('support/faqs/{faqId}', [MobileSupportApiController::class, 'getFaq']);
    Route::post('support/faqs/{faqId}/rate', [MobileSupportApiController::class, 'rateFaq']);
    Route::post('support/tickets', [MobileSupportApiController::class, 'createSupportTicket']);
    Route::get('support/tickets', [MobileSupportApiController::class, 'getUserTickets']);
    Route::get('support/tickets/{ticketId}', [MobileSupportApiController::class, 'getTicket']);
    Route::post('support/tickets/{ticketId}/messages', [MobileSupportApiController::class, 'addTicketMessage']);
    Route::post('support/tickets/{ticketId}/close', [MobileSupportApiController::class, 'closeTicket']);
    Route::get('support/stats', [MobileSupportApiController::class, 'getSupportStats']);

    // Notification System
    Route::get('notifications', [MobileNotificationApiController::class, 'getNotifications']);
    Route::post('notifications/{notificationId}/read', [MobileNotificationApiController::class, 'markAsRead']);
    Route::post('notifications/mark-all-read', [MobileNotificationApiController::class, 'markAllAsRead']);
    Route::delete('notifications/{notificationId}', [MobileNotificationApiController::class, 'deleteNotification']);
    Route::delete('notifications/clear-all', [MobileNotificationApiController::class, 'clearAllNotifications']);
    Route::get('notifications/settings', [MobileNotificationApiController::class, 'getNotificationSettings']);
    Route::post('notifications/settings', [MobileNotificationApiController::class, 'updateNotificationSettings']);
    Route::post('notifications/test', [MobileNotificationApiController::class, 'sendTestNotification']);
    Route::get('notifications/stats', [MobileNotificationApiController::class, 'getNotificationStats']);
    Route::post('notifications/create', [MobileNotificationApiController::class, 'createNotification']);
});

