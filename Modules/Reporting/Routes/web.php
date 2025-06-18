<?php

use Modules\Reporting\Http\Controllers\ReportController;
use Modules\Reporting\Http\Controllers\ReportBuilderController;
use Illuminate\Support\Facades\Route;

// Reports Routes
Route::middleware(['web', 'auth', 'verified', 'permission:reports.view'])->prefix('reports')->name('reports.')->group(function () {
    Route::get('/', [ReportController::class, 'index'])
        ->middleware('permission:reports.view')
        ->name('index');
    Route::get('/clients', [ReportController::class, 'clients'])
        ->middleware('permission:reports.view')
        ->name('clients');
    Route::get('/rentals', [ReportController::class, 'rentals'])
        ->middleware('permission:reports.view')
        ->name('rentals');
    Route::get('/invoices', [ReportController::class, 'invoices'])
        ->middleware('permission:reports.view')
        ->name('invoices');
    Route::get('/payments', [ReportController::class, 'payments'])
        ->middleware('permission:reports.view')
        ->name('payments');
    Route::get('/equipment', [ReportController::class, 'equipment'])
        ->middleware('permission:reports.view')
        ->name('equipment');
    Route::get('/revenue', [ReportController::class, 'revenue'])
        ->middleware('permission:reports.view')
        ->name('revenue');

    // Show individual report
    /*
    Route::get('/{report}', [ReportBuilderController::class, 'show'])->name('show');
    */

    // Report Builder
    Route::middleware(['permission:reports.build'])->group(function () {
        Route::get('/builder', [ReportBuilderController::class, 'index'])->name('builder');
        Route::post('/builder/generate', [ReportBuilderController::class, 'generate'])->name('builder.generate');
        Route::post('/builder/template', [ReportBuilderController::class, 'saveTemplate'])->name('builder.template');
        Route::post('/builder/schedule', [ReportBuilderController::class, 'scheduleReport'])->name('builder.schedule');
        Route::post('/builder/export', [ReportBuilderController::class, 'export'])->name('builder.export');

        // Report Templates
        Route::get('/templates', [ReportBuilderController::class, 'templates'])->name('templates');
        Route::delete('/templates/{template}', [ReportBuilderController::class, 'destroyTemplate'])
            ->middleware('permission:reports.delete')
            ->name('templates.destroy');

        // Scheduled Reports
        Route::get('/scheduled', [ReportBuilderController::class, 'scheduledReports'])->name('scheduled');
        Route::delete('/{report}', [ReportBuilderController::class, 'destroyReport'])
            ->middleware('permission:reports.delete')
            ->name('destroy');
    });

    Route::post('/export-dashboard', [ReportController::class, 'exportDashboard'])
        ->middleware('permission:reports.view')
        ->name('exportDashboard');
});



