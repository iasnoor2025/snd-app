<?php

use Illuminate\Support\Facades\Route;
use Modules\PayrollManagement\Http\Controllers\PayrollController;
use Modules\PayrollManagement\Http\Controllers\SalaryAdvanceController;
use Modules\PayrollManagement\Http\Controllers\FinalSettlementController;
use Modules\PayrollManagement\Http\Controllers\TaxDocumentationController;
use Modules\PayrollManagement\Http\Controllers\PerformanceReviewController;
use Modules\PayrollManagement\Http\Controllers\PerformanceBenchmarkController;
use Modules\PayrollManagement\Http\Controllers\LoanController;

/*
|--------------------------------------------------------------------------
| Payroll Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your payroll module.
|
*/

Route::prefix('hr/payroll')->name('payroll.')->middleware('auth')->group(function () {
    // Payroll listing and management
    Route::get('/', [PayrollController::class, 'index'])
        ->middleware('permission:payroll.view')
        ->name('index');
    Route::get('/create', [PayrollController::class, 'create'])
        ->middleware('permission:payroll.create')
        ->name('create');
    Route::post('/', [PayrollController::class, 'store'])
        ->middleware('permission:payroll.create')
        ->name('store');
    Route::get('/{payroll}', [PayrollController::class, 'show'])
        ->where('payroll', '[0-9]+')
        ->middleware('permission:payroll.view')
        ->name('show');
    Route::get('/{payroll}/edit', [PayrollController::class, 'edit'])
        ->where('payroll', '[0-9]+')
        ->middleware('permission:payroll.edit')
        ->name('edit');
    Route::put('/{payroll}', [PayrollController::class, 'update'])
        ->where('payroll', '[0-9]+')
        ->middleware('permission:payroll.edit')
        ->name('update');
    Route::post('/{payroll}/approve', [PayrollController::class, 'approve'])
        ->where('payroll', '[0-9]+')
        ->middleware('permission:payroll.edit')
        ->name('approve');
    Route::post('/{payroll}/process-payment', [PayrollController::class, 'processPayment'])
        ->where('payroll', '[0-9]+')
        ->middleware('permission:payroll.edit')
        ->name('process-payment');
    Route::post('/{payroll}/cancel', [PayrollController::class, 'cancel'])
        ->where('payroll', '[0-9]+')
        ->middleware('permission:payroll.edit')
        ->name('cancel');
    Route::post('/generate-monthly', [PayrollController::class, 'generateMonthlyPayroll'])
        ->middleware('permission:payroll.create')
        ->name('generate-monthly');
    Route::post('/generate-payroll', [PayrollController::class, 'generatePayrollForApprovedTimesheets'])
        ->middleware('permission:payroll.create')
        ->name('generate-payroll');
    Route::post('/generate-all-months', [PayrollController::class, 'generatePayrollForAllMonths'])
        ->middleware('permission:payroll.create')
        ->name('generate-all-months');
    Route::get('/months-needing-payroll', [PayrollController::class, 'getMonthsNeedingPayroll'])
        ->middleware('permission:payroll.view')
        ->name('months-needing-payroll');
    Route::post('/generate', [PayrollController::class, 'store'])
        ->middleware('permission:payroll.create')
        ->name('generate');
    Route::post('/bulk-delete', [PayrollController::class, 'bulkDelete'])
        ->middleware('permission:payroll.delete')
        ->name('bulk-delete');
    Route::get('/{payroll}/payslip', [PayrollController::class, 'downloadPayslip'])
        ->where('payroll', '[0-9]+')
        ->middleware('permission:payroll.view')
        ->name('payslip');
    Route::get('/{payroll}/payslip/view', [PayrollController::class, 'viewPayslip'])
        ->where('payroll', '[0-9]+')
        ->middleware('permission:payroll.view')
        ->name('payslip.view');
    Route::prefix('runs')->name('runs.')->group(function () {
        Route::get('/{payrollRun}', [PayrollController::class, 'showPayrollRun'])
            ->where('payrollRun', '[0-9]+')
            ->middleware('permission:payroll.view')
            ->name('show');
        Route::post('/{payrollRun}/approve', [PayrollController::class, 'approvePayrollRun'])
            ->where('payrollRun', '[0-9]+')
            ->middleware('permission:payroll.edit')
            ->name('approve');
        Route::post('/{payrollRun}/reject', [PayrollController::class, 'rejectPayrollRun'])
            ->where('payrollRun', '[0-9]+')
            ->middleware('permission:payroll.edit')
            ->name('reject');
    });
    // Salary Advance routes
    Route::resource('salary-advances', SalaryAdvanceController::class)->middleware([
        'permission:salary-advances.view',
    ]);
    Route::post('salary-advances/{salaryAdvance}/approve', [SalaryAdvanceController::class, 'approve'])
        ->middleware('permission:salary-advances.edit')
        ->name('salary-advances.approve');
    Route::post('salary-advances/{salaryAdvance}/reject', [SalaryAdvanceController::class, 'reject'])
        ->middleware('permission:salary-advances.edit')
        ->name('salary-advances.reject');

    // Tax Documentation routes
    Route::prefix('tax-documentation')->name('tax-documentation.')->group(function () {
        Route::get('/', [TaxDocumentationController::class, 'index'])
            ->middleware('permission:tax-documentation.view')
            ->name('tax-documentation.index');
        Route::get('/{taxDocument}', [TaxDocumentationController::class, 'show'])
            ->middleware('permission:tax-documentation.view')
            ->name('show');
        Route::post('/generate', [TaxDocumentationController::class, 'generate'])
            ->middleware('permission:tax-documentation.create')
            ->name('generate');
        Route::post('/bulk-generate', [TaxDocumentationController::class, 'bulkGenerate'])
            ->middleware('permission:tax-documentation.create')
            ->name('bulk-generate');
        Route::get('/{taxDocument}/download', [TaxDocumentationController::class, 'download'])
            ->middleware('permission:tax-documentation.view')
            ->name('download');
        Route::get('/export/excel', [TaxDocumentationController::class, 'exportExcel'])
            ->middleware('permission:tax-documentation.view')
            ->name('export.excel');
        Route::get('/summary/{year}', [TaxDocumentationController::class, 'summary'])
            ->middleware('permission:tax-documentation.view')
            ->name('summary');
    });

    // Final Settlement routes
    Route::prefix('final-settlements')->name('final-settlements.')->group(function () {
        Route::get('/', [FinalSettlementController::class, 'index'])
            ->middleware('permission:final-settlements.view')
            ->name('final-settlements.index');
        Route::get('/create', [FinalSettlementController::class, 'create'])
            ->middleware('permission:final-settlements.create')
            ->name('create');
        Route::post('/', [FinalSettlementController::class, 'store'])
            ->middleware('permission:final-settlements.create')
            ->name('store');
        Route::get('/{finalSettlement}', [FinalSettlementController::class, 'show'])
            ->where('finalSettlement', '[0-9]+')
            ->middleware('permission:final-settlements.view')
            ->name('show');
        Route::post('/{finalSettlement}/approve', [FinalSettlementController::class, 'approve'])
            ->where('finalSettlement', '[0-9]+')
            ->middleware('permission:final-settlements.edit')
            ->name('approve');
        Route::post('/{finalSettlement}/mark-as-paid', [FinalSettlementController::class, 'processPayment'])
            ->where('finalSettlement', '[0-9]+')
            ->middleware('permission:final-settlements.edit')
            ->name('mark-as-paid');
        Route::post('/{finalSettlement}/cancel', [FinalSettlementController::class, 'cancel'])
            ->where('finalSettlement', '[0-9]+')
            ->middleware('permission:final-settlements.edit')
            ->name('cancel');
        Route::get('/{finalSettlement}/report', [FinalSettlementController::class, 'generateReport'])
            ->where('finalSettlement', '[0-9]+')
            ->middleware('permission:final-settlements.view')
            ->name('report');
        Route::get('/{finalSettlement}/pdf', [FinalSettlementController::class, 'generatePDF'])
            ->where('finalSettlement', '[0-9]+')
            ->middleware('permission:final-settlements.view')
            ->name('pdf');
    });

    // Performance Review routes
    Route::prefix('performance-reviews')->name('performance-reviews.')->group(function () {
        Route::get('/', [PerformanceReviewController::class, 'index'])
            ->middleware('permission:performance-reviews.view')
            ->name('index');
        Route::get('/create', [PerformanceReviewController::class, 'create'])
            ->middleware('permission:performance-reviews.create')
            ->name('create');
        Route::post('/', [PerformanceReviewController::class, 'store'])
            ->middleware('permission:performance-reviews.create')
            ->name('store');
        Route::get('/{id}', [PerformanceReviewController::class, 'show'])
            ->middleware('permission:performance-reviews.view')
            ->name('show');
        Route::get('/{id}/edit', [PerformanceReviewController::class, 'edit'])
            ->middleware('permission:performance-reviews.edit')
            ->name('edit');
        Route::put('/{id}', [PerformanceReviewController::class, 'update'])
            ->middleware('permission:performance-reviews.edit')
            ->name('update');
        Route::delete('/{id}', [PerformanceReviewController::class, 'destroy'])
            ->middleware('permission:performance-reviews.delete')
            ->name('destroy');
        Route::post('/{id}/approve', [PerformanceReviewController::class, 'approve'])
            ->middleware('permission:performance-reviews.edit')
            ->name('approve');
        Route::post('/{id}/reject', [PerformanceReviewController::class, 'reject'])
            ->middleware('permission:performance-reviews.edit')
            ->name('reject');
    });

    // Performance Benchmark routes
    Route::prefix('performance-benchmarks')->name('performance-benchmarks.')->group(function () {
        Route::get('/', [PerformanceBenchmarkController::class, 'index'])
            ->middleware('permission:performance-benchmarks.view')
            ->name('index');
        Route::get('/create', [PerformanceBenchmarkController::class, 'create'])
            ->middleware('permission:performance-benchmarks.create')
            ->name('create');
        Route::post('/', [PerformanceBenchmarkController::class, 'store'])
            ->middleware('permission:performance-benchmarks.create')
            ->name('store');
        Route::get('/{benchmark}', [PerformanceBenchmarkController::class, 'show'])
            ->middleware('permission:performance-benchmarks.view')
            ->name('show');
        Route::get('/{benchmark}/edit', [PerformanceBenchmarkController::class, 'edit'])
            ->middleware('permission:performance-benchmarks.edit')
            ->name('edit');
        Route::put('/{benchmark}', [PerformanceBenchmarkController::class, 'update'])
            ->middleware('permission:performance-benchmarks.edit')
            ->name('update');
        Route::delete('/{benchmark}', [PerformanceBenchmarkController::class, 'destroy'])
            ->middleware('permission:performance-benchmarks.delete')
            ->name('destroy');
        Route::post('/bulk-store', [PerformanceBenchmarkController::class, 'bulkStore'])
            ->middleware('permission:performance-benchmarks.create')
            ->name('bulk-store');
    });

    // Loan Management routes
    Route::prefix('loans')->name('loans.')->group(function () {
        Route::get('/', [LoanController::class, 'index'])
            ->middleware('permission:loans.view')
            ->name('index');
        Route::get('/create', [LoanController::class, 'create'])
            ->middleware('permission:loans.create')
            ->name('create');
        Route::post('/', [LoanController::class, 'store'])
            ->middleware('permission:loans.create')
            ->name('store');
        Route::get('/{loan}', [LoanController::class, 'show'])
            ->middleware('permission:loans.view')
            ->name('show');
        Route::get('/{loan}/edit', [LoanController::class, 'edit'])
            ->middleware('permission:loans.edit')
            ->name('edit');
        Route::put('/{loan}', [LoanController::class, 'update'])
            ->middleware('permission:loans.edit')
            ->name('update');
        Route::delete('/{loan}', [LoanController::class, 'destroy'])
            ->middleware('permission:loans.delete')
            ->name('destroy');
        Route::post('/{loan}/approve', [LoanController::class, 'approve'])
            ->middleware('permission:loans.edit')
            ->name('approve');
        Route::post('/{loan}/repay', [LoanController::class, 'repay'])
            ->middleware('permission:loans.edit')
            ->name('repay');
    });
});
