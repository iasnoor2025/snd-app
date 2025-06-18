<?php

use Illuminate\Support\Facades\Route;
use Modules\EquipmentManagement\Http\Controllers\EquipmentApiController;
use Modules\EquipmentManagement\Http\Controllers\EquipmentMaintenanceController as EquipmentMaintenanceApiController;
use Modules\EquipmentManagement\Http\Controllers\EquipmentCostController as EquipmentCostApiController;
use Modules\EquipmentManagement\Http\Controllers\EquipmentUtilizationController as EquipmentUtilizationApiController;
use Modules\EquipmentManagement\Http\Controllers\EquipmentTrackingController as EquipmentTrackingApiController;
use Modules\EquipmentManagement\Http\Controllers\MaintenanceController as MaintenanceApiController;
use Modules\EquipmentManagement\Http\Controllers\MaintenanceScheduleController as MaintenanceScheduleApiController;
use Modules\EquipmentManagement\Http\Controllers\MaintenanceTaskController as MaintenanceTaskApiController;
use Modules\EquipmentManagement\Http\Controllers\MaintenanceRecordController as MaintenanceRecordApiController;
use Modules\EquipmentManagement\Http\Controllers\TechnicianController as TechnicianApiController;
use Modules\EquipmentManagement\Http\Controllers\DepreciationController as DepreciationApiController;
use Modules\Core\Http\Controllers\MediaLibraryController;

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

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
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
    Route::apiResource('maintenance', MaintenanceApiController::class);
    Route::apiResource('maintenance-schedules', MaintenanceScheduleApiController::class);
    Route::apiResource('maintenance-tasks', MaintenanceTaskApiController::class);
    Route::apiResource('maintenance-records', MaintenanceRecordApiController::class);
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
});

