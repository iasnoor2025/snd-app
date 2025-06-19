<?php

use Illuminate\Support\Facades\Route;
use Modules\Localization\Http\Controllers\Api\LocalizationApiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group.
|
*/

// TODO: Temporarily comment out all routes in this file to debug EmployeeManagement API
Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    // Translations and localization management
    Route::get('translations', [LocalizationApiController::class, 'getTranslations']);
    Route::post('translations', [LocalizationApiController::class, 'updateTranslations']);
    Route::get('translations/{locale}/{group}', [LocalizationApiController::class, 'getTranslationGroup']);
    Route::post('translations/{locale}/{group}', [LocalizationApiController::class, 'updateTranslationGroup']);

    // Locale management
    Route::get('locales', [LocalizationApiController::class, 'getAvailableLocales']);
    Route::get('locales/current', [LocalizationApiController::class, 'getCurrentLocale']);
    Route::post('locales/current', [LocalizationApiController::class, 'setCurrentLocale']);

    // Application interface language
    Route::get('languages', [LocalizationApiController::class, 'getLanguages']);
    Route::get('languages/{language}', [LocalizationApiController::class, 'getLanguage']);
    Route::post('languages', [LocalizationApiController::class, 'addLanguage']);
    Route::put('languages/{language}', [LocalizationApiController::class, 'updateLanguage']);
    Route::delete('languages/{language}', [LocalizationApiController::class, 'removeLanguage']);
});

