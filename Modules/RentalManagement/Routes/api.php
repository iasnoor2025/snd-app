<?php

use Illuminate\Support\Facades\Route;
use Modules\RentalManagement\Http\Controllers\RentalController;
use Modules\RentalManagement\Http\Controllers\RentalItemController;
use Modules\RentalManagement\Http\Controllers\RentalHistoryController;
use Modules\RentalManagement\Http\Controllers\RentalExtensionController;
use Modules\RentalManagement\Http\Controllers\QuotationController;
use Modules\RentalManagement\Http\Controllers\InvoiceController;
use Modules\RentalManagement\Http\Controllers\PaymentController;
use Modules\RentalManagement\Http\Controllers\CustomerController;
use Modules\RentalManagement\Http\Controllers\SupplierController;
use Modules\RentalManagement\Http\Controllers\RentalTimesheetController;
use Modules\RentalManagement\Http\Controllers\RentalAnalyticsController;

// API routes uncommented

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    // Rental routes (fine-grained permissions)

    Route::post('rentals', [RentalController::class, 'store'])
        ->middleware('permission:rentals.create');
    Route::get('rentals/{rental}', [RentalController::class, 'show'])
        ->middleware('permission:rentals.view');
    Route::put('rentals/{rental}', [RentalController::class, 'update'])
        ->middleware('permission:rentals.edit');
    Route::delete('rentals/{rental}', [RentalController::class, 'destroy'])
        ->middleware('permission:rentals.delete');
    Route::get('rentals/{rental}/items', [RentalController::class, 'items'])
        ->middleware('permission:rentals.items.view');
    Route::post('rentals/{rental}/extend', [RentalExtensionController::class, 'extend'])
        ->middleware('permission:rentals.edit');
    Route::post('rentals/{rental}/return', [RentalController::class, 'return'])
        ->middleware('permission:rentals.edit');

    // Rental items
    Route::get('rental-items', [RentalItemController::class, 'index'])
        ->middleware('permission:rentals.items.view');
    Route::post('rental-items', [RentalItemController::class, 'store'])
        ->middleware('permission:rentals.items.create');
    Route::get('rental-items/{rental_item}', [RentalItemController::class, 'show'])
        ->middleware('permission:rentals.items.view');
    Route::put('rental-items/{rental_item}', [RentalItemController::class, 'update'])
        ->middleware('permission:rentals.items.edit');
    Route::delete('rental-items/{rental_item}', [RentalItemController::class, 'destroy'])
        ->middleware('permission:rentals.items.delete');

    // Rental history
    Route::get('rental-history', [RentalHistoryController::class, 'index'])
        ->middleware('permission:rentals.view');
    Route::get('rental-history/{id}', [RentalHistoryController::class, 'show'])
        ->middleware('permission:rentals.view');

    // Quotations
    Route::get('quotations', [QuotationController::class, 'index'])
        ->middleware('permission:quotations.view');
    Route::post('quotations', [QuotationController::class, 'store'])
        ->middleware('permission:quotations.create');
    Route::get('quotations/{quotation}', [QuotationController::class, 'show'])
        ->middleware('permission:quotations.view');
    Route::put('quotations/{quotation}', [QuotationController::class, 'update'])
        ->middleware('permission:quotations.edit');
    Route::delete('quotations/{quotation}', [QuotationController::class, 'destroy'])
        ->middleware('permission:quotations.delete');
    Route::post('quotations/{quotation}/convert', [QuotationController::class, 'convertToRental'])
        ->middleware('permission:quotations.edit');

    // Invoices
    Route::get('invoices', [InvoiceController::class, 'index'])
        ->middleware('permission:invoices.view');
    Route::post('invoices', [InvoiceController::class, 'store'])
        ->middleware('permission:invoices.create');
    Route::get('invoices/{invoice}', [InvoiceController::class, 'show'])
        ->middleware('permission:invoices.view');
    Route::put('invoices/{invoice}', [InvoiceController::class, 'update'])
        ->middleware('permission:invoices.edit');
    Route::delete('invoices/{invoice}', [InvoiceController::class, 'destroy'])
        ->middleware('permission:invoices.delete');

    // Payments
    Route::get('payments', [PaymentController::class, 'index'])
        ->middleware('permission:payments.view');
    Route::post('payments', [PaymentController::class, 'store'])
        ->middleware('permission:payments.create');
    Route::get('payments/{payment}', [PaymentController::class, 'show'])
        ->middleware('permission:payments.view');
    Route::put('payments/{payment}', [PaymentController::class, 'update'])
        ->middleware('permission:payments.edit');
    Route::delete('payments/{payment}', [PaymentController::class, 'destroy'])
        ->middleware('permission:payments.delete');

    // Customers
    Route::get('customers', [CustomerController::class, 'index'])
        ->middleware('permission:customers.view');
    Route::post('customers', [CustomerController::class, 'store'])
        ->middleware('permission:customers.create');
    Route::get('customers/{customer}', [CustomerController::class, 'show'])
        ->middleware('permission:customers.view');
    Route::put('customers/{customer}', [CustomerController::class, 'update'])
        ->middleware('permission:customers.edit');
    Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])
        ->middleware('permission:customers.delete');

    // Suppliers
    Route::get('suppliers', [SupplierController::class, 'index'])
        ->middleware('permission:suppliers.view');
    Route::post('suppliers', [SupplierController::class, 'store'])
        ->middleware('permission:suppliers.create');
    Route::get('suppliers/{supplier}', [SupplierController::class, 'show'])
        ->middleware('permission:suppliers.view');
    Route::put('suppliers/{supplier}', [SupplierController::class, 'update'])
        ->middleware('permission:suppliers.edit');
    Route::delete('suppliers/{supplier}', [SupplierController::class, 'destroy'])
        ->middleware('permission:suppliers.delete');

    // Rental timesheets
    Route::get('rental-timesheets', [RentalTimesheetController::class, 'index'])
        ->middleware('permission:rental-timesheets.view');
    Route::post('rental-timesheets', [RentalTimesheetController::class, 'store'])
        ->middleware('permission:rental-timesheets.create');
    Route::get('rental-timesheets/{rental_timesheet}', [RentalTimesheetController::class, 'show'])
        ->middleware('permission:rental-timesheets.view');
    Route::put('rental-timesheets/{rental_timesheet}', [RentalTimesheetController::class, 'update'])
        ->middleware('permission:rental-timesheets.edit');
    Route::delete('rental-timesheets/{rental_timesheet}', [RentalTimesheetController::class, 'destroy'])
        ->middleware('permission:rental-timesheets.delete');

    // Analytics
    Route::get('analytics/rentals', [RentalAnalyticsController::class, 'rentalsAnalytics'])
        ->middleware('permission:rentals.view');
    Route::get('analytics/revenue', [RentalAnalyticsController::class, 'revenueAnalytics'])
        ->middleware('permission:rentals.view');
    Route::get('analytics/equipment-utilization', [RentalAnalyticsController::class, 'equipmentUtilization'])
        ->middleware('permission:rentals.view');
});

