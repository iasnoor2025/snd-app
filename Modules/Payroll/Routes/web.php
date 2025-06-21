<?php

use Illuminate\Support\Facades\Route;
use Modules\Payroll\Http\Controllers\PayrollController;
use Modules\Payroll\Http\Controllers\SalaryAdvanceController;
use Modules\Payroll\Http\Controllers\FinalSettlementController;
use Modules\Payroll\Http\Controllers\AdvancePaymentController;
use Modules\Payroll\Http\Controllers\TaxDocumentationController;

/*
|--------------------------------------------------------------------------
| Payroll Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your payroll module.
|
*/

Route::prefix('hr/payroll')->name('payroll.')->middleware(['auth', 'verified'])->group(function () {
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
        ->middleware('permission:payroll.view')
        ->name('show');
    Route::post('/{payroll}/approve', [PayrollController::class, 'approve'])
        ->middleware('permission:payroll.edit')
        ->name('approve');
    Route::post('/{payroll}/process-payment', [PayrollController::class, 'processPayment'])
        ->middleware('permission:payroll.edit')
        ->name('process-payment');
    Route::post('/{payroll}/cancel', [PayrollController::class, 'cancel'])
        ->middleware('permission:payroll.edit')
        ->name('cancel');
    Route::post('/generate-monthly', [PayrollController::class, 'generateMonthlyPayroll'])
        ->middleware('permission:payroll.create')
        ->name('generate-monthly');
    Route::post('/generate', [PayrollController::class, 'store'])
        ->middleware('permission:payroll.create')
        ->name('generate');
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
            ->name('index');
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
            ->name('index');
        Route::get('/create', [FinalSettlementController::class, 'create'])
            ->middleware('permission:final-settlements.create')
            ->name('create');
        Route::post('/', [FinalSettlementController::class, 'store'])
            ->middleware('permission:final-settlements.create')
            ->name('store');
        Route::get('/{finalSettlement}', [FinalSettlementController::class, 'show'])
            ->middleware('permission:final-settlements.view')
            ->name('show');
        Route::post('/{finalSettlement}/approve', [FinalSettlementController::class, 'approve'])
            ->middleware('permission:final-settlements.edit')
            ->name('approve');
        Route::post('/{finalSettlement}/mark-as-paid', [FinalSettlementController::class, 'processPayment'])
            ->middleware('permission:final-settlements.edit')
            ->name('mark-as-paid');
        Route::post('/{finalSettlement}/cancel', [FinalSettlementController::class, 'cancel'])
            ->middleware('permission:final-settlements.edit')
            ->name('cancel');
        Route::get('/{finalSettlement}/report', [FinalSettlementController::class, 'generateReport'])
            ->middleware('permission:final-settlements.view')
            ->name('report');
        Route::get('/{finalSettlement}/pdf', [FinalSettlementController::class, 'generatePDF'])
            ->middleware('permission:final-settlements.view')
            ->name('pdf');
    });
    // Advance Payment Routes
    Route::prefix('employees/{employee}/advances')->group(function () {
        Route::get('/', [AdvancePaymentController::class, 'index'])
            ->middleware('permission:advances.view')
            ->name('employees.advances.index');
        Route::post('/', [AdvancePaymentController::class, 'store'])
            ->middleware('permission:advances.create')
            ->name('employees.advances.store');
        Route::get('/create', [AdvancePaymentController::class, 'create'])
            ->middleware('permission:advances.create')
            ->name('employees.advances.create');
        Route::get('/history', [AdvancePaymentController::class, 'paymentHistory'])
            ->middleware('permission:advances.view')
            ->name('employees.advances.payment-history');
        Route::get('/history/api', [AdvancePaymentController::class, 'apiPaymentHistory'])
            ->middleware('permission:advances.view')
            ->name('employees.advances.payment-history.api');
        Route::delete('/history/{payment}', [AdvancePaymentController::class, 'deletePaymentHistory'])
            ->middleware('permission:advances.delete')
            ->name('employees.advances.payment-history.delete');
        Route::patch('/monthly-deduction', [AdvancePaymentController::class, 'updateMonthlyDeduction'])
            ->middleware('permission:advances.edit')
            ->name('employees.advances.monthly-deduction');
        Route::get('/{advance}', [AdvancePaymentController::class, 'show'])
            ->middleware('permission:advances.view')
            ->name('employees.advances.show');
        Route::get('/{advance}/edit', [AdvancePaymentController::class, 'edit'])
            ->middleware('permission:advances.edit')
            ->name('employees.advances.edit');
        Route::patch('/{advance}', [AdvancePaymentController::class, 'update'])
            ->middleware('permission:advances.edit')
            ->name('employees.advances.update');
        Route::delete('/{advance}', [AdvancePaymentController::class, 'destroy'])
            ->middleware('permission:advances.delete')
            ->name('employees.advances.destroy');
        Route::post('/{advance}/repayment', [AdvancePaymentController::class, 'recordRepayment'])
            ->middleware('permission:advances.edit')
            ->name('employees.advances.repayment');
        Route::post('/{advance}/approve', [AdvancePaymentController::class, 'approve'])
            ->middleware('permission:advances.approve')
            ->name('employees.advances.approve');
        Route::post('/{advance}/reject', [AdvancePaymentController::class, 'reject'])
            ->middleware('permission:advances.approve')
            ->name('employees.advances.reject');
        Route::get('/payment/{payment}/receipt', [AdvancePaymentController::class, 'receipt'])
            ->middleware('permission:advances.view')
            ->name('employees.advances.payment.receipt');
    });
    // All Advance Payments Route
    Route::get('/advance-payments', [AdvancePaymentController::class, 'allAdvances'])
        ->middleware('permission:advances.view')
        ->name('advance-payments.index');
});



