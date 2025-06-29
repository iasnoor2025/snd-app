<?php

use Illuminate\Support\Facades\Route;
use Modules\EquipmentManagement\Http\Controllers\EquipmentApiController;
use Modules\EquipmentManagement\Http\Controllers\EquipmentMaintenanceController as EquipmentMaintenanceApiController;
use Modules\EquipmentManagement\Http\Controllers\EquipmentCostController as EquipmentCostApiController;
use Modules\EquipmentManagement\Http\Controllers\EquipmentUtilizationController as EquipmentUtilizationApiController;
use Modules\EquipmentManagement\Http\Controllers\EquipmentTrackingController as EquipmentTrackingApiController;
use Modules\EquipmentManagement\Http\Controllers\MaintenanceController as MaintenanceApiController;
use Modules\EquipmentManagement\Http\Controllers\MaintenanceScheduleController;
use Modules\EquipmentManagement\Http\Controllers\MaintenanceTaskController as MaintenanceTaskApiController;
use Modules\EquipmentManagement\Http\Controllers\MaintenanceRecordController as MaintenanceRecordApiController;
use Modules\EquipmentManagement\Http\Controllers\TechnicianController as TechnicianApiController;
use Modules\EquipmentManagement\Http\Controllers\DepreciationController as DepreciationApiController;
use Modules\Core\Http\Controllers\MediaLibraryController;
use Modules\EquipmentManagement\Http\Controllers\EquipmentMediaController;
use Modules\EquipmentManagement\Http\Controllers\EquipmentPerformanceController;
use Modules\EquipmentManagement\Http\Controllers\EquipmentController;
use Modules\EquipmentManagement\Http\Controllers\EquipmentCodeController;
use Modules\EquipmentManagement\Http\Controllers\UsageLogController;

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

// API routes uncommented

