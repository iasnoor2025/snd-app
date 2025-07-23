<?php

use Illuminate\Support\Facades\Route;
use Modules\CompanyManagement\Http\Controllers\CompanyController;

Route::middleware(['web', 'auth', 'can:update,Modules\\CompanyManagement\\Models\\Company'])
    ->prefix('company-management')
    ->name('company-management.')
    ->group(function () {
        Route::get('settings', [CompanyController::class, 'index'])->name('settings');
        Route::post('settings', [CompanyController::class, 'update'])->name('settings.update');
        Route::post('legal-document', [CompanyController::class, 'uploadLegalDocument'])->name('legal.upload');
        Route::get('legal-document/download', [CompanyController::class, 'downloadLegalDocument'])->name('legal.download');
    });
