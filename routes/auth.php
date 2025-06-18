<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Modules\Core\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
});

Route::middleware('auth')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    // Custom Auth Controller Routes
    Route::get('profile', [AuthController::class, 'profile'])->name('profile');
    Route::put('profile', [AuthController::class, 'updateProfile'])->name('auth.profile.update');
    Route::put('password', [AuthController::class, 'updatePassword'])->name('auth.password.update');

    // API Routes for user data
    Route::get('api/user', [AuthController::class, 'currentUser'])->name('api.user');
    Route::get('api/user/permissions', [AuthController::class, 'userPermissions'])->name('api.user.permissions');

    // Admin routes for user management
    Route::middleware(['role:admin'])->group(function () {
        Route::get('admin/users', [AuthController::class, 'manageUsers'])->name('admin.users');
        Route::post('admin/users', [AuthController::class, 'createUser'])->name('admin.users.create');
        Route::put('admin/users/{user}', [AuthController::class, 'updateUser'])->name('admin.users.update');
        Route::delete('admin/users/{user}', [AuthController::class, 'deleteUser'])->name('admin.users.delete');
        Route::post('admin/users/{user}/toggle-status', [AuthController::class, 'toggleUserStatus'])->name('admin.users.toggle-status');
        Route::post('admin/users/{user}/assign-role', [AuthController::class, 'assignRole'])->name('admin.users.assign-role');
        Route::delete('admin/users/{user}/remove-role', [AuthController::class, 'removeRole'])->name('admin.users.remove-role');

        Route::get('admin/roles', [AuthController::class, 'manageRoles'])->name('admin.roles');
        Route::post('admin/roles', [AuthController::class, 'createRole'])->name('admin.roles.create');
        Route::put('admin/roles/{role}', [AuthController::class, 'updateRole'])->name('admin.roles.update');
        Route::delete('admin/roles/{role}', [AuthController::class, 'deleteRole'])->name('admin.roles.delete');
    });

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