Route::middleware(['auth:sanctum'])->group(function () {
    // Equipment management
    Route::apiResource('equipment', EquipmentApiController::class, [
        'names' => [
            'index' => 'api.equipment.index',
            'store' => 'api.equipment.store',
            'show' => 'api.equipment.show',
            'update' => 'api.equipment.update',
            'destroy' => 'api.equipment.destroy',
        ]
    ]);
    Route::get('equipment/{equipment}/history', [EquipmentApiController::class, 'history']);
    Route::get('equipment/{equipment}/documents', [EquipmentApiController::class, 'documents']);
    Route::post('equipment/{equipment}/documents', [EquipmentApiController::class, 'storeDocument']);
    Route::put('equipment/{equipment}/status', [EquipmentApiController::class, 'updateStatus']);

    // Equipment costs and depreciation
    Route::get('equipment/{equipment}/costs', [EquipmentCostApiController::class, 'index']);
    Route::post('equipment/{equipment}/costs', [EquipmentCostApiController::class, 'store']);
    Route::get('equipment/{equipment}/depreciation', [DepreciationApiController::class, 'show']);
    Route::get('depreciation/dashboard', [DepreciationApiController::class, 'dashboard']);

    // Equipment utilization and tracking
    Route::get('equipment/{equipment}/utilization', [EquipmentUtilizationApiController::class, 'show']);
    Route::get('equipment/utilization/report', [EquipmentUtilizationApiController::class, 'report']);
    Route::get('equipment/{equipment}/tracking', [EquipmentTrackingApiController::class, 'show']);
    Route::post('equipment/{equipment}/tracking', [EquipmentTrackingApiController::class, 'update']);

    // Maintenance management
    Route::apiResource('maintenance', MaintenanceApiController::class, [
        'names' => [
            'index' => 'api.maintenance.index',
            'store' => 'api.maintenance.store',
            'show' => 'api.maintenance.show',
            'update' => 'api.maintenance.update',
            'destroy' => 'api.maintenance.destroy',
        ]
    ]);
    Route::apiResource('maintenance-schedules', MaintenanceScheduleApiController::class, [
        'names' => [
            'index' => 'api.maintenance-schedules.index',
            'store' => 'api.maintenance-schedules.store',
            'show' => 'api.maintenance-schedules.show',
            'update' => 'api.maintenance-schedules.update',
            'destroy' => 'api.maintenance-schedules.destroy',
        ]
    ]);
    Route::apiResource('maintenance-tasks', MaintenanceTaskApiController::class, [
        'names' => [
            'index' => 'api.maintenance-tasks.index',
            'store' => 'api.maintenance-tasks.store',
            'show' => 'api.maintenance-tasks.show',
            'update' => 'api.maintenance-tasks.update',
            'destroy' => 'api.maintenance-tasks.destroy',
        ]
    ]);
    Route::apiResource('maintenance-records', MaintenanceRecordApiController::class, [
        'names' => [
            'index' => 'api.maintenance-records.index',
            'store' => 'api.maintenance-records.store',
            'show' => 'api.maintenance-records.show',
            'update' => 'api.maintenance-records.update',
            'destroy' => 'api.maintenance-records.destroy',
        ]
    ]);
    Route::post('equipment/{equipment}/maintenance', [EquipmentMaintenanceApiController::class, 'schedule']);
    Route::get('equipment/{equipment}/maintenance', [EquipmentMaintenanceApiController::class, 'history']);
    Route::put('maintenance/{maintenance}/complete', [MaintenanceApiController::class, 'markComplete']);

    // Technicians
    Route::apiResource('technicians', TechnicianApiController::class);
    Route::get('technicians/{technician}/workload', [TechnicianApiController::class, 'workload']);
    Route::post('maintenance/{maintenance}/assign', [MaintenanceApiController::class, 'assignTechnician']);

    // Media Library
    Route::get('media-library/{model}/{modelId}', [MediaLibraryController::class, 'index']);
    Route::post('media-library/{model}/{modelId}', [MediaLibraryController::class, 'upload']);
    Route::delete('media-library/{media}', [MediaLibraryController::class, 'destroy']);
    Route::get('media-library/{media}/preview', [MediaLibraryController::class, 'preview']);

    // Equipment media routes
    Route::prefix('equipment/{equipment}/media')->group(function () {
        Route::get('/', [EquipmentMediaController::class, 'index']);
        Route::post('/images', [EquipmentMediaController::class, 'uploadImage']);
        Route::post('/manuals', [EquipmentMediaController::class, 'uploadManual']);
        Route::post('/specifications', [EquipmentMediaController::class, 'uploadSpecification']);
        Route::post('/certifications', [EquipmentMediaController::class, 'uploadCertification']);
        Route::patch('/{media}', [EquipmentMediaController::class, 'updateMetadata']);
        Route::delete('/{media}', [EquipmentMediaController::class, 'destroy']);
        Route::get('/{media}/download', [EquipmentMediaController::class, 'download']);
    });

    // Equipment analytics routes
    Route::get('equipment/{equipment}/performance', [EquipmentPerformanceController::class, 'show']);

    // Equipment routes
    Route::prefix('equipment')->group(function () {
        Route::get('/', [EquipmentController::class, 'index']);
        Route::post('/', [EquipmentController::class, 'store']);
        Route::get('/{equipment}', [EquipmentController::class, 'show']);
        Route::put('/{equipment}', [EquipmentController::class, 'update']);
        Route::delete('/{equipment}', [EquipmentController::class, 'destroy']);

        // Equipment media routes
        Route::prefix('{equipment}/media')->group(function () {
            Route::post('/', [EquipmentMediaController::class, 'store']);
            Route::post('/batch', [EquipmentMediaController::class, 'storeBatch']);
            Route::get('/type/{type}', [EquipmentMediaController::class, 'getByType']);
            Route::post('/reorder', [EquipmentMediaController::class, 'reorder']);
            Route::put('/{media}', [EquipmentMediaController::class, 'update']);
            Route::delete('/{media}', [EquipmentMediaController::class, 'destroy']);
        });

        // Equipment maintenance routes
        Route::prefix('{equipment}/maintenance')->group(function () {
            Route::post('/schedule', [MaintenanceApiController::class, 'createSchedule']);
            Route::put('/schedule/{schedule}', [MaintenanceApiController::class, 'updateSchedule']);
            Route::post('/record', [MaintenanceApiController::class, 'recordMaintenance']);
            Route::get('/upcoming', [MaintenanceApiController::class, 'getUpcomingMaintenance']);
            Route::get('/history', [MaintenanceApiController::class, 'getMaintenanceHistory']);
            Route::get('/costs', [MaintenanceApiController::class, 'getMaintenanceCostsSummary']);
            Route::get('/', [MaintenanceScheduleController::class, 'index']);
            Route::post('/', [MaintenanceScheduleController::class, 'store']);
            Route::put('/{schedule}', [MaintenanceScheduleController::class, 'update']);
            Route::delete('/{schedule}', [MaintenanceScheduleController::class, 'destroy']);
        });
    });

    // Equipment Code Routes
    Route::get('equipment/{equipment}/codes', [EquipmentCodeController::class, 'index']);
    Route::post('equipment/{equipment}/codes/qr', [EquipmentCodeController::class, 'generateQr']);
    Route::post('equipment/{equipment}/codes/barcode', [EquipmentCodeController::class, 'generateBarcode']);
    Route::post('equipment/codes/scan', [EquipmentCodeController::class, 'scan']);
    Route::post('equipment/codes/{code}/primary', [EquipmentCodeController::class, 'setPrimary']);
    Route::delete('equipment/codes/{code}', [EquipmentCodeController::class, 'destroy']);

    // Usage Log Routes
    Route::prefix('equipment/{equipment}/usage')->group(function () {
        Route::get('/', [UsageLogController::class, 'index']);
        Route::post('/', [UsageLogController::class, 'store']);
        Route::get('/analytics', [UsageLogController::class, 'analytics']);
    });
});

