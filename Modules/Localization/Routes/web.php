<?php

use Modules\Localization\Http\Controllers\LocalizationController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::prefix('localization')->middleware(['auth', 'verified'])->group(function () {
    // Main dashboard
    Route::get('/', [LocalizationController::class, 'index'])->name('localization.index');

    // Translation management routes
    Route::get('/translations', [LocalizationController::class, 'index'])->name('translations.index');
    Route::get('/translations/create', [LocalizationController::class, 'create'])->name('translations.create');
    Route::post('/translations', [LocalizationController::class, 'store'])->name('translations.store');
    Route::get('/translations/{locale}/{group}/edit', [LocalizationController::class, 'edit'])->name('translations.edit');
    Route::put('/translations/{locale}/{group}', [LocalizationController::class, 'update'])->name('translations.update');
    Route::delete('/translations/{locale}/{group}/{key}', [LocalizationController::class, 'destroy'])->name('translations.destroy');

    // Import/Export routes
    Route::post('/translations/import', [LocalizationController::class, 'import'])->name('translations.import');
    Route::get('/translations/export/{locale?}', [LocalizationController::class, 'export'])->name('translations.export');

    // Utility routes
    Route::post('/translations/scan', [LocalizationController::class, 'scanTranslations'])->name('translations.scan');
    Route::post('/translations/clear-cache', [LocalizationController::class, 'clearCache'])->name('translations.clear-cache');

    // Model translation routes (Spatie Translatable)
    Route::prefix('model-translations')->name('model-translations.')->group(function () {
        Route::get('/statistics', [\Modules\Localization\Http\Controllers\ModelTranslationController::class, 'getStatistics'])->name('statistics');
        Route::get('/models', [\Modules\Localization\Http\Controllers\ModelTranslationController::class, 'getModels'])->name('models');
        Route::get('/missing', [\Modules\Localization\Http\Controllers\ModelTranslationController::class, 'getMissingTranslations'])->name('missing');
        Route::get('/completion', [\Modules\Localization\Http\Controllers\ModelTranslationController::class, 'getCompletion'])->name('completion');
        Route::post('/copy', [\Modules\Localization\Http\Controllers\ModelTranslationController::class, 'copyTranslations'])->name('copy');
        Route::get('/export', [\Modules\Localization\Http\Controllers\ModelTranslationController::class, 'exportTranslations'])->name('export');
        Route::post('/import', [\Modules\Localization\Http\Controllers\ModelTranslationController::class, 'importTranslations'])->name('import');
        Route::post('/cleanup', [\Modules\Localization\Http\Controllers\ModelTranslationController::class, 'cleanupTranslations'])->name('cleanup');
    });

    // Locale management
    Route::get('/locales', [LocalizationController::class, 'locales'])->name('localization.locales');
    Route::post('/locales', [LocalizationController::class, 'storeLocale'])->name('localization.locales.store');
    Route::delete('/locales/{locale}', [LocalizationController::class, 'destroyLocale'])->name('localization.locales.destroy');
    Route::post('/switch-locale/{locale}', [LocalizationController::class, 'switchLocale'])->name('localization.switch');

    // Language management
    Route::get('/languages', [LocalizationController::class, 'languages'])->name('localization.languages');
    Route::post('/languages', [LocalizationController::class, 'storeLanguage'])->name('localization.languages.store');
    Route::put('/languages/{language}', [LocalizationController::class, 'updateLanguage'])->name('localization.languages.update');
    Route::delete('/languages/{language}', [LocalizationController::class, 'destroyLanguage'])->name('localization.languages.destroy');
});



