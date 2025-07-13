<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Modules\Core\Http\Controllers\Api\BaseApiController;
use Modules\Core\Http\Controllers\UserController;
use Modules\Core\Http\Controllers\RoleController;
use Modules\Core\Http\Controllers\MfaController;
use Modules\Core\Http\Controllers\ApiKeyController;
use Modules\Core\Http\Controllers\DeviceSessionController;
use Modules\Core\Http\Controllers\AuthController;
use Modules\Core\Http\Controllers\Api\CalendarWidgetController;
use Modules\Core\Http\Controllers\Api\TimelineWidgetController;
use Modules\Core\Http\Controllers\DebugController;
use Modules\Core\Http\Controllers\ActivityLogController;

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

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    // User management
    Route::get('users', [UserController::class, 'index']);
    Route::get('users/{user}', [UserController::class, 'show']);
    Route::post('users', [UserController::class, 'store']);
    Route::put('users/{user}', [UserController::class, 'update']);
    Route::delete('users/{user}', [UserController::class, 'destroy']);

    // Add current user endpoint
    Route::get('current-user', [AuthController::class, 'currentUser']);

    // Role management
    Route::get('roles', [RoleController::class, 'index']);
    Route::get('roles/{role}', [RoleController::class, 'show']);
    Route::post('roles', [RoleController::class, 'store']);
    Route::put('roles/{role}', [RoleController::class, 'update']);
    Route::delete('roles/{role}', [RoleController::class, 'destroy']);
    Route::put('users/{user}/roles', [RoleController::class, 'updateUserRoles']);

    // System utilities
    Route::get('system/info', [BaseApiController::class, 'systemInfo']);
    Route::get('system/stats', [BaseApiController::class, 'systemStats']);
});

// MFA Routes
Route::middleware(['auth:sanctum'])->prefix('mfa')->group(function () {
    Route::get('status', [MfaController::class, 'status']);
    Route::post('setup', [MfaController::class, 'setup']);
    Route::post('enable', [MfaController::class, 'enable']);
    Route::post('disable', [MfaController::class, 'disable']);
    Route::post('verify', [MfaController::class, 'verify']);
    Route::post('recovery-email', [MfaController::class, 'setRecoveryEmail']);
});

// API Key Routes
Route::middleware(['auth:sanctum'])->prefix('api-keys')->group(function () {
    Route::get('/', [ApiKeyController::class, 'index']);
    Route::post('/', [ApiKeyController::class, 'store']);
    Route::delete('/{id}', [ApiKeyController::class, 'destroy']);
});

// Device Session Routes
Route::middleware(['auth:sanctum'])->prefix('sessions')->group(function () {
    Route::get('/', [DeviceSessionController::class, 'index']);
    Route::get('/current', [DeviceSessionController::class, 'current']);
    Route::post('/revoke', [DeviceSessionController::class, 'revoke']);
    Route::post('/revoke-all', [DeviceSessionController::class, 'revokeAll']);
});

Route::get('/calendar/events', [CalendarWidgetController::class, 'events']);
Route::get('/timeline', [TimelineWidgetController::class, 'index']);
Route::middleware(['auth:sanctum'])->get('/activity-log', [ActivityLogController::class, 'index']);

// Debug endpoints for session/cookie/csrf debugging
Route::get('/debug/csrf-debug', [DebugController::class, 'csrfDebug']);
Route::get('/debug/login-debug', [DebugController::class, 'loginDebug']);
Route::get('/debug/session-debug', function (\Illuminate\Http\Request $request) {
    return response()->json([
        'session_id' => session_id(),
        'session_status' => session_status() == PHP_SESSION_ACTIVE ? 'active' : 'not active',
        'all_session' => $request->session()->all(),
        'cookies' => $request->cookies->all(),
        'headers' => $request->headers->all(),
        'user' => $request->user(),
    ]);
});

