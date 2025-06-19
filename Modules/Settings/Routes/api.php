<?php

use Illuminate\Support\Facades\Route;
use Modules\Settings\Http\Controllers\Api\SettingController;
use Modules\Settings\Http\Controllers\Api\CompanySettingsApiController;
use Modules\Settings\Http\Controllers\Api\ProfileApiController;
use Modules\Settings\Http\Controllers\Api\PasswordApiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the SettingsServiceProvider within a group which
| is assigned the "api" middleware group.
|
*/

// Settings API Routes

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('settings', SettingController::class);

    // General settings
    Route::get('settings', [SettingController::class, 'index']);
    Route::get('settings/group/{group}', [SettingController::class, 'getByGroup']);
    Route::get('settings/{key}', [SettingController::class, 'getByKey']);
    Route::post('settings', [SettingController::class, 'store']);
    Route::put('settings/{id}', [SettingController::class, 'update']);
    Route::delete('settings/{id}', [SettingController::class, 'destroy']);
    Route::post('settings/bulk-update', [SettingController::class, 'bulkUpdate']);

    // Company settings
    Route::get('settings/company', [CompanySettingsApiController::class, 'getCompanySettings']);
    Route::post('settings/company', [CompanySettingsApiController::class, 'updateCompanySettings']);
    Route::post('settings/company/logo', [CompanySettingsApiController::class, 'updateLogo']);

    // User profile and preferences
    Route::get('settings/profile', [ProfileApiController::class, 'getProfile']);
    Route::post('settings/profile', [ProfileApiController::class, 'updateProfile']);
    Route::post('settings/profile/avatar', [ProfileApiController::class, 'updateAvatar']);

    // Password management
    Route::post('settings/password/change', [PasswordApiController::class, 'changePassword']);
    Route::post('settings/password/reset', [PasswordApiController::class, 'resetPassword']);

    // System configuration
    Route::get('settings/system/info', [SettingController::class, 'getSystemInfo']);
    Route::get('settings/system/version', [SettingController::class, 'getVersion']);
});

