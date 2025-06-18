<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Modules\LeaveManagement\Http\Controllers\LeaveRequestController;
use Modules\LeaveManagement\Http\Controllers\LeaveApprovalController;
use Modules\LeaveManagement\Http\Controllers\LeaveBalanceController;
use Modules\LeaveManagement\Http\Controllers\LeaveTypeController;
use Modules\LeaveManagement\Http\Controllers\LeaveController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// API routes uncommented

Route::middleware('auth:sanctum')->group(function () {
    // Leave Requests API
    Route::get('/requests', [LeaveRequestController::class, 'apiIndex']);
    Route::post('/requests', [LeaveRequestController::class, 'apiStore']);
    Route::get('/requests/{id}', [LeaveRequestController::class, 'apiShow']);
    Route::put('/requests/{id}', [LeaveRequestController::class, 'apiUpdate']);
    Route::delete('/requests/{id}', [LeaveRequestController::class, 'apiDestroy']);

    // Leave Approval API
    Route::put('/requests/{id}/approve', [LeaveApprovalController::class, 'apiApprove']);
    Route::put('/requests/{id}/reject', [LeaveApprovalController::class, 'apiReject']);

    // Leave Balances API
    Route::get('/balances', [LeaveBalanceController::class, 'apiIndex']);
    Route::get('/balances/{employeeId}', [LeaveBalanceController::class, 'apiShow']);

    // Leave Types API
    Route::get('/types', [LeaveTypeController::class, 'apiIndex']);

    // Leave Calendar API
    Route::get('/calendar', [LeaveController::class, 'apiCalendar']);
    Route::get('/calendar/{year}/{month}', [LeaveController::class, 'apiCalendarMonth']);
});

