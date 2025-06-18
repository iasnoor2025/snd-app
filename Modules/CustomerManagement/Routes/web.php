<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group.
|
*/

use Illuminate\Support\Facades\Route;
use Modules\CustomerManagement\Http\Controllers\CustomerController;
use Modules\CustomerManagement\Http\Controllers\CustomerPortalController;
use Modules\CustomerManagement\Http\Controllers\DashboardController;

Route::prefix('customers')->name('customers.')->middleware(['web', 'auth'])->group(function () {
    // Customer management routes
    Route::get('/', [CustomerController::class, 'index'])->name('index'); 
    Route::get('/create', [CustomerController::class, 'create'])->name('create');
    Route::post('/', [CustomerController::class, 'store'])->name('store');
    Route::get('/{customer}', [CustomerController::class, 'show'])->name('show');
    Route::get('/{customer}/edit', [CustomerController::class, 'edit'])->name('edit');
    Route::put('/{customer}', [CustomerController::class, 'update'])->name('update');
    Route::delete('/{customer}', [CustomerController::class, 'destroy'])->name('destroy');

    // Customer additional functionality
    Route::get('/report', [CustomerController::class, 'report'])->name('report');
    Route::get('/export', [CustomerController::class, 'export'])->name('export');
    Route::get('/import', [CustomerController::class, 'importForm'])->name('import');
    Route::post('/import', [CustomerController::class, 'processImport'])->name('process-import');

    // Customer details routes
    Route::get('/{customer}/invoices', [CustomerController::class, 'invoices'])->name('invoices');
    Route::get('/{customer}/rentals', [CustomerController::class, 'rentals'])->name('rentals');
    Route::get('/{customer}/quotations', [CustomerController::class, 'quotations'])->name('quotations');
    Route::get('/{customer}/payments', [CustomerController::class, 'payments'])->name('payments');
});

// Customer portal routes - only if needed for internal admin access
Route::middleware(['web', 'auth', 'verified'])->prefix('customer-portal')->name('customer-portal.')->group(function () {
    Route::get('/', [CustomerPortalController::class, 'index'])->name('index');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

