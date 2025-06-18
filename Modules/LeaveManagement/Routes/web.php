<?php

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

use Illuminate\Support\Facades\Route;
use Modules\LeaveManagement\Http\Controllers\LeaveController;
use Modules\LeaveManagement\Http\Controllers\LeaveRequestController;
use Modules\LeaveManagement\Http\Controllers\LeaveApprovalController;
use Modules\LeaveManagement\Http\Controllers\LeaveBalanceController;
use Modules\LeaveManagement\Http\Controllers\LeaveTypeController;
use Modules\LeaveManagement\Http\Controllers\LeaveReportController;
use Modules\LeaveManagement\Http\Controllers\LeaveSettingController;

Route::prefix('leaves')->name('leaves.')->middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/', [LeaveController::class, 'index'])
        ->middleware('permission:leave-requests.view')
        ->name('index');

    // Leave Requests (CRUD)
    Route::get('requests', [LeaveRequestController::class, 'index'])
        ->middleware('permission:leave-requests.view')
        ->name('requests.index');
    Route::get('requests/create', [LeaveRequestController::class, 'create'])
        ->middleware('permission:leave-requests.create')
        ->name('requests.create');
    Route::post('requests', [LeaveRequestController::class, 'store'])
        ->middleware('permission:leave-requests.create')
        ->name('requests.store');
    Route::get('requests/{request}', [LeaveRequestController::class, 'show'])
        ->middleware('permission:leave-requests.view')
        ->name('requests.show');
    Route::get('requests/{request}/edit', [LeaveRequestController::class, 'edit'])
        ->middleware('permission:leave-requests.edit')
        ->name('requests.edit');
    Route::put('requests/{request}', [LeaveRequestController::class, 'update'])
        ->middleware('permission:leave-requests.edit')
        ->name('requests.update');
    Route::delete('requests/{request}', [LeaveRequestController::class, 'destroy'])
        ->middleware('permission:leave-requests.delete')
        ->name('requests.destroy');

    // Leave Approval
    Route::get('/approvals', [LeaveApprovalController::class, 'index'])
        ->middleware('permission:leave-approvals.view')
        ->name('approvals.index');
    Route::put('/approvals/{leaveRequest}/approve', [LeaveApprovalController::class, 'approve'])
        ->middleware('permission:leave-approvals.edit')
        ->name('approvals.approve');
    Route::put('/approvals/{leaveRequest}/reject', [LeaveApprovalController::class, 'reject'])
        ->middleware('permission:leave-approvals.edit')
        ->name('approvals.reject');

    // Leave Balances
    Route::get('balances', [LeaveBalanceController::class, 'index'])
        ->middleware('permission:leave-balances.view')
        ->name('balances.index');
    Route::get('balances/{employee}', [LeaveBalanceController::class, 'show'])
        ->middleware('permission:leave-balances.view')
        ->name('balances.show');
    Route::get('balances/summary/api', [LeaveBalanceController::class, 'summary'])
        ->middleware('permission:leave-balances.view')
        ->name('balances.summary');

    // Leave Types
    Route::resource('types', LeaveTypeController::class)
        ->middleware('permission:leave-types.view,leave-types.create,leave-types.edit,leave-types.delete')
        ->names([
            'index' => 'types.index',
            'create' => 'types.create',
            'store' => 'types.store',
            'show' => 'types.show',
            'edit' => 'types.edit',
            'update' => 'types.update',
            'destroy' => 'types.destroy',
        ]);

    Route::post('types/{leaveType}/toggle-status', [LeaveTypeController::class, 'toggleStatus'])
        ->middleware('permission:leave-types.edit')
        ->name('types.toggle-status');

    // Reports
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [LeaveReportController::class, 'index'])->name('index')->middleware('permission:leave-reports.view');
        Route::get('/export', [LeaveReportController::class, 'export'])->name('export')->middleware('permission:leave-reports.export');
    });

    // Leave Settings
    Route::get('/settings', [LeaveSettingController::class, 'index'])
        ->name('settings.index')
        ->middleware('permission:leave-settings.view');
    Route::put('/settings', [LeaveSettingController::class, 'update'])
        ->name('settings.update')
        ->middleware('permission:leave-settings.edit');
    Route::put('/settings/reset', [LeaveSettingController::class, 'reset'])
        ->name('settings.reset')
        ->middleware('permission:leave-settings.edit');
    Route::get('/settings/export', [LeaveSettingController::class, 'export'])
        ->name('settings.export')
        ->middleware('permission:leave-settings.view');
    Route::post('/settings/import', [LeaveSettingController::class, 'import'])
        ->name('settings.import')
        ->middleware('permission:leave-settings.edit');
});

