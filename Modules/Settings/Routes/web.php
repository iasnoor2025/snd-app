<?php

use Illuminate\Support\Facades\Route;
use Modules\Settings\Http\Controllers\SettingController;
use Modules\Settings\Http\Controllers\CompanySettingsController;
use Modules\Settings\Http\Controllers\NotificationSettingsController;
use Modules\Settings\Http\Controllers\ReportSettingsController;
use Modules\Settings\Http\Controllers\PasswordController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the SettingsServiceProvider within a group which
| contains the "web" middleware group.
|
*/

Route::middleware(['web', 'auth', 'verified'])->prefix('settings')->name('settings.')->group(function () {
    // General settings dashboard
    Route::get('/', [SettingController::class, 'index'])->name('index');

    // System settings management
    Route::get('/create', [SettingController::class, 'create'])->name('create');
    Route::post('/', [SettingController::class, 'store'])->name('store');
    Route::get('/{setting}', [SettingController::class, 'show'])->name('show');
    Route::get('/{setting}/edit', [SettingController::class, 'edit'])->name('edit');
    Route::put('/{setting}', [SettingController::class, 'update'])->name('update');
    Route::delete('/{setting}', [SettingController::class, 'destroy'])->name('destroy');
    Route::post('/bulk-update', [SettingController::class, 'bulkUpdate'])->name('bulk-update');

    // Company settings
    Route::get('/company', [CompanySettingsController::class, 'index'])->name('company');
    Route::post('/company', [CompanySettingsController::class, 'update'])->name('company.update');
    Route::post('/company/logo', [CompanySettingsController::class, 'updateLogo'])->name('company.logo');
    Route::post('/company/address', [CompanySettingsController::class, 'updateAddress'])->name('company.address');
    Route::post('/company/contact', [CompanySettingsController::class, 'updateContact'])->name('company.contact');

    // Notification settings
    Route::get('/notifications', [NotificationSettingsController::class, 'index'])->name('notifications');
    Route::post('/notifications', [NotificationSettingsController::class, 'update'])->name('notifications.update');

    // Report settings
    Route::get('/reports', [ReportSettingsController::class, 'index'])->name('reports');
    Route::post('/reports', [ReportSettingsController::class, 'update'])->name('reports.update');

    // Password management
    Route::get('/password', [PasswordController::class, 'index'])->name('password');
    Route::post('/password', [PasswordController::class, 'update'])->name('module.settings.password.update');

    // Admin settings (protected by permission)
    Route::middleware(['can:manage system settings'])->prefix('admin')->name('admin.')->group(function() {
        Route::get('/', [SettingController::class, 'adminDashboard'])->name('dashboard');
        Route::get('/system', [SettingController::class, 'systemSettings'])->name('system');
        Route::post('/system', [SettingController::class, 'updateSystemSettings'])->name('system.update');
        Route::get('/backup', [SettingController::class, 'backupSettings'])->name('backup');
        Route::post('/backup', [SettingController::class, 'updateBackupSettings'])->name('backup.update');
    });
});

