<?php

use Illuminate\Support\Facades\Route;
use Modules\SafetyManagement\Http\Controllers\IncidentController;
use Modules\SafetyManagement\Http\Controllers\RiskController;
use Modules\SafetyManagement\Http\Controllers\InspectionController;
use Modules\SafetyManagement\Http\Controllers\TrainingRecordController;
use Modules\SafetyManagement\Http\Controllers\PpeCheckController;
use Modules\SafetyManagement\Http\Controllers\SafetyActionController;

Route::middleware(['auth', 'verified'])->prefix('safety')->name('safety.')->group(function () {
    Route::resource('incidents', IncidentController::class)
        ->middleware('permission:incidents.view');
    Route::post('incidents/{incident}/close', [IncidentController::class, 'close'])
        ->name('incidents.close')->middleware('permission:incidents.edit');

    Route::resource('risks', RiskController::class)
        ->middleware('permission:risks.view');
    Route::resource('inspections', InspectionController::class)
        ->middleware('permission:inspections.view');
    Route::post('inspections/{inspection}/complete', [InspectionController::class, 'complete'])
        ->name('inspections.complete')->middleware('permission:inspections.edit');

    Route::resource('training-records', TrainingRecordController::class)
        ->middleware('permission:training-records.view');
    Route::resource('ppe-checks', PpeCheckController::class)
        ->middleware('permission:ppe-checks.view');
    Route::resource('safety-actions', SafetyActionController::class)
        ->middleware('permission:safety-actions.view');
});
