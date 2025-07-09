<?php

use Illuminate\Support\Facades\Route;
use Modules\CustomerManagement\Http\Controllers\Api\CustomerApiController;
use Modules\CustomerManagement\Http\Controllers\Api\CustomerPortalApiController;
use Modules\CustomerManagement\Http\Controllers\Api\DashboardApiController;

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

// TODO: Temporarily comment out all routes in this file to debug EmployeeManagement API
// Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
//     // Customer management
//     Route::apiResource('customers', CustomerApiController::class);
//     Route::get('customers/{customer}/invoices', [CustomerApiController::class, 'invoices']);
//     Route::get('customers/{customer}/rentals', [CustomerApiController::class, 'rentals']);
//     Route::get('customers/{customer}/quotations', [CustomerApiController::class, 'quotations']);
//     Route::get('customers/{customer}/payments', [CustomerApiController::class, 'payments']);
//     Route::get('customers/report/summary', [CustomerApiController::class, 'reportSummary']);
//     Route::get('customers/report/detailed', [CustomerApiController::class, 'reportDetailed']);
//
//     // Customer portal
//     Route::prefix('portal')->group(function () {
//         Route::get('dashboard', [DashboardApiController::class, 'index']);
//         Route::get('rentals', [CustomerPortalApiController::class, 'rentals']);
//         Route::get('invoices', [CustomerPortalApiController::class, 'invoices']);
//         Route::get('quotations', [CustomerPortalApiController::class, 'quotations']);
//         Route::get('payments', [CustomerPortalApiController::class, 'payments']);
//         Route::post('profile/update', [CustomerPortalApiController::class, 'updateProfile']);
//     });
// });

Route::post('customers/sync-erpnext', [CustomerApiController::class, 'syncErpnext']);

