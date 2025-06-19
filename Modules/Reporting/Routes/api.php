<?php

use Illuminate\Support\Facades\Route;
// Controllers restored after system stabilization
use Modules\Reporting\Http\Controllers\Api\ReportApiController;
use Modules\Reporting\Http\Controllers\Api\ProjectReportApiController;
use Modules\Reporting\Http\Controllers\Api\AnalyticsApiController;
use Modules\Reporting\Http\Controllers\Api\ReportBuilderApiController;

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

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    // Standard reports
    Route::get('reports', [ReportApiController::class, 'index']);
    Route::get('reports/equipment-utilization', [ReportApiController::class, 'equipmentUtilization']);
    Route::get('reports/employee-productivity', [ReportApiController::class, 'employeeProductivity']);
    Route::get('reports/project-performance', [ReportApiController::class, 'projectPerformance']);
    Route::get('reports/financial-summary', [ReportApiController::class, 'financialSummary']);
    Route::get('reports/rental-overview', [ReportApiController::class, 'rentalOverview']);
    Route::get('reports/maintenance-status', [ReportApiController::class, 'maintenanceStatus']);

    // Project-specific reports
    Route::get('reports/projects/{project}', [ProjectReportApiController::class, 'show']);
    Route::get('reports/projects/{project}/financials', [ProjectReportApiController::class, 'financials']);
    Route::get('reports/projects/{project}/utilization', [ProjectReportApiController::class, 'utilization']);
    Route::get('reports/projects/{project}/timesheets', [ProjectReportApiController::class, 'timesheets']);

    // Analytics
    Route::get('analytics/dashboard', [AnalyticsApiController::class, 'dashboard']);
    Route::get('analytics/equipment', [AnalyticsApiController::class, 'equipmentAnalytics']);
    Route::get('analytics/projects', [AnalyticsApiController::class, 'projectAnalytics']);
    Route::get('analytics/customers', [AnalyticsApiController::class, 'customerAnalytics']);
    Route::get('analytics/financials', [AnalyticsApiController::class, 'financialAnalytics']);

    // Report builder
    Route::get('report-builder/templates', [ReportBuilderApiController::class, 'templates']);
    Route::get('report-builder/templates/{template}', [ReportBuilderApiController::class, 'getTemplate']);
    Route::post('report-builder/generate', [ReportBuilderApiController::class, 'generateReport']);
    Route::post('report-builder/save', [ReportBuilderApiController::class, 'saveCustomReport']);
    Route::get('report-builder/custom', [ReportBuilderApiController::class, 'getCustomReports']);

    // Export functionality
    Route::post('reports/export', [ReportApiController::class, 'export']);
    Route::get('reports/export/{id}/status', [ReportApiController::class, 'exportStatus']);
    Route::get('reports/export/{id}/download', [ReportApiController::class, 'downloadExport']);
});

