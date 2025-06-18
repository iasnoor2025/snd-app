<?php

use Illuminate\Support\Facades\Route;
use Modules\Settings\Http\Controllers\Api\SettingApiController;
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

// TODO: Temporarily comment out all routes in this file to debug EmployeeManagement API

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    // General settings
    // Route::get('settings', [SettingApiController::class, 'index']);
    // Route::get('settings/group/{group}', [SettingApiController::class, 'getByGroup']);
    // Route::get('settings/{key}', [SettingApiController::class, 'getByKey']);
    // Route::post('settings', [SettingApiController::class, 'store']);
    // Route::put('settings/{id}', [SettingApiController::class, 'update']);
    // Route::delete('settings/{id}', [SettingApiController::class, 'destroy']);
    // Route::post('settings/bulk-update', [SettingApiController::class, 'bulkUpdate']);

    // Company settings
    // Route::get('settings/company', [CompanySettingsApiController::class, 'getCompanySettings']);
    // Route::post('settings/company', [CompanySettingsApiController::class, 'updateCompanySettings']);
    // Route::post('settings/company/logo', [CompanySettingsApiController::class, 'updateLogo']);

    // User profile and preferences
    // Route::get('settings/profile', [ProfileApiController::class, 'getProfile']);
    // Route::post('settings/profile', [ProfileApiController::class, 'updateProfile']);
    // Route::post('settings/profile/avatar', [ProfileApiController::class, 'updateAvatar']);

    // Password management
    // Route::post('settings/password/change', [PasswordApiController::class, 'changePassword']);
    // Route::post('settings/password/reset', [PasswordApiController::class, 'resetPassword']);

    // System configuration
    // Route::get('settings/system/info', [SettingApiController::class, 'getSystemInfo']);
    // Route::get('settings/system/version', [SettingApiController::class, 'getVersion']);
});

