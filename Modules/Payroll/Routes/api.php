<?php

use Illuminate\Support\Facades\Route;
use Modules\Payroll\Http\Controllers\PayrollController;
use Modules\Payroll\Http\Controllers\SalaryAdvanceController;
use Modules\Payroll\Http\Controllers\FinalSettlementController;
use Modules\Payroll\Http\Controllers\AdvancePaymentController;
use Modules\Payroll\Http\Controllers\ComplianceReportController;

/*
|--------------------------------------------------------------------------
| Payroll API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your payroll module.
|
*/

// API routes uncommented

Route::middleware(['auth:sanctum']).group(function () {
    // Payroll Routes
    Route::prefix('api/payroll')->name('api.payroll.')->group(function () {
        // Payroll listing and management
        Route::get('/', [PayrollController::class, 'index'])
            ->middleware('permission:payroll.view')
            ->name('index');
        Route::post('/', [PayrollController::class, 'store'])
            ->middleware('permission:payroll.create')
            ->name('store');
        Route::get('/{payroll}', [PayrollController::class, 'show'])
            ->middleware('permission:payroll.view')
            ->name('show');

        // Payroll actions
        Route::post('/{payroll}/approve', [PayrollController::class, 'approve'])
            ->middleware('permission:payroll.edit')
            ->name('approve');
        Route::post('/{payroll}/process-payment', [PayrollController::class, 'processPayment'])
            ->middleware('permission:payroll.edit')
            ->name('process-payment');
        Route::post('/{payroll}/cancel', [PayrollController::class, 'cancel'])
            ->middleware('permission:payroll.edit')
            ->name('cancel');

        // Bulk payroll operations
        Route::post('/generate-monthly', [PayrollController::class, 'generateMonthlyPayroll'])
            ->middleware('permission:payroll.create')
            ->name('generate-monthly');

        // Payroll runs
        Route::prefix('runs')->name('runs.')->group(function () {
            Route::get('/{payrollRun}', [PayrollController::class, 'showPayrollRun'])
                ->middleware('permission:payroll.view')
                ->name('show');
            Route::post('/{payrollRun}/approve', [PayrollController::class, 'approvePayrollRun'])
                ->middleware('permission:payroll.edit')
                ->name('approve');
            Route::post('/{payrollRun}/reject', [PayrollController::class, 'rejectPayrollRun'])
                ->middleware('permission:payroll.edit')
                ->name('reject');
        });

        Route::post('/export-bank-file', [PayrollController::class, 'exportBankFile'])->middleware('permission:payroll.view')->name('export-bank-file');

        Route::get('/{payroll}/payslip', [PayrollController::class, 'downloadPayslip'])->middleware('permission:payroll.view')->name('download-payslip');

        Route::get('/compliance-report', [ComplianceReportController::class, 'index'])->middleware('permission:payroll.view')->name('compliance-report');
    });

    // Salary Advance API Routes
    Route::prefix('api/salary-advances')->name('api.salary-advances.')->group(function() {
        Route::get('/', [SalaryAdvanceController::class, 'index'])
            ->middleware('permission:salary-advances.view')
            ->name('index');
        Route::post('/', [SalaryAdvanceController::class, 'store'])
            ->middleware('permission:salary-advances.create')
            ->name('store');
        Route::get('/{salaryAdvance}', [SalaryAdvanceController::class, 'show'])
            ->middleware('permission:salary-advances.view')
            ->name('show');
        Route::post('/{salaryAdvance}/approve', [SalaryAdvanceController::class, 'approve'])
            ->middleware('permission:salary-advances.edit')
            ->name('approve');
        Route::post('/{salaryAdvance}/reject', [SalaryAdvanceController::class, 'reject'])
            ->middleware('permission:salary-advances.edit')
            ->name('reject');
    });

    // Final Settlement API Routes
    Route::prefix('api/final-settlements')->name('api.final-settlements.')->group(function() {
        Route::get('/', [FinalSettlementController::class, 'index'])
            ->middleware('permission:final-settlements.view')
            ->name('index');
        Route::post('/', [FinalSettlementController::class, 'store'])
            ->middleware('permission:final-settlements.create')
            ->name('store');
        Route::get('/{finalSettlement}', [FinalSettlementController::class, 'show'])
            ->middleware('permission:final-settlements.view')
            ->name('show');
        Route::post('/{finalSettlement}/approve', [FinalSettlementController::class, 'approve'])
            ->middleware('permission:final-settlements.edit')
            ->name('approve');
        Route::post('/{finalSettlement}/process-payment', [FinalSettlementController::class, 'processPayment'])
            ->middleware('permission:final-settlements.edit')
            ->name('process-payment');
        Route::post('/{finalSettlement}/cancel', [FinalSettlementController::class, 'cancel'])
            ->middleware('permission:final-settlements.edit')
            ->name('cancel');
        Route::get('/{finalSettlement}/report', [FinalSettlementController::class, 'generateReport'])
            ->middleware('permission:final-settlements.view')
            ->name('report');
    });

    // Advance Payment API Routes
    Route::get('/employees/{employee}/advance-payments/history', [AdvancePaymentController::class, 'apiPaymentHistory'])
        ->middleware('permission:advances.view')
        ->name('api.employees.advance-payments.history');

    Route::get('/employees/{employee}/advance-payments', [AdvancePaymentController::class, 'getEmployeeAdvances'])
        ->middleware('permission:advances.view')
        ->name('api.employees.advance-payments');
});



