<?php

use Illuminate\Support\Facades\Route;
use Modules\EmployeeManagement\Http\Controllers\Api\EmployeeController;
use Modules\EmployeeManagement\Http\Controllers\Api\TimesheetController;
use Modules\EmployeeManagement\Http\Controllers\DepartmentController;
use Modules\EmployeeManagement\Http\Controllers\PositionController;
use Modules\EmployeeManagement\Http\Controllers\EmployeeDocumentController;
use Modules\EmployeeManagement\Http\Controllers\EmployeeAdvanceController;
use Modules\EmployeeManagement\Http\Controllers\ResignationController;
use Modules\EmployeeManagement\Http\Controllers\SalaryIncrementController;
use Illuminate\Http\Request;
use Modules\EmployeeManagement\Http\Controllers\EmployeeNumberController;
use Modules\EmployeeManagement\Http\Controllers\TestController;

// Public route for last-file-number (no auth middleware)
Route::prefix('v1')->group(function () {
    Route::get('employees/last-file-number', [EmployeeController::class, 'getNextFileNumber']);
    Route::apiResource('positions', PositionController::class);
});

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    // Employee core routes
    Route::apiResource('employees', EmployeeController::class);
    Route::get('employees/{employee}/documents', [EmployeeController::class, 'documents']);
    Route::get('employees/{employee}/timesheets', [EmployeeController::class, 'timesheets']);
    Route::get('employees/{employee}/advances', [EmployeeController::class, 'advances']);

    // Timesheet routes
    Route::apiResource('timesheets', TimesheetController::class);
    Route::post('timesheets/{timesheet}/approve', [TimesheetController::class, 'approve']);
    Route::post('timesheets/{timesheet}/reject', [TimesheetController::class, 'reject']);

    // Department routes
    Route::apiResource('departments', DepartmentController::class)->only(['index', 'show']);

    // Position routes
    Route::apiResource('positions', PositionController::class)->only(['index', 'show']);

    // Document management
    Route::apiResource('employee-documents', EmployeeDocumentController::class);
    Route::post('employee-documents/{document}/download', [EmployeeDocumentController::class, 'download']);

    // Employee advances
    Route::apiResource('employee-advances', EmployeeAdvanceController::class);

    // Resignations
    Route::apiResource('resignations', ResignationController::class);
    Route::post('resignations/{resignation}/approve', [ResignationController::class, 'approve']);
    Route::post('resignations/{resignation}/reject', [ResignationController::class, 'reject']);

    // Salary Increments
    Route::apiResource('salary-increments', SalaryIncrementController::class);
    Route::post('salary-increments/{salaryIncrement}/approve', [SalaryIncrementController::class, 'approve']);
    Route::post('salary-increments/{salaryIncrement}/reject', [SalaryIncrementController::class, 'reject']);
    Route::post('salary-increments/{salaryIncrement}/apply', [SalaryIncrementController::class, 'apply']);
    Route::get('salary-increments/statistics/overview', [SalaryIncrementController::class, 'statistics']);
    Route::get('employees/{employee}/salary-increments', [SalaryIncrementController::class, 'getEmployeeSalaryHistory']);
});

// Public API endpoints - no authentication required
Route::prefix('v1/positions')->group(function() {
    Route::get('/', [PositionController::class, 'publicIndex']);
    Route::get('/simple', [PositionController::class, 'simplePositions']);
    Route::post('/', [PositionController::class, 'store']);
    Route::put('/{position}', [PositionController::class, 'update']);
    Route::delete('/{position}', [PositionController::class, 'destroy']);
});

// Other public API endpoints
Route::get('/employee-numbers/next', [EmployeeNumberController::class, 'getNextEmployeeNumber']);
Route::post('/test/position', [TestController::class, 'testCreatePosition']);

// Authenticated API endpoints
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

