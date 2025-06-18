<?php

use App\Http\Controllers\AvatarController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Avatar Routes
|--------------------------------------------------------------------------
|
| Here are the routes for avatar management functionality.
| These routes are protected by authentication middleware.
|
*/

Route::middleware(['auth', 'verified'])->group(function () {
    // Avatar management routes
    Route::prefix('avatar')->name('avatar.')->group(function () {
        // Get current user avatar info
        Route::get('/', [AvatarController::class, 'show'])->name('show');

        // Upload avatar file
        Route::post('/upload', [AvatarController::class, 'upload'])->name('upload');

        // Upload avatar using Spatie Media Library
        Route::post('/upload-media', [AvatarController::class, 'uploadWithMedia'])->name('upload.media');

        // Set avatar from URL
        Route::post('/set-url', [AvatarController::class, 'setFromUrl'])->name('setFromUrl');

        // Remove avatar
        Route::delete('/remove', [AvatarController::class, 'remove'])->name('remove');

        // Laravolt Avatar routes
        Route::post('/generate-laravolt', [AvatarController::class, 'generateLaravolt'])->name('generate.laravolt');
        Route::get('/laravolt-base64', [AvatarController::class, 'getLaravoltBase64'])->name('laravolt.base64');
        Route::post('/set-laravolt', [AvatarController::class, 'setLaravoltAsAvatar'])->name('set.laravolt');
        Route::delete('/clear-generated', [AvatarController::class, 'clearGeneratedAvatars'])->name('clear.generated');
    });
});

// API routes for avatar management (for AJAX requests)
Route::middleware(['auth:sanctum'])->prefix('api/avatar')->name('api.avatar.')->group(function () {
    // Get avatar info
    Route::get('/', [AvatarController::class, 'show'])->name('show');

    // Upload avatar
    Route::post('/upload', [AvatarController::class, 'upload'])->name('upload');

    // Set from URL
    Route::post('/set-url', [AvatarController::class, 'setFromUrl'])->name('setFromUrl');

    // Remove avatar
    Route::delete('/remove', [AvatarController::class, 'remove'])->name('remove');

    // Laravolt Avatar API routes
    Route::post('/generate-laravolt', [AvatarController::class, 'generateLaravolt'])->name('generate.laravolt');
    Route::get('/laravolt-base64', [AvatarController::class, 'getLaravoltBase64'])->name('laravolt.base64');
    Route::post('/set-laravolt', [AvatarController::class, 'setLaravoltAsAvatar'])->name('set.laravolt');
    Route::delete('/clear-generated', [AvatarController::class, 'clearGeneratedAvatars'])->name('clear.generated');
});
