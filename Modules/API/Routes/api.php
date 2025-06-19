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
    Route::apiResource('employees', 'Modules\EmployeeManagement\Http\Controllers\Api\EmployeeController');

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
    Route::apiResource('timesheets', 'Modules\TimesheetManagement\Http\Controllers\Api\TimesheetController');

    // Payroll routes
    Route::apiResource('payrolls', 'Modules\Payroll\Http\Controllers\Api\PayrollController');
    Route::apiResource('advances', 'Modules\Payroll\Http\Controllers\Api\AdvanceController');
    Route::apiResource('settlements', 'Modules\Payroll\Http\Controllers\Api\SettlementController');

    // Project routes
    Route::apiResource('projects', 'Modules\ProjectManagement\Http\Controllers\Api\ProjectController');

    // Rental routes
    Route::apiResource('rentals', 'Modules\RentalManagement\Http\Controllers\Api\RentalController');

    // Equipment routes
    Route::apiResource('equipment', 'Modules\EquipmentManagement\Http\Controllers\Api\EquipmentController');

    // Settings routes
    Route::apiResource('settings', 'Modules\Settings\Http\Controllers\Api\SettingController');

    // Notification routes
    Route::apiResource('notifications', 'Modules\Notifications\Http\Controllers\Api\NotificationController');

    // Report routes
    Route::apiResource('reports', 'Modules\Reporting\Http\Controllers\API\ReportController');
});



