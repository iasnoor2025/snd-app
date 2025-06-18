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
use Modules\EquipmentManagement\Http\Controllers\EquipmentController;
use Modules\EquipmentManagement\Http\Controllers\EquipmentAnalyticsController;
use Modules\EquipmentManagement\Http\Controllers\MaintenanceController;
use Modules\EquipmentManagement\Http\Controllers\MaintenanceRecordController;
use Modules\EquipmentManagement\Http\Controllers\MaintenancePartController;
use Modules\EquipmentManagement\Http\Controllers\MaintenanceScheduleController;
use Modules\Core\Http\Controllers\MediaLibraryController;
use Modules\Core\Http\Controllers\CategoryController;
use Modules\Core\Http\Controllers\LocationController;

Route::middleware(['auth'])->group(function () {
        // Equipment index
    Route::get('/equipment', [EquipmentController::class, 'index'])
        ->middleware('permission:equipment.view')
        ->name('equipment.index');

    // Analytics Dashboard Route
    Route::get('/equipment/analytics/dashboard', [EquipmentAnalyticsController::class, 'dashboard'])
        ->middleware('permission:equipment.view')
        ->name('equipment.analytics.dashboard');

    // Equipment routes
    Route::get('/equipment/availability', [EquipmentController::class, 'availability'])
        ->middleware('permission:equipment.view')
        ->name('equipment.availability');
    Route::get('/equipment/create', [EquipmentController::class, 'create'])
        ->middleware('permission:equipment.create')
        ->name('equipment.create');
    Route::post('/equipment', [EquipmentController::class, 'store'])
        ->middleware('permission:equipment.create')
        ->name('equipmentmgmt.store');
    Route::get('/equipment/{equipment}', [EquipmentController::class, 'show'])
        ->middleware('permission:equipment.view')
        ->name('equipment.show');
    Route::get('/equipment/{equipment}/edit', [EquipmentController::class, 'edit'])
        ->middleware('permission:equipment.edit')
        ->name('equipment.edit');
    Route::put('/equipment/{equipment}', [EquipmentController::class, 'update'])
        ->middleware('permission:equipment.edit')
        ->name('equipment.update');
    Route::post('/equipment/{equipment}/change-status', [EquipmentController::class, 'changeStatus'])
        ->middleware('permission:equipment.edit')
        ->name('equipment.change-status');
    Route::delete('/equipment/{equipment}', [EquipmentController::class, 'destroy'])
        ->middleware('permission:equipment.delete')
        ->name('equipment.destroy');
    // Equipment media library
    Route::get('/equipment/{equipment}/media-library', function($equipment) {
        return app(MediaLibraryController::class)->index(request(), 'Equipment', $equipment);
    })->middleware('permission:equipment.view')
        ->name('equipment.media-library');
    Route::post('/equipment/{equipment}/media-library', function($equipment) {
        return app(MediaLibraryController::class)->upload(request(), app(\App\Actions\Media\UploadMediaAction::class));
    })->middleware('permission:equipment.edit')
        ->name('equipment.media-library.upload');
    // Maintenance routes
    Route::get('/equipment/maintenance/create', [MaintenanceRecordController::class, 'create'])
        ->middleware('permission:maintenance.create')
        ->name('maintenance.create');
    Route::post('/equipment/maintenance', [MaintenanceRecordController::class, 'store'])
        ->middleware('permission:maintenance.create')
        ->name('maintenance.store');
    Route::get('/equipment/{equipment}/maintenance/create', [MaintenanceRecordController::class, 'createForEquipment'])
        ->middleware('permission:maintenance.create')
        ->name('equipment.maintenance.create');
    Route::get('/equipment/maintenance/inventory-items', [MaintenancePartController::class, 'inventoryItems'])
        ->middleware('permission:maintenance.view')
        ->name('maintenance.inventory-items');
    Route::get('/equipment/maintenance', [MaintenanceRecordController::class, 'index'])
        ->middleware('permission:maintenance.view')
        ->name('maintenance.index');
    Route::get('/equipment/maintenance-schedule', [MaintenanceRecordController::class, 'schedule'])
        ->middleware('permission:maintenance.view')
        ->name('maintenance.schedule');
    Route::get('/equipment/maintenance/{maintenance}', [MaintenanceRecordController::class, 'show'])
        ->middleware('permission:maintenance.view')
        ->name('maintenance.show');
    Route::post('/categories', [CategoryController::class, 'store'])
        ->middleware('permission:equipment.create')
        ->name('categories.store');
    Route::post('/locations', [LocationController::class, 'store'])
        ->middleware('permission:equipment.create')
        ->name('locations.store');
});

