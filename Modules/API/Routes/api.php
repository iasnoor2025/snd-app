<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the APIServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::group(['prefix' => 'v1'], function () {
    // Employee routes
    Route::apiResource('employees', 'Modules\EmployeeManagement\Http\Controllers\Api\EmployeeController', [
        'names' => [
            'index' => 'api.employees.index',
            'store' => 'api.employees.store',
            'show' => 'api.employees.show',
            'update' => 'api.employees.update',
            'destroy' => 'api.employees.destroy',
        ]
    ]);

    // Leave routes
    Route::apiResource('leaves', 'Modules\LeaveManagement\Http\Controllers\LeaveController', [
        'names' => [
            'index' => 'api.leaves.index',
            'store' => 'api.leaves.store',
            'show' => 'api.leaves.show',
            'update' => 'api.leaves.update',
            'destroy' => 'api.leaves.destroy',
        ]
    ]);

    // Timesheet routes
    Route::apiResource('timesheets', 'Modules\TimesheetManagement\Http\Controllers\Api\TimesheetController', [
        'names' => [
            'index' => 'api.timesheets.index',
            'store' => 'api.timesheets.store',
            'show' => 'api.timesheets.show',
            'update' => 'api.timesheets.update',
            'destroy' => 'api.timesheets.destroy',
        ]
    ]);

    // Payroll routes
    Route::apiResource('payrolls', 'Modules\Payroll\Http\Controllers\Api\PayrollController', [
        'names' => [
            'index' => 'api.payrolls.index',
            'store' => 'api.payrolls.store',
            'show' => 'api.payrolls.show',
            'update' => 'api.payrolls.update',
            'destroy' => 'api.payrolls.destroy',
        ]
    ]);
    Route::apiResource('advances', 'Modules\Payroll\Http\Controllers\Api\AdvanceController', [
        'names' => [
            'index' => 'api.advances.index',
            'store' => 'api.advances.store',
            'show' => 'api.advances.show',
            'update' => 'api.advances.update',
            'destroy' => 'api.advances.destroy',
        ]
    ]);
    Route::apiResource('settlements', 'Modules\Payroll\Http\Controllers\Api\SettlementController', [
        'names' => [
            'index' => 'api.settlements.index',
            'store' => 'api.settlements.store',
            'show' => 'api.settlements.show',
            'update' => 'api.settlements.update',
            'destroy' => 'api.settlements.destroy',
        ]
    ]);

    // Project routes (Use ProjectManagement module API routes instead)
    // Route::apiResource('projects', 'Modules\ProjectManagement\Http\Controllers\Api\ProjectController');

    // Rental routes
    Route::apiResource('rentals', 'Modules\RentalManagement\Http\Controllers\Api\RentalController', [
        'names' => [
            'index' => 'api.rentals.index',
            'store' => 'api.rentals.store',
            'show' => 'api.rentals.show',
            'update' => 'api.rentals.update',
            'destroy' => 'api.rentals.destroy',
        ]
    ]);

    // Equipment routes (Handled by EquipmentManagement module API routes)
    // Route::apiResource('equipment', 'Modules\EquipmentManagement\Http\Controllers\Api\EquipmentController');

    // Settings routes (Handled by web routes in API module)
    // Route::apiResource('settings', 'Modules\Settings\Http\Controllers\Api\SettingController');

    // Notification routes
    Route::apiResource('notifications', 'Modules\Notifications\Http\Controllers\Api\NotificationController', [
        'names' => [
            'index' => 'api.notifications.index',
            'store' => 'api.notifications.store',
            'show' => 'api.notifications.show',
            'update' => 'api.notifications.update',
            'destroy' => 'api.notifications.destroy',
        ]
    ]);

    // Report routes (Use Reporting module API routes instead)
    // Route::apiResource('reports', 'Modules\Reporting\Http\Controllers\ReportController');
});



