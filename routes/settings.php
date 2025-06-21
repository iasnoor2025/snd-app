<?php

use Modules\Settings\Http\Controllers\PasswordController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Settings Routes
|--------------------------------------------------------------------------
|
| Here is where you can register settings routes for your application.
|
*/

Route::middleware('auth')->group(function () {
    // Redirect old settings route to new profile settings
    Route::redirect('settings', '/profile/settings');

    // Password settings
    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('settings.password.update');

    // Appearance settings
    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');
});
