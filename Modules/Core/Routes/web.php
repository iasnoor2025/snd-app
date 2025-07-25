<?php

use Illuminate\Support\Facades\Route;
use Modules\Core\Http\Controllers\UserController;
use Modules\Core\Http\Controllers\RoleController;
use Modules\Core\Http\Controllers\PermissionController;
use Modules\Core\Http\Controllers\CoreController;
use Modules\Core\Http\Controllers\SystemSettingsController;
use Modules\Core\Http\Controllers\MfaController;
use Modules\Core\Http\Controllers\BackupController;
use Laravel\Socialite\Facades\Socialite;

/*
|--------------------------------------------------------------------------
| Core Module Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your module. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "web" middleware group.
|
*/

// User Management Routes - temporarily without auth middleware for testing
// Route::middleware(['auth', 'verified'])->group(function () {
    // User create routes - temporarily without permission middleware for testing
    Route::get('users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('users', [UserController::class, 'store'])->name('users.store');

    // User routes
    Route::middleware(['permission:users.view'])->group(function () {
        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::get('users/{user}', [UserController::class, 'show'])->name('users.show');
    });

    // Debug route to test if routes are working
    Route::get('test-users-create', function() {
        return response()->json(['message' => 'Test route working']);
    })->name('test.users.create');

    // Simple test route without any middleware
    Route::get('test-simple', function() {
        return response()->json(['message' => 'Simple test route working']);
    })->name('test.simple');

    // Temporary test - comment out permission middleware
    // Route::middleware(['permission:users.create'])->group(function () {
    //     Route::get('users/create', [UserController::class, 'create'])->name('users.create');
    //     Route::post('users', [UserController::class, 'store'])->name('users.store');
    // });

    // Route::middleware(['permission:users.create'])->group(function () {
    //     Route::get('users/create', [UserController::class, 'create'])->name('users.create');
    //     Route::post('users', [UserController::class, 'store'])->name('users.store');
    // });

    Route::middleware(['permission:users.edit'])->group(function () {
        Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::get('settings/users/{user}/permissions', [UserController::class, 'permissions'])->name('users.permissions');
        Route::put('settings/users/{user}/permissions', [UserController::class, 'updatePermissions'])->name('users.permissions.update');
    });

    Route::middleware(['permission:users.delete'])->group(function () {
        Route::delete('users/bulk-destroy', [UserController::class, 'bulkDestroy'])->name('users.bulk-destroy');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });

    // Role routes
    Route::middleware(['permission:roles.view'])->group(function () {
        Route::get('settings/roles', [RoleController::class, 'index'])->name('roles.index');
        Route::get('settings/roles/create', [RoleController::class, 'create'])->name('roles.create');
        Route::get('settings/roles/{role}', [RoleController::class, 'show'])->name('roles.show');
        Route::get('settings/user-roles', [RoleController::class, 'userRoles'])->name('roles.user-roles');
    });

    Route::middleware(['permission:roles.create'])->group(function () {
        Route::get('settings/roles/create', [RoleController::class, 'create'])->name('roles.create');
        Route::post('settings/roles', [RoleController::class, 'store'])->name('roles.store');
    });

    Route::middleware(['permission:roles.edit'])->group(function () {
        Route::get('settings/roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
        Route::put('settings/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::put('settings/user-roles/{user}', [RoleController::class, 'updateUserRoles'])->name('roles.update-user-roles');
    });

    Route::middleware(['permission:roles.delete'])->group(function () {
        Route::delete('settings/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
    });

    // Permission routes
    Route::middleware(['permission:permissions.view'])->group(function () {
        Route::get('settings/permissions', [PermissionController::class, 'index'])->name('permissions.index');
        Route::get('settings/permissions/{permission}', [PermissionController::class, 'show'])->name('permissions.show');
    });

    Route::middleware(['permission:permissions.create'])->group(function () {
        Route::get('settings/permissions/create', [PermissionController::class, 'create'])->name('permissions.create');
        Route::post('settings/permissions', [PermissionController::class, 'store'])->name('permissions.store');
    });

    Route::middleware(['permission:permissions.edit'])->group(function () {
        Route::get('settings/permissions/{permission}/edit', [PermissionController::class, 'edit'])->name('permissions.edit');
        Route::put('settings/permissions/{permission}', [PermissionController::class, 'update'])->name('permissions.update');
    });

    Route::middleware(['permission:permissions.delete'])->group(function () {
        Route::delete('settings/permissions/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');
    });

    Route::get('/settings/security', function () {
        return inertia('Core/pages/settings/SecuritySettings');
    })->name('settings.security');

    // MFA Routes
    Route::match(['get', 'post'], 'mfa/verify', [MfaController::class, 'verify'])
        ->name('mfa.verify');
// });

// Core resource routes
Route::group([], function () {
    Route::resource('core', CoreController::class)->names('core');

    // Module Management Route
    Route::get('module-management', function () {
        return inertia('Core/pages/ModuleManagement');
    })->name('core.module-management');

    // System Settings Routes
    Route::prefix('system-settings')->name('system-settings.')->group(function () {
        Route::get('/', [SystemSettingsController::class, 'index'])->name('index');
        Route::put('/', [SystemSettingsController::class, 'update'])->name('update');
        Route::post('/reset', [SystemSettingsController::class, 'reset'])->name('reset');
        Route::get('/export', [SystemSettingsController::class, 'export'])->name('export');
        Route::post('/import', [SystemSettingsController::class, 'import'])->name('import');
        Route::get('/health', [SystemSettingsController::class, 'health'])->name('health');
    });
});

// Social Login Routes
Route::get('/auth/redirect/{provider}', [
    'as' => 'social.redirect',
    'uses' => 'Modules\\Core\\Http\\Controllers\\SocialAuthController@redirectToProvider',
]);
Route::get('/auth/callback/{provider}', [
    'as' => 'social.callback',
    'uses' => 'Modules\\Core\\Http\\Controllers\\SocialAuthController@handleProviderCallback',
]);

Route::prefix('system/backup')->middleware(['auth', 'can:admin'])->group(function () {
    Route::post('/', [BackupController::class, 'backup']);
    Route::get('/', [BackupController::class, 'list']);
    Route::get('/download/{filename}', [BackupController::class, 'download']);
    Route::delete('/{filename}', [BackupController::class, 'delete']);
    Route::post('/restore', [BackupController::class, 'restore']);
});
