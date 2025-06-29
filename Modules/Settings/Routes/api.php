<?php

use Illuminate\Support\Facades\Route;
use Modules\Settings\Http\Controllers\Api\SettingApiController;
use Modules\Settings\Http\Controllers\Api\CompanySettingsApiController;
use Modules\Settings\Http\Controllers\Api\NotificationSettingsApiController;
use Modules\Settings\Http\Controllers\Api\ReportSettingsApiController;
use Modules\Settings\Http\Controllers\Api\ApiConfigController;
use Modules\Settings\Http\Controllers\Api\ThirdPartyServiceController;
use Modules\Settings\Http\Controllers\Api\WebhookApiController;
use Modules\Settings\Http\Controllers\Api\SsoSettingsApiController;
use Modules\Settings\Http\Controllers\Api\PaymentGatewaySettingsApiController;

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

Route::middleware(['auth:sanctum'])->group(function () {
    // General settings
    Route::get('settings', [SettingApiController::class, 'index']);
    Route::post('settings', [SettingApiController::class, 'store']);
    Route::get('settings/{setting}', [SettingApiController::class, 'show']);
    Route::put('settings/{setting}', [SettingApiController::class, 'update']);
    Route::delete('settings/{setting}', [SettingApiController::class, 'destroy']);
    Route::post('settings/bulk-update', [SettingApiController::class, 'bulkUpdate']);

    // Company settings
    Route::get('settings/company', [CompanySettingsApiController::class, 'index']);
    Route::post('settings/company', [CompanySettingsApiController::class, 'update']);
    Route::post('settings/company/logo', [CompanySettingsApiController::class, 'updateLogo']);
    Route::post('settings/company/address', [CompanySettingsApiController::class, 'updateAddress']);
    Route::post('settings/company/contact', [CompanySettingsApiController::class, 'updateContact']);

    // Notification settings
    Route::get('settings/notifications', [NotificationSettingsApiController::class, 'index']);
    Route::post('settings/notifications', [NotificationSettingsApiController::class, 'update']);

    // Report settings
    Route::get('settings/reports', [ReportSettingsApiController::class, 'index']);
    Route::post('settings/reports', [ReportSettingsApiController::class, 'update']);

    // API config
    Route::get('settings/api/config', [ApiConfigController::class, 'index']);
    Route::match(['put', 'patch'], 'settings/api/config', [ApiConfigController::class, 'update']);

    // Third-party services
    Route::get('settings/third-party-services', [ThirdPartyServiceController::class, 'index']);
    Route::post('settings/third-party-services', [ThirdPartyServiceController::class, 'store']);
    Route::match(['put', 'patch'], 'settings/third-party-services/{key}', [ThirdPartyServiceController::class, 'update']);
    Route::delete('settings/third-party-services/{key}', [ThirdPartyServiceController::class, 'destroy']);

    // Webhook configuration
    Route::get('settings/webhooks', [WebhookApiController::class, 'index']);
    Route::get('settings/webhooks/{id}', [WebhookApiController::class, 'show']);
    Route::post('settings/webhooks', [WebhookApiController::class, 'store']);
    Route::put('settings/webhooks/{id}', [WebhookApiController::class, 'update']);
    Route::delete('settings/webhooks/{id}', [WebhookApiController::class, 'destroy']);

    // SSO settings
    Route::get('settings/sso', [SsoSettingsApiController::class, 'index']);
    Route::get('settings/sso/{id}', [SsoSettingsApiController::class, 'show']);
    Route::post('settings/sso', [SsoSettingsApiController::class, 'store']);
    Route::put('settings/sso/{id}', [SsoSettingsApiController::class, 'update']);
    Route::delete('settings/sso/{id}', [SsoSettingsApiController::class, 'destroy']);

    // Payment gateway settings
    Route::get('settings/payment-gateways', [PaymentGatewaySettingsApiController::class, 'index']);
    Route::get('settings/payment-gateways/{id}', [PaymentGatewaySettingsApiController::class, 'show']);
    Route::post('settings/payment-gateways', [PaymentGatewaySettingsApiController::class, 'store']);
    Route::put('settings/payment-gateways/{id}', [PaymentGatewaySettingsApiController::class, 'update']);
    Route::delete('settings/payment-gateways/{id}', [PaymentGatewaySettingsApiController::class, 'destroy']);
});

