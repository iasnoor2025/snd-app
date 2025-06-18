<?php

use Illuminate\Support\Facades\Route;
use Modules\AuditCompliance\Http\Controllers\Api\AuditLogApiController;
use Modules\AuditCompliance\Http\Controllers\Api\ComplianceApiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group.
|
*/

// TODO: Temporarily comment out all routes in this file to debug EmployeeManagement API

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    // Audit logs
    // Route::get('audit-logs', [AuditLogApiController::class, 'index']);
    // Route::get('audit-logs/{id}', [AuditLogApiController::class, 'show']);
    // Route::post('audit-logs/filter', [AuditLogApiController::class, 'filter']);
    // Route::get('audit-logs/user/{user}', [AuditLogApiController::class, 'userActivities']);
    // Route::get('audit-logs/model/{model}/{id}', [AuditLogApiController::class, 'modelChanges']);

    // Compliance reporting
    // Route::get('compliance/dashboard', [ComplianceApiController::class, 'complianceDashboard']);
    // Route::get('compliance/reports/activity', [ComplianceApiController::class, 'activityReport']);
    // Route::get('compliance/reports/changes', [ComplianceApiController::class, 'changesReport']);
    // Route::get('compliance/reports/user-activity', [ComplianceApiController::class, 'userActivityReport']);
    // Route::post('compliance/reports/export', [ComplianceApiController::class, 'exportReport']);

    // System monitoring
    // Route::get('compliance/monitoring/summary', [ComplianceApiController::class, 'monitoringSummary']);
    // Route::get('compliance/monitoring/alerts', [ComplianceApiController::class, 'alerts']);
});

