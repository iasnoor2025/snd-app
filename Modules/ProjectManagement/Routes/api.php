<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Modules\ProjectManagement\Http\Controllers\Api\ProjectApiController;

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



