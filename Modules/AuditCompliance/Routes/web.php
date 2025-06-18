<?php

use Illuminate\Support\Facades\Route;
use Modules\AuditCompliance\Http\Controllers\AuditLogController;
use Modules\AuditCompliance\Http\Controllers\DataRetentionController;
use Modules\AuditCompliance\Http\Controllers\ComplianceReportController;
use Modules\AuditCompliance\Http\Controllers\GdprController;

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

Route::group(['middleware' => ['auth']], function () {
    // Audit Logs
    Route::resource('audit-compliance', AuditLogController::class)->names('auditcompliance');

    // Data Retention
    Route::prefix('audit-compliance/data-retention')->name('auditcompliance.data-retention.')->group(function () {
        Route::get('/', [DataRetentionController::class, 'index'])->name('index');
        Route::get('/create', [DataRetentionController::class, 'create'])->name('create');
        Route::post('/', [DataRetentionController::class, 'store'])->name('store');
        Route::get('/{policy}', [DataRetentionController::class, 'show'])->name('show');
        Route::get('/{policy}/edit', [DataRetentionController::class, 'edit'])->name('edit');
        Route::put('/{policy}', [DataRetentionController::class, 'update'])->name('update');
        Route::delete('/{policy}', [DataRetentionController::class, 'destroy'])->name('destroy');
        Route::post('/{policy}/execute', [DataRetentionController::class, 'execute'])->name('execute');
        Route::post('/execute-all', [DataRetentionController::class, 'executeAll'])->name('execute-all');
        Route::get('/stats/overview', [DataRetentionController::class, 'stats'])->name('stats');
    });

    // Compliance Reports
    Route::prefix('audit-compliance/reports')->name('auditcompliance.reports.')->group(function () {
        Route::get('/', [ComplianceReportController::class, 'index'])->name('index');
        Route::get('/create', [ComplianceReportController::class, 'create'])->name('create');
        Route::post('/', [ComplianceReportController::class, 'store'])->name('store');
        Route::get('/{report}', [ComplianceReportController::class, 'show'])->name('show');
        Route::delete('/{report}', [ComplianceReportController::class, 'destroy'])->name('destroy');
        Route::get('/{report}/download', [ComplianceReportController::class, 'download'])->name('download');
        Route::get('/{report}/export-csv', [ComplianceReportController::class, 'exportCsv'])->name('export-csv');
        Route::post('/quick-report', [ComplianceReportController::class, 'quickReport'])->name('quick-report');
        Route::get('/stats/overview', [ComplianceReportController::class, 'stats'])->name('stats');
    });

    // GDPR Management
    Route::prefix('audit-compliance/gdpr')->name('auditcompliance.gdpr.')->group(function () {
        Route::get('/', [GdprController::class, 'index'])->name('index');
        Route::get('/requests', [GdprController::class, 'requests'])->name('requests');
        Route::post('/requests', [GdprController::class, 'createRequest'])->name('requests.store');
        Route::get('/requests/{request}', [GdprController::class, 'showRequest'])->name('requests.show');
        Route::post('/requests/{request}/export', [GdprController::class, 'processExport'])->name('requests.export');
        Route::post('/requests/{request}/delete', [GdprController::class, 'processDeletion'])->name('requests.delete');
        Route::post('/requests/{request}/rectify', [GdprController::class, 'processRectification'])->name('requests.rectify');
        Route::post('/requests/{request}/assign', [GdprController::class, 'assignRequest'])->name('requests.assign');
        Route::post('/requests/{request}/reject', [GdprController::class, 'rejectRequest'])->name('requests.reject');
        Route::get('/requests/{request}/download', [GdprController::class, 'downloadExport'])->name('requests.download');

        Route::get('/consents', [GdprController::class, 'consents'])->name('consents');
        Route::post('/consents', [GdprController::class, 'recordConsent'])->name('consents.store');
        Route::post('/consents/withdraw', [GdprController::class, 'withdrawConsent'])->name('consents.withdraw');
        Route::get('/consents/history', [GdprController::class, 'consentHistory'])->name('consents.history');
    });
});

