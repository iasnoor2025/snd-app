<?php

namespace Modules\RentalManagement\Http\Controllers;

use Modules\RentalManagement\Domain\Models\Rental;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Modules\RentalManagement\Actions\GenerateQuotationAction;
use Modules\RentalManagement\Actions\StartRentalAction;
use Modules\RentalManagement\Actions\CompleteRentalAction;
use Modules\RentalManagement\Actions\ApproveQuotationAction;
use Modules\RentalManagement\Actions\StartMobilizationAction;
use Modules\RentalManagement\Actions\CompleteMobilizationAction;
use Modules\RentalManagement\Actions\CreateInvoiceAction;
use Modules\RentalManagement\Actions\RequestExtensionAction;
use Modules\RentalManagement\Actions\RentalStatusUpdateAction;
use Modules\RentalManagement\Actions\CheckOverdueStatusAction;
use Modules\RentalManagement\Http\Requests\Rental\RequestExtensionRequest;

class RentalWorkflowController extends Controller
{
    protected $statusUpdateAction;
    protected $checkOverdueAction;

    public function __construct(
        RentalStatusUpdateAction $statusUpdateAction,
        CheckOverdueStatusAction $checkOverdueAction
    ) {
        $this->statusUpdateAction = $statusUpdateAction;
        $this->checkOverdueAction = $checkOverdueAction;

        // Apply authorization middleware
        $this->middleware('can:rentals.edit')->except(['requestExtension']);
        $this->middleware('can:request-extension,rental')->only(['requestExtension']);
    }

    /**
     * Generate a quotation from a rental.
     */
    public function generateQuotation(Request $request, Rental $rental, GenerateQuotationAction $action)
    {
        try {
            $quotation = $action->execute($rental);

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('quotations.show', $quotation));
            }

