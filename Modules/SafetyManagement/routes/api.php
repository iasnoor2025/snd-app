<?php

use Illuminate\Support\Facades\Route;
use Modules\SafetyManagement\Http\Controllers\SafetyManagementController;
use Modules\SafetyManagement\Http\Controllers\KpiController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('safetymanagements', SafetyManagementController::class)->names('safetymanagement');
});

Route::middleware(['auth:api'])->prefix('safety')->name('safety.')->group(function () {
    Route::get('kpis', [KpiController::class, 'index'])->name('kpis');
});
