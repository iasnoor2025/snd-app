<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Modules\TimesheetManagement\Http\Controllers\TimesheetController;
use Modules\TimesheetManagement\Http\Controllers\TimeEntryController;
// use Modules\TimesheetManagement\Http\Controllers\GeofenceController;
use Modules\TimesheetManagement\Http\Controllers\RealTimeDashboardController;
use Modules\TimesheetManagement\Http\Controllers\Api\CustomReportController;
use Modules\TimesheetManagement\Http\Controllers\Api\TimeOffRequestController;

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

Route::middleware('auth:sanctum')->group(function () {
    // Timesheet Management Routes
    Route::apiResource('timesheets', TimesheetController::class)->names([
        'index' => 'hr.api.timesheets.index',
        'store' => 'hr.api.timesheets.store',
        'show' => 'hr.api.timesheets.show',
        'update' => 'hr.api.timesheets.update',
        'destroy' => 'hr.api.timesheets.destroy'
    ]);
    Route::post('timesheets/bulk-upload', [TimesheetController::class, 'bulkUpload']);
    Route::get('timesheets/{timesheet}/approval-history', [TimesheetController::class, 'approvalHistory']);
    Route::post('timesheets/{timesheet}/approve', [TimesheetController::class, 'approve']);
    Route::post('timesheets/{timesheet}/reject', [TimesheetController::class, 'reject']);
    Route::get('timesheets/employee/{employee}/summary', [TimesheetController::class, 'employeeSummary']);
    Route::get('timesheets/project/{project}/summary', [TimesheetController::class, 'projectSummary']);
    Route::get('timesheets/reports/daily', [TimesheetController::class, 'dailyReport']);
    Route::get('timesheets/reports/weekly', [TimesheetController::class, 'weeklyReport']);
    Route::get('timesheets/reports/monthly', [TimesheetController::class, 'monthlyReport']);
    Route::get('timesheets/export/pdf', [TimesheetController::class, 'exportPdf']);
    Route::get('timesheets/export/excel', [TimesheetController::class, 'exportExcel']);
    Route::delete('timesheets/bulk-delete', [
        \Modules\TimesheetManagement\Http\Controllers\TimesheetController::class,
        'bulkDelete'
    ])->middleware(['auth:sanctum', 'role:admin'])->name('hr.api.timesheets.bulk-delete');
    Route::post('timesheets/bulk-approve', [
        \Modules\TimesheetManagement\Http\Controllers\TimesheetController::class,
        'bulkApprove'
    ])->middleware(['auth:sanctum', 'role:admin'])->name('hr.api.timesheets.bulk-approve');
    Route::post('timesheets/auto-generate', [
        \Modules\TimesheetManagement\Http\Controllers\TimesheetController::class,
        'autoGenerate'
    ]);

    // Time Entry Routes
    Route::apiResource('time-entries', TimeEntryController::class)->names([
        'index' => 'hr.api.time-entries.index',
        'store' => 'hr.api.time-entries.store',
        'show' => 'hr.api.time-entries.show',
        'update' => 'hr.api.time-entries.update',
        'destroy' => 'hr.api.time-entries.destroy'
    ]);
    Route::post('time-entries/clock-in', [TimeEntryController::class, 'clockIn']);
    Route::post('time-entries/clock-out', [TimeEntryController::class, 'clockOut']);
    Route::get('time-entries/active', [TimeEntryController::class, 'getActiveEntry']);
    Route::get('time-entries/employee/{employee}/current-week', [TimeEntryController::class, 'getCurrentWeekEntries']);
    Route::post('time-entries/{timeEntry}/break-start', [TimeEntryController::class, 'startBreak']);
    Route::post('time-entries/{timeEntry}/break-end', [TimeEntryController::class, 'endBreak']);

    // Mobile Time Logging Routes (for mobile app integration)
    Route::prefix('mobile')->group(function () {
        Route::post('/time-entries/location-check', [TimeEntryController::class, 'locationCheck']);
        Route::post('/time-entries/offline-sync', [TimeEntryController::class, 'offlineSync']);
        // Route::get('/geofences/nearby', [GeofenceController::class, 'getNearbyZones']);
        // Route::post('/location/validate', [GeofenceController::class, 'validateLocation']);
    });
});

// Public routes (if any)
Route::get('/timesheets/public/status', function () {
    return response()->json([
        'status' => 'active',
        'module' => 'TimesheetManagement',
        'version' => '1.0.0'
    ]);
});

Route::get('/timesheets/realtime-dashboard', RealTimeDashboardController::class);

Route::post('/timesheets/custom-report', CustomReportController::class);

Route::get('/time-off-requests', [TimeOffRequestController::class, 'index']);
Route::post('/time-off-requests', [TimeOffRequestController::class, 'store']);
Route::get('/time-off-requests/{id}', [TimeOffRequestController::class, 'show']);
Route::post('/time-off-requests/{id}/approve', [TimeOffRequestController::class, 'approve']);
Route::post('/time-off-requests/{id}/reject', [TimeOffRequestController::class, 'reject']);

