<?php

use Illuminate\Support\Facades\Route;
use Modules\PayrollManagement\Http\Controllers\PayrollController;
use Modules\PayrollManagement\Http\Controllers\SalaryAdvanceController;
use Modules\PayrollManagement\Http\Controllers\FinalSettlementController;
use Modules\PayrollManagement\Http\Controllers\ComplianceReportController;
use Modules\PayrollManagement\Http\Controllers\PerformanceReviewController;
use Modules\PayrollManagement\Http\Controllers\PerformanceBenchmarkController;
use Modules\PayrollManagement\Http\Controllers\LoanController;

/*
|--------------------------------------------------------------------------
| Payroll API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your payroll module.
|
*/

// Payroll Routes
Route::prefix('payroll')
    ->name('payroll.')
    ->middleware('auth:sanctum')
    ->group(function () {
        // Payroll listing and management
        Route::get('/', [PayrollController::class, 'index'])
            ->middleware('permission:payroll.view')
            ->name('payroll.api.index');
        Route::post('/', [PayrollController::class, 'store'])
            ->middleware('permission:payroll.create')
            ->name('payroll.api.store');
        Route::get('/{payroll}', [PayrollController::class, 'show'])
            ->middleware('permission:payroll.view')
            ->name('payroll.api.show');

        // Payroll actions
        Route::post('/{payroll}/approve', [PayrollController::class, 'approve'])
            ->middleware('permission:payroll.edit')
            ->name('payroll.api.approve');
        Route::post('/{payroll}/process-payment', [PayrollController::class, 'processPayment'])
            ->middleware('permission:payroll.edit')
            ->name('payroll.api.process-payment');
        Route::post('/{payroll}/cancel', [PayrollController::class, 'cancel'])
            ->middleware('permission:payroll.edit')
            ->name('payroll.api.cancel');

        // Bulk payroll operations
        Route::post('/generate-monthly', [PayrollController::class, 'generateMonthlyPayroll'])
            ->middleware('permission:payroll.create')
            ->name('payroll.api.generate-monthly');

        // Payroll runs
        Route::prefix('runs')->name('runs.')->group(function () {
            Route::get('/{payrollRun}', [PayrollController::class, 'showPayrollRun'])
                ->middleware('permission:payroll.view')
                ->name('payroll.api.runs.show');
            Route::post('/{payrollRun}/approve', [PayrollController::class, 'approvePayrollRun'])
                ->middleware('permission:payroll.edit')
                ->name('payroll.api.runs.approve');
            Route::post('/{payrollRun}/reject', [PayrollController::class, 'rejectPayrollRun'])
                ->middleware('permission:payroll.edit')
                ->name('payroll.api.runs.reject');
        });

        Route::post('/export-bank-file', [PayrollController::class, 'exportBankFile'])
            ->middleware('permission:payroll.view')
            ->name('export-bank-file');

        Route::get('/{payroll}/payslip', [PayrollController::class, 'downloadPayslip'])
            ->middleware('permission:payroll.view')
            ->name('download-payslip');

        Route::get('/compliance-report', [ComplianceReportController::class, 'index'])
            ->middleware('permission:payroll.view')
            ->name('compliance-report');
    });

// Salary Advance API Routes
Route::prefix('salary-advances')
    ->name('salary-advances.')
    ->middleware('auth:sanctum')
    ->group(function() {
        Route::get('/', [SalaryAdvanceController::class, 'index'])
            ->middleware('permission:salary-advances.view')
            ->name('salary-advances.index');
        Route::post('/', [SalaryAdvanceController::class, 'store'])
            ->middleware('permission:salary-advances.create')
            ->name('salary-advances.api.store');
        Route::get('/{salaryAdvance}', [SalaryAdvanceController::class, 'show'])
            ->middleware('permission:salary-advances.view')
            ->name('salary-advances.api.show');
        Route::post('/{salaryAdvance}/approve', [SalaryAdvanceController::class, 'approve'])
            ->middleware('permission:salary-advances.edit')
            ->name('salary-advances.api.approve');
        Route::post('/{salaryAdvance}/reject', [SalaryAdvanceController::class, 'reject'])
            ->middleware('permission:salary-advances.edit')
            ->name('reject');
    });

// Final Settlement API Routes
Route::prefix('final-settlements')
    ->name('final-settlements.')
    ->middleware('auth:sanctum')
    ->group(function() {
        Route::get('/', [FinalSettlementController::class, 'index'])
            ->middleware('permission:final-settlements.view')
            ->name('final-settlements.index');
        Route::post('/', [FinalSettlementController::class, 'store'])
            ->middleware('permission:final-settlements.create')
            ->name('final-settlements.api.store');
        Route::get('/{finalSettlement}', [FinalSettlementController::class, 'show'])
            ->middleware('permission:final-settlements.view')
            ->name('final-settlements.api.show');
        Route::post('/{finalSettlement}/approve', [FinalSettlementController::class, 'approve'])
            ->middleware('permission:final-settlements.edit')
            ->name('final-settlements.api.approve');
        Route::post('/{finalSettlement}/process-payment', [FinalSettlementController::class, 'processPayment'])
            ->middleware('permission:final-settlements.edit')
            ->name('final-settlements.api.process-payment');
        Route::post('/{finalSettlement}/cancel', [FinalSettlementController::class, 'cancel'])
            ->middleware('permission:final-settlements.edit')
            ->name('final-settlements.api.cancel');
        Route::get('/{finalSettlement}/report', [FinalSettlementController::class, 'generateReport'])
            ->middleware('permission:final-settlements.view')
            ->name('report');
    });

// Performance Review API Routes
Route::prefix('performance-reviews')
    ->name('performance-reviews.')
    ->middleware('auth:sanctum')
    ->group(function() {
        Route::get('/', [PerformanceReviewController::class, 'index'])
            ->middleware('permission:performance-reviews.view')
            ->name('index');
        Route::post('/', [PerformanceReviewController::class, 'store'])
            ->middleware('permission:performance-reviews.create')
            ->name('store');
        Route::get('/{id}', [PerformanceReviewController::class, 'show'])
            ->middleware('permission:performance-reviews.view')
            ->name('show');
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

// Performance Benchmark API Routes
Route::prefix('performance-benchmarks')
    ->name('performance-benchmarks.')
    ->middleware('auth:sanctum')
    ->group(function() {
        Route::get('/', [PerformanceBenchmarkController::class, 'index'])
            ->middleware('permission:performance-benchmarks.view')
            ->name('index');
        Route::post('/', [PerformanceBenchmarkController::class, 'store'])
            ->middleware('permission:performance-benchmarks.create')
            ->name('store');
        Route::get('/{benchmark}', [PerformanceBenchmarkController::class, 'show'])
            ->middleware('permission:performance-benchmarks.view')
            ->name('show');
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

// Loan Management API Routes
Route::prefix('loans')
    ->name('loans.')
    ->middleware('auth:sanctum')
    ->group(function() {
        Route::get('/', [LoanController::class, 'index'])
            ->middleware('permission:loans.view')
            ->name('index');
        Route::post('/', [LoanController::class, 'store'])
            ->middleware('permission:loans.create')
            ->name('store');
        Route::get('/{loan}', [LoanController::class, 'show'])
            ->middleware('permission:loans.view')
            ->name('show');
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
