<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Modules\Core\Http\Controllers\Api\BaseApiController;
use Modules\Core\Http\Controllers\UserController;
use Modules\Core\Http\Controllers\RoleController;

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

Route::middleware('auth:sanctum')->get('/core', function (Request $request) {
    return $request->user();
});

/*
|--------------------------------------------------------------------------
| Core Module API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your module. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group.
|
*/

// TODO: Temporarily comment out all routes in this file to debug EmployeeManagement API
// Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
//     // User management
//     Route::get('users', [UserController::class, 'index']);
//     Route::get('users/{user}', [UserController::class, 'show']);
//     Route::post('users', [UserController::class, 'store']);
//     Route::put('users/{user}', [UserController::class, 'update']);
//     Route::delete('users/{user}', [UserController::class, 'destroy']);
//
//     // Role management
//     Route::get('roles', [RoleController::class, 'index']);
//     Route::get('roles/{role}', [RoleController::class, 'show']);
//     Route::post('roles', [RoleController::class, 'store']);
//     Route::put('roles/{role}', [RoleController::class, 'update']);
//     Route::delete('roles/{role}', [RoleController::class, 'destroy']);
//     Route::put('users/{user}/roles', [RoleController::class, 'updateUserRoles']);
//
//     // System utilities
//     Route::get('system/info', [BaseApiController::class, 'systemInfo']);
//     Route::get('system/stats', [BaseApiController::class, 'systemStats']);
// });

