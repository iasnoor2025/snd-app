<?php

use Illuminate\Support\Facades\Route;
use Modules\SafetyManagement\Http\Controllers\IncidentController;
use Modules\SafetyManagement\Http\Controllers\RiskController;
use Modules\SafetyManagement\Http\Controllers\InspectionController;
use Modules\SafetyManagement\Http\Controllers\TrainingRecordController;
use Modules\SafetyManagement\Http\Controllers\PpeCheckController;
use Modules\SafetyManagement\Http\Controllers\SafetyActionController;

Route::prefix('safety')->name('safety.')->group(function () {
    Route::resource('incidents', IncidentController::class);
    Route::post('incidents/{incident}/close', [IncidentController::class, 'close'])
        ->name('incidents.close');

    Route::resource('risks', RiskController::class);
    Route::resource('inspections', InspectionController::class);
    Route::post('inspections/{inspection}/complete', [InspectionController::class, 'complete'])
        ->name('inspections.complete');

    Route::resource('training-records', TrainingRecordController::class);
    Route::resource('ppe-checks', PpeCheckController::class);
    Route::resource('safety-actions', SafetyActionController::class);
});
