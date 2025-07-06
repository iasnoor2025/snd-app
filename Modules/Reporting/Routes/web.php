<?php

use Modules\Reporting\Http\Controllers\ReportController;
use Modules\Reporting\Http\Controllers\ReportBuilderController;
use Illuminate\Support\Facades\Route;

// Reports Routes
Route::middleware(['web', 'auth', 'verified'])->prefix('reporting')->name('reporting.')->group(function () {
    // Main Dashboard
    Route::get('/', [ReportController::class, 'index'])
        ->middleware('permission:reports.view')
        ->name('index');
    Route::get('/dashboard', [ReportController::class, 'dashboard'])
        ->middleware('permission:reports.view')
        ->name('dashboard');

    // Export Routes
    Route::post('/export-dashboard', [ReportController::class, 'exportDashboard'])
        ->middleware('permission:reports.export')
        ->name('export-dashboard');
    Route::post('/builder/export', [ReportController::class, 'exportCustomReport'])
        ->middleware('permission:reports.export')
        ->name('builder.export');

    // Module-specific Reports
    Route::prefix('modules')->name('modules.')->middleware('permission:reports.view')->group(function () {
        Route::get('/clients', [ReportController::class, 'clients'])->name('clients');
        Route::get('/rentals', [ReportController::class, 'rentals'])->name('rentals');
        Route::get('/invoices', [ReportController::class, 'invoices'])->name('invoices');
        Route::get('/payments', [ReportController::class, 'payments'])->name('payments');
        Route::get('/equipment', [ReportController::class, 'equipment'])->name('equipment');
        Route::get('/leaves', [ReportController::class, 'leaves'])->name('leaves');
        Route::get('/revenue', [ReportController::class, 'revenue'])->name('revenue');
    });

    // Report Builder
    Route::prefix('builder')->name('builder.')->middleware('permission:reports.build')->group(function () {
        Route::get('/', [ReportBuilderController::class, 'index'])->name('index');
        Route::post('/generate', [ReportBuilderController::class, 'generate'])->name('generate');
        Route::post('/template', [ReportBuilderController::class, 'saveTemplate'])->name('template.save');
        Route::post('/schedule', [ReportBuilderController::class, 'scheduleReport'])->name('schedule');
        Route::post('/export', [ReportBuilderController::class, 'export'])->name('export');
    });

    // Report Templates
    Route::prefix('templates')->name('templates.')->middleware('permission:reports.view')->group(function () {
        Route::get('/', [ReportBuilderController::class, 'templates'])->name('index');
        Route::delete('/{template}', [ReportBuilderController::class, 'destroyTemplate'])
            ->middleware('permission:reports.delete')
            ->name('destroy');
    });

    // Scheduled Reports
    Route::prefix('scheduled')->name('scheduled.')->middleware('permission:reports.view')->group(function () {
        Route::get('/', [ReportBuilderController::class, 'scheduledReports'])->name('index');
        Route::delete('/{report}', [ReportBuilderController::class, 'destroyReport'])
            ->middleware('permission:reports.delete')
            ->name('destroy');
    });

    Route::get('/modules', function () {
        return inertia('Reports/Modules');
    })->name('modules');

    Route::get('/rentals', function () {
        return inertia('Reports/Rentals');
    })->name('rentals');

    Route::get('/equipment', function () {
        return inertia('Reports/Equipment');
    })->name('equipment');

    Route::get('/payroll', function () {
        return inertia('Reports/Payroll');
    })->name('payroll');

    Route::get('/timesheets', function () {
        return inertia('Reports/Timesheets');
    })->name('timesheets');

    Route::get('/projects', function () {
        return inertia('Reports/Projects');
    })->name('projects');

    Route::get('/leaves', function () {
        return inertia('Reports/Leaves');
    })->name('leaves');

    Route::get('/customers', function () {
        return inertia('Reports/Customers');
    })->name('customers');

    Route::get('/audit', function () {
        return inertia('Reports/Audit');
    })->name('audit');

    Route::get('/revenue', function () {
        return inertia('Reports/Revenue');
    })->name('revenue');
});

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::get('/reporting', [ReportController::class, 'index'])->name('reporting.index');
//     Route::get('/reporting/export', [ReportController::class, 'export'])->name('reporting.export');
// });



