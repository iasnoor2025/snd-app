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
use Modules\RentalManagement\Http\Controllers\RentalWorkflowController;
use Modules\RentalManagement\Http\Controllers\RentalHistoryController;
use Modules\RentalManagement\Http\Controllers\ReportingDashboardController;

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

Route::middleware(['web', 'auth'])->group(function () {
    // Rental routes (main CRUD) - restored proper route
    Route::get('rentals', [RentalController::class, 'index'])->name('rentals.index');

    // Rental routes (main CRUD)
    Route::get('rentals/create', [RentalController::class, 'create'])->name('rentals.create')->middleware('permission:rentals.view');
    Route::post('rentals', [RentalController::class, 'store'])->name('rentals.store')->middleware('permission:rentals.view');
    Route::get('rentals/{rental}', [RentalController::class, 'show'])->name('rentals.show')->middleware('permission:rentals.view');
    Route::get('rentals/{rental}/edit', [RentalController::class, 'edit'])->name('rentals.edit')->middleware('permission:rentals.view');
    Route::put('rentals/{rental}', [RentalController::class, 'update'])->name('rentals.update')->middleware('permission:rentals.view');
    Route::delete('rentals/{rental}', [RentalController::class, 'destroy'])->name('rentals.destroy')->middleware('permission:rentals.view');

    // Customer routes
    Route::resource('customers', CustomerController::class)
        ->names([
            'index' => 'rentals.customers.index',
            'create' => 'rentals.customers.create',
            'store' => 'rentals.customers.store',
            'show' => 'rentals.customers.show',
            'edit' => 'rentals.customers.edit',
            'update' => 'rentals.customers.update',
            'destroy' => 'rentals.customers.destroy',
        ])
        ->middleware(['permission:customers.view']);
    Route::get('customers-report', [CustomerController::class, 'report'])
        ->middleware('permission:customers.view')
        ->name('rentals.customers.report');
    Route::get('api/customers', [CustomerController::class, 'getCustomers'])
        ->middleware('permission:customers.view')
        ->name('rentals.api.customers');

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
    Route::post('quotations/{quotation}/email', [QuotationController::class, 'sendEmail'])
        ->name('quotations.email')
        ->middleware('permission:quotations.view');

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
    Route::get('rentals/{rental}/direct-generate-quotation', [RentalWorkflowController::class, 'directGenerateQuotation'])
        ->name('rentals.direct-generate-quotation');
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
    Route::post('rentals/{rental}/cancel', [RentalWorkflowController::class, 'cancelRental'])->name('rentals.cancel');
    Route::post('rentals/{rental}/reject-extension/{extensionId}', [RentalWorkflowController::class, 'rejectExtension'])->name('rentals.reject-extension');

});

