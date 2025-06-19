<?php

use Illuminate\Support\Facades\Route;
use Modules\Core\Http\Controllers\AvatarController;

/*
|--------------------------------------------------------------------------
| Employee Avatar Routes
|--------------------------------------------------------------------------
|
| These routes handle avatar management for Employee models including
| upload, URL setting, Laravolt generation, and removal functionality.
|
*/

Route::middleware(['auth', 'verified'])->prefix('employees/{employee}/avatar')->name('employees.avatar.')->group(function () {
    // File upload avatar
    Route::post('/upload', [AvatarController::class, 'upload'])
        ->name('upload')
        ->middleware('permission:employees.edit');

    // Set avatar from URL
    Route::post('/set-from-url', [AvatarController::class, 'setFromUrl'])
        ->name('setFromUrl')
        ->middleware('permission:employees.edit');

    // Remove avatar
    Route::delete('/remove', [AvatarController::class, 'remove'])
        ->name('remove')
        ->middleware('permission:employees.edit');

    // Get avatar data
    Route::get('/data', [AvatarController::class, 'getAvatarData'])
        ->name('data')
        ->middleware('permission:employees.view');

    // Laravolt avatar generation
    Route::post('/generate-laravolt', [AvatarController::class, 'generateLaravolt'])
        ->name('generate.laravolt')
        ->middleware('permission:employees.edit');

    // Get Laravolt base64 avatar
    Route::get('/laravolt-base64', [AvatarController::class, 'getLaravoltBase64'])
        ->name('laravolt.base64')
        ->middleware('permission:employees.view');

    // Set Laravolt avatar as primary
    Route::post('/set-laravolt', [AvatarController::class, 'setLaravoltAsAvatar'])
        ->name('set.laravolt')
        ->middleware('permission:employees.edit');

    // Clear generated avatars
    Route::delete('/clear-generated', [AvatarController::class, 'clearGeneratedAvatars'])
        ->name('clear.generated')
        ->middleware('permission:employees.edit');
});

// API Routes for Employee Avatars
Route::middleware(['auth:sanctum'])->prefix('api/employees/{employee}/avatar')->name('api.employees.avatar.')->group(function () {
    // File upload avatar
    Route::post('/upload', [AvatarController::class, 'upload'])
        ->name('upload');

    // Set avatar from URL
    Route::post('/set-from-url', [AvatarController::class, 'setFromUrl'])
        ->name('setFromUrl');

    // Remove avatar
    Route::delete('/remove', [AvatarController::class, 'remove'])
        ->name('remove');

    // Get avatar data
    Route::get('/data', [AvatarController::class, 'getAvatarData'])
        ->name('data');

    // Laravolt avatar generation
    Route::post('/generate-laravolt', [AvatarController::class, 'generateLaravolt'])
        ->name('generate.laravolt');

    // Get Laravolt base64 avatar
    Route::get('/laravolt-base64', [AvatarController::class, 'getLaravoltBase64'])
        ->name('laravolt.base64');

    // Set Laravolt avatar as primary
    Route::post('/set-laravolt', [AvatarController::class, 'setLaravoltAsAvatar'])
        ->name('set.laravolt');

    // Clear generated avatars
    Route::delete('/clear-generated', [AvatarController::class, 'clearGeneratedAvatars'])
        ->name('clear.generated');
});
