<?php

use Modules\Localization\Http\Controllers\LocalizationController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
|
| These routes are accessible without authentication
|
*/

// Public locale switching route
Route::get('/switch-locale/{locale}', [LocalizationController::class, 'switchLocale'])->name('localization.switch.public');
