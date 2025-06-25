<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Modules\ProjectManagement\Http\Controllers\Api\ProjectApiController;
use Modules\ProjectManagement\Http\Controllers\ProjectDocumentController;

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
Route::middleware(['auth:sanctum'])->prefix('v1/projects')->group(function () {
    Route::get('/', [ProjectApiController::class, 'index']);
    Route::post('/', [ProjectApiController::class, 'store']);
    Route::get('/{project}', [ProjectApiController::class, 'show']);
    Route::put('/{project}', [ProjectApiController::class, 'update']);
    Route::delete('/{project}', [ProjectApiController::class, 'destroy']);
});

// Project Document Routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('projects/{project}/documents', [ProjectDocumentController::class, 'store'])
        ->name('project.documents.store');
        
    Route::put('documents/{document}', [ProjectDocumentController::class, 'update'])
        ->name('project.documents.update');
        
    Route::delete('documents/{document}', [ProjectDocumentController::class, 'destroy'])
        ->name('project.documents.destroy');
        
    Route::get('projects/{project}/documents/{category}', [ProjectDocumentController::class, 'getByCategory'])
        ->name('project.documents.by-category');
        
    Route::get('documents/{document}/versions', [ProjectDocumentController::class, 'getVersions'])
        ->name('project.documents.versions');
        
    Route::post('documents/{document}/share', [ProjectDocumentController::class, 'share'])
        ->name('project.documents.share');
});



