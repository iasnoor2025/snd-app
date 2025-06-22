<?php

use Illuminate\Support\Facades\Route;
use Modules\RentalManagement\Http\Controllers\PaymentController;
use Modules\RentalManagement\Http\Controllers\RentalItemController;
use Modules\RentalManagement\Http\Controllers\RentalAnalyticsController;
use Modules\RentalManagement\Http\Controllers\RentalExtensionController;
use Modules\RentalManagement\Http\Controllers\RentalController;
use Modules\RentalManagement\Http\Controllers\InvoiceController;
use Modules\RentalManagement\Http\Controllers\QuotationController;
use Modules\RentalManagement\Http\Controllers\CustomerController;
use Modules\RentalManagement\Http\Controllers\RentalTimesheetController;
use Modules\RentalManagement\Http\Controllers\RentalWorkflowController;
use Modules\RentalManagement\Http\Controllers\RentalHistoryController;

/*
|--------------------------------------------------------------------------
| Rental Module Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your module. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group.
|
*/

// Rental routes (main CRUD - outside named group for proper naming)
Route::resource('rentals', RentalController::class)
    ->middleware(['web', 'auth', 'permission:rentals.view']);

Route::name('rentals.')->middleware(['web', 'auth'])->group(function () {
    // Customer routes
    Route::resource('customers', CustomerController::class)->middleware([
        'permission:customers.view',
    ]);
    Route::get('customers-report', [CustomerController::class, 'report'])
        ->middleware('permission:customers.view')
        ->name('customers.report');
    Route::get('api/customers', [CustomerController::class, 'getCustomers'])
        ->middleware('permission:customers.view')
        ->name('api.customers');

    // Extension routes
    // Route::resource('extensions', RentalExtensionController::class);
    Route::post('extensions/{extension}/approve', [RentalExtensionController::class, 'approve'])->name('extensions.approve');
    Route::post('extensions/{extension}/reject', [RentalExtensionController::class, 'reject'])->name('extensions.reject');

    // Invoice routes
    Route::resource('invoices', InvoiceController::class)->middleware([
        'permission:invoices.view',
    ]);
    Route::delete('invoices/{invoice}/documents/{documentId}', [InvoiceController::class, 'removeDocument'])
        ->middleware('permission:invoices.edit')
        ->name('invoices.documents.remove');

    // Quotation routes
    Route::resource('quotations', QuotationController::class)->middleware([
        'permission:quotations.view',
    ]);
    Route::post('quotations/{quotation}/approve', [QuotationController::class, 'approve'])->name('quotations.approve');
    Route::post('quotations/{quotation}/reject', [QuotationController::class, 'reject'])->name('quotations.reject');

    // Payment routes (fine-grained permissions)
    Route::get('rentals/{rental}/payments', [PaymentController::class, 'index'])
        ->middleware('permission:payments.view')
        ->name('rentals.payments.index');
    Route::get('rentals/{rental}/payments/create', [PaymentController::class, 'create'])
        ->middleware('permission:payments.create')
        ->name('rentals.payments.create');
    Route::post('rentals/{rental}/payments', [PaymentController::class, 'store'])
        ->middleware('permission:payments.create')
        ->name('rentals.payments.store');
    Route::get('rentals/{rental}/payments/{payment}', [PaymentController::class, 'show'])
        ->middleware('permission:payments.view')
        ->name('rentals.payments.show');
    Route::get('rentals/{rental}/payments/{payment}/edit', [PaymentController::class, 'edit'])
        ->middleware('permission:payments.edit')
        ->name('rentals.payments.edit');
    Route::put('rentals/{rental}/payments/{payment}', [PaymentController::class, 'update'])
        ->middleware('permission:payments.edit')
        ->name('rentals.payments.update');
    Route::delete('rentals/{rental}/payments/{payment}', [PaymentController::class, 'destroy'])
        ->middleware('permission:payments.delete')
        ->name('rentals.payments.destroy');

    // Rental item routes (fine-grained permissions)
    Route::get('rentals/{rental}/items', [RentalItemController::class, 'index'])
        ->middleware('permission:rentals.items.view')
        ->name('rentals.items.index');
    Route::get('rentals/{rental}/items/create', [RentalItemController::class, 'create'])
        ->middleware('permission:rentals.items.create')
        ->name('rentals.items.create');
    Route::post('rentals/{rental}/items', [RentalItemController::class, 'store'])
        ->middleware('permission:rentals.items.create')
        ->name('rentals.items.store');
    Route::get('rentals/{rental}/items/{item}', [RentalItemController::class, 'show'])
        ->middleware('permission:rentals.items.view')
        ->name('rentals.items.show');
    Route::get('rentals/{rental}/items/{item}/edit', [RentalItemController::class, 'edit'])
        ->middleware('permission:rentals.items.edit')
        ->name('rentals.items.edit');
    Route::put('rentals/{rental}/items/{item}', [RentalItemController::class, 'update'])
        ->middleware('permission:rentals.items.edit')
        ->name('rentals.items.update');
    Route::delete('rentals/{rental}/items/{item}', [RentalItemController::class, 'destroy'])
        ->middleware('permission:rentals.items.delete')
        ->name('rentals.items.destroy');

    Route::get('rentals/{rental}/items/bulk-create', [RentalItemController::class, 'bulkCreate'])->name('rentals.items.bulk-create');
    Route::post('rentals/{rental}/items/bulk', [RentalItemController::class, 'bulkStore'])->name('rentals.items.bulk-store');

    // Analytics routes
    Route::get('rentals/analytics', [RentalAnalyticsController::class, 'index'])->name('analytics.index');

    // Routes from extensions.php

    Route::get('extensions', [RentalExtensionController::class, 'index'])
        ->name('extensions.index')
        ->middleware('permission:rentals.view');
    Route::get('extensions/create', [RentalExtensionController::class, 'create'])
        ->name('extensions.create')
        ->middleware('permission:rentals.create');
    Route::post('extensions', [RentalExtensionController::class, 'store'])
        ->name('extensions.store')
        ->middleware('permission:rentals.create');
    Route::get('extensions/{extension}', [RentalExtensionController::class, 'show'])
        ->name('extensions.show')
        ->middleware('permission:rentals.view');
    Route::get('extensions/{extension}/edit', [RentalExtensionController::class, 'edit'])
        ->name('extensions.edit')
        ->middleware('permission:rentals.edit');
    Route::put('extensions/{extension}', [RentalExtensionController::class, 'update'])
        ->name('extensions.update')
        ->middleware('permission:rentals.edit');
    Route::delete('extensions/{extension}', [RentalExtensionController::class, 'destroy'])
        ->name('extensions.destroy')
        ->middleware('permission:rentals.delete');
    Route::post('extensions/{extension}/approve', [RentalExtensionController::class, 'approve'])
        ->name('extensions.approve')
        ->middleware('permission:rentals.approve');
    Route::post('extensions/{extension}/reject', [RentalExtensionController::class, 'reject'])
        ->name('extensions.reject')
        ->middleware('permission:rentals.approve');


    // Routes from rental_timesheets.php

    Route::middleware(['permission:rental-timesheets.view'])->group(function () {
        Route::get('rental-timesheets', [RentalTimesheetController::class, 'index'])->name('rental-timesheets.index');
        Route::get('rental-timesheets/{rentalTimesheet}', [RentalTimesheetController::class, 'show'])->name('rental-timesheets.show');
        Route::get('rentals/{rental}/timesheets', [RentalTimesheetController::class, 'forRental'])->name('timesheets');
        Route::get('rentals/{rental}/check-missing-timesheets', [RentalTimesheetController::class, 'checkMissingTimesheets'])
            ->name('rental-timesheets.check-missing');
        Route::get('rentals/{rental}/check-operator-availability', [RentalTimesheetController::class, 'checkOperatorAvailability'])
            ->name('rental-timesheets.check-operator-availability');
    });

    // Routes from rentals.php - Basic CRUD handled by resource route above

    // Report and print routes
    Route::get('rentals-report', [RentalController::class, 'report'])
        ->name('report')
        ->middleware('permission:rentals.view');

    Route::get('rentals/{rental}/print', [RentalController::class, 'print'])
        ->name('print')
        ->middleware('permission:rentals.view');

    // Workflow action routes - using RentalWorkflowController

    Route::post('rentals/{rental}/generate-quotation', [RentalWorkflowController::class, 'generateQuotation']);
    Route::get('rentals/{rental}/direct-generate-quotation', [RentalWorkflowController::class, 'directGenerateQuotation']);
    Route::post('rentals/{rental}/approve-quotation', [RentalWorkflowController::class, 'approveQuotation']);
    Route::post('rentals/{rental}/start-mobilization', [RentalWorkflowController::class, 'startMobilization']);
    Route::post('rentals/{rental}/complete-mobilization', [RentalWorkflowController::class, 'completeMobilization']);
    Route::post('rentals/{rental}/start', [RentalWorkflowController::class, 'start']);
    Route::post('rentals/{rental}/complete', [RentalWorkflowController::class, 'complete']);
    Route::post('rentals/{rental}/create-invoice', [RentalWorkflowController::class, 'createInvoice']);
    Route::post('rentals/{rental}/mark-payment-pending', [RentalWorkflowController::class, 'markPaymentPending']);
    Route::post('rentals/{rental}/mark-closed', [RentalWorkflowController::class, 'markClosed']);
    Route::post('rentals/{rental}/check-overdue', [RentalWorkflowController::class, 'checkOverdue']);
    Route::post('rentals/{rental}/request-extension', [RentalWorkflowController::class, 'requestExtension']);
    Route::post('rentals/{rental}/approve-extension', [RentalWorkflowController::class, 'approveExtension']);
    Route::post('rentals/{rental}/reject-extension', [RentalWorkflowController::class, 'rejectExtension']);

});

