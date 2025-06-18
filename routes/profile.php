<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Profile Routes
|--------------------------------------------------------------------------
|
| Here are the routes for user profile management functionality.
| These routes are protected by authentication middleware.
|
*/

Route::middleware(['auth', 'verified'])->prefix('profile')->name('profile.')->group(function () {
    // Avatar management page
    Route::get('/avatar', function () {
        return Inertia::render('Profile/Avatar', [
            'auth' => [
                'user' => auth()->user()->load('roles', 'permissions')
            ]
        ]);
    })->name('avatar');

    // Profile settings page
    Route::get('/settings', function () {
        return Inertia::render('Profile/Settings', [
            'auth' => [
                'user' => auth()->user()->load('roles', 'permissions')
            ]
        ]);
    })->name('settings');

    // Profile overview page
    Route::get('/', function () {
        return Inertia::render('Profile/Index', [
            'auth' => [
                'user' => auth()->user()->load('roles', 'permissions')
            ]
        ]);
    })->name('index');
});