            return redirect()->route('quotations.show', $quotation)
                ->with('success', 'Quotation generated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to generate quotation', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to generate quotation: ' . $e->getMessage());
        }
    }

    /**
     * Generate a quotation from a rental with direct response.
     */
    public function directGenerateQuotation(Request $request, Rental $rental, GenerateQuotationAction $action)
    {
        try {
            // Verify that the rental has items
            if ($rental->rentalItems->count() === 0) {
                if ($request->wantsJson() || $request->header('X-Inertia')) {
                    return \Inertia\Inertia::location(route('rentals.show', $rental->id));
                }

                return redirect()->route('rentals.show', $rental->id)
                    ->with('error', 'Cannot generate quotation: Rental has no items. Please add items first.');
            }

            // Generate the quotation with the action
            $quotation = $action->execute($rental);

            // Update rental status if needed
            if ($rental->status === 'pending') {
                $rental->update(['status' => 'quotation']);
            }

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('quotations.show', $quotation));
            }

            return redirect()->route('quotations.show', $quotation)
                ->with('success', 'Quotation generated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to generate quotation', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('rentals.show', $rental->id));
            }

            return redirect()->route('rentals.show', $rental->id)
                ->with('error', 'Failed to generate quotation: ' . $e->getMessage());
        }
    }

    /**
     * Approve a quotation.
     */
    public function approveQuotation(Request $request, Rental $rental, ApproveQuotationAction $action)
    {
        try {
            $rental = $action->execute($rental, auth()->id());

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('rentals.show', $rental));
            }

            return redirect()->route('rentals.show', $rental)
                ->with('success', 'Quotation approved successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to approve quotation', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to approve quotation: ' . $e->getMessage());
        }
    }

    /**
     * Start mobilization for a rental.
     */
    public function startMobilization(Request $request, Rental $rental)
    {
        try {
            $rental = $this->statusUpdateAction->execute(
                $rental,
                'mobilization',
                []
            );

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('rentals.show', $rental));
            }

            return redirect()->route('rentals.show', $rental)
                ->with('success', 'Mobilization started successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to start mobilization', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to start mobilization: ' . $e->getMessage());
        }
    }

    /**
     * Complete mobilization for a rental.
     */
    public function completeMobilization(Request $request, Rental $rental)
    {
        try {
            $rental = $this->statusUpdateAction->execute(
                $rental,
                'mobilization_completed',
                []
            );

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('rentals.show', $rental));
            }

            return redirect()->route('rentals.show', $rental)
                ->with('success', 'Mobilization completed successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to complete mobilization', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to complete mobilization: ' . $e->getMessage());
        }
    }

    /**
     * Start a rental.
     */
    public function startRental(Request $request, Rental $rental, StartRentalAction $action)
    {
        try {
            $rental = $action->execute($rental, auth()->id());

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('rentals.show', $rental));
            }

            return redirect()->route('rentals.show', $rental)
                ->with('success', 'Rental started successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to start rental', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('rentals.show', $rental));
            }

            return back()->with('error', 'Failed to start rental: ' . $e->getMessage());
        }
    }

    /**
     * Complete a rental.
     */
    public function completeRental(Request $request, Rental $rental, CompleteRentalAction $action)
    {
        try {
            $rental = $action->execute($rental, auth()->id());

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('rentals.show', $rental));
            }

            return redirect()->route('rentals.show', $rental)
                ->with('success', 'Rental completed successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to complete rental', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('rentals.show', $rental));
            }

            return back()->with('error', 'Failed to complete rental: ' . $e->getMessage());
        }
    }

    /**
     * Create an invoice for a rental.
     */
    public function createInvoice(Request $request, Rental $rental, CreateInvoiceAction $action)
    {
        try {
            $invoice = $action->execute($rental);

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('invoices.show', $invoice));
            }

            return redirect()->route('invoices.show', $invoice)
                ->with('success', 'Invoice created successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to create invoice', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('rentals.show', $rental));
            }

            return back()->with('error', 'Failed to create invoice: ' . $e->getMessage());
        }
    }

    /**
     * Request an extension for a rental.
     */
    public function requestExtension(RequestExtensionRequest $request, Rental $rental, RequestExtensionAction $action)
    {
        try {
            $extensionRequest = $action->execute($rental, $request->validated(), auth()->id());

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('rentals.show', $rental));
            }

            return redirect()->route('rentals.show', $rental)
                ->with('success', 'Extension request submitted successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to request extension', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('rentals.show', $rental));
            }

            return back()->with('error', 'Failed to request extension: ' . $e->getMessage());
        }
    }

    /**
     * Manually check and update the rental's overdue status.
     */
    public function checkOverdueStatus(Request $request, Rental $rental)
    {
        try {
            $result = $this->checkOverdueAction->execute($rental);

            $message = match ($result) {
                'became_overdue' => 'Rental has been marked as overdue.',
                'no_longer_overdue' => 'Rental is no longer overdue.',
                default => 'Overdue status is unchanged.',
            };

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('rentals.show', $rental));
            }

            return redirect()->route('rentals.show', $rental)
                ->with('success', $message);
        } catch (\Exception $e) {
            \Log::error('Failed to check overdue status', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('rentals.show', $rental));
            }

            return back()->with('error', 'Failed to check overdue status: ' . $e->getMessage());
        }
    }

    /**
     * Cancel a rental at any stage.
     */
    public function cancelRental(Request $request, Rental $rental)
    {
        try {
            $rental->update(['status' => 'cancelled']);
            // Optionally log the action in status logs
            $rental->statusLogs()->create([
                'status' => 'cancelled',
                'changed_by' => auth()->id(),
                'notes' => 'Rental cancelled by user.'
            ]);

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('rentals.show', $rental));
            }

            return redirect()->route('rentals.show', $rental)
                ->with('success', 'Rental cancelled successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to cancel rental', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('rentals.show', $rental));
            }

            return back()->with('error', 'Failed to cancel rental: ' . $e->getMessage());
        }
    }

    /**
     * Reject a rental extension request.
     */
    public function rejectExtension(Request $request, Rental $rental, $extensionId)
    {
        try {
            $extension = $rental->extensionRequests()->findOrFail($extensionId);
            $extension->update(['status' => 'rejected']);
            // Optionally log the action in status logs
            $rental->statusLogs()->create([
                'status' => 'extension_rejected',
                'changed_by' => auth()->id(),
                'notes' => 'Extension request rejected.'
            ]);

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('rentals.show', $rental));
            }

            return redirect()->route('rentals.show', $rental)
                ->with('success', 'Extension request rejected successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to reject extension', [
                'rental_id' => $rental->id,
                'extension_id' => $extensionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return \Inertia\Inertia::location(route('rentals.show', $rental));
            }

            return back()->with('error', 'Failed to reject extension: ' . $e->getMessage());
        }
    }
}


