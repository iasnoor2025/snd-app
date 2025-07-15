<?php

use Illuminate\Support\Facades\Route;
use Modules\PayrollManagement\Http\Controllers\PayrollController;
use Modules\PayrollManagement\Http\Controllers\SalaryAdvanceController;
use Modules\PayrollManagement\Http\Controllers\FinalSettlementController;
use Modules\PayrollManagement\Http\Controllers\ComplianceReportController;

/*
|--------------------------------------------------------------------------
| Payroll API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your payroll module.
|
*/

// API routes uncommented

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

        Route::post('/export-bank-file', [PayrollController::class, 'exportBankFile'])->middleware('permission:payroll.view')->name('export-bank-file');

        Route::get('/{payroll}/payslip', [PayrollController::class, 'downloadPayslip'])->middleware('permission:payroll.view')->name('download-payslip');

        Route::get('/compliance-report', [ComplianceReportController::class, 'index'])->middleware('permission:payroll.view')->name('compliance-report');
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



