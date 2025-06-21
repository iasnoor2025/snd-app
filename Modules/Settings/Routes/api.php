<?php

use Illuminate\Support\Facades\Route;
use Modules\Settings\Http\Controllers\Api\SettingApiController;
use Modules\Settings\Http\Controllers\Api\CompanySettingsApiController;
use Modules\Settings\Http\Controllers\Api\NotificationSettingsApiController;
use Modules\Settings\Http\Controllers\Api\ReportSettingsApiController;

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
});

