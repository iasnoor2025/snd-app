<?php

namespace Modules\RentalManagement\Http\Controllers;

use Modules\RentalManagement\Domain\Models\Rental;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Enums\RentalStatus;
use Modules\RentalManagement\Actions\GenerateQuotationAction;
use App\Actions\Rental\StartRentalAction;
use App\Actions\Rental\CompleteRentalAction;
use App\Actions\Rental\ApproveQuotationAction;
use App\Actions\Rental\StartMobilizationAction;
use App\Actions\Rental\CompleteMobilizationAction;
use App\Actions\Rental\CreateInvoiceAction;
use App\Actions\Rental\RequestExtensionAction;
use Modules\RentalManagement\Actions\RentalStatusUpdateAction;
use Modules\RentalManagement\Actions\CheckOverdueStatusAction;
use App\Http\Requests\Rental\RequestExtensionRequest;

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
    public function generateQuotation(Rental $rental, GenerateQuotationAction $action)
    {
        try {
            $quotation = $action->execute($rental);

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
    public function directGenerateQuotation(Rental $rental, GenerateQuotationAction $action)
    {
        try {
            // Verify that the rental has items
            if ($rental->rentalItems->count() === 0) {
                return redirect()->route('rentals.show', $rental->id)
                    ->with('error', 'Cannot generate quotation: Rental has no items. Please add items first.');
            }

            // Generate the quotation with the action
            $quotation = $action->execute($rental);

            // Update rental status if needed
            if ($rental->status === RentalStatus::PENDING) {
                $rental->update(['status' => RentalStatus::QUOTATION->value]);
            }

            return redirect()->route('quotations.show', $quotation)
                ->with('success', 'Quotation generated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to generate quotation', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('rentals.show', $rental->id)
                ->with('error', 'Failed to generate quotation: ' . $e->getMessage());
        }
    }

    /**
     * Approve a quotation.
     */
    public function approveQuotation(Rental $rental, ApproveQuotationAction $action)
    {
        try {
            $rental = $action->execute($rental, auth()->id());

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
    public function startMobilization(Rental $rental)
    {
        try {
            $rental = $this->statusUpdateAction->execute(
                $rental,
                RentalStatus::MOBILIZATION,
                auth()->id()
            );

            return redirect()->route('rentals.show', $rental)
                ->with('success', 'Mobilization started successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to start mobilization', [
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
    public function completeMobilization(Rental $rental)
    {
        try {
            $rental = $this->statusUpdateAction->execute(
                $rental,
                RentalStatus::MOBILIZATION_COMPLETED,
                auth()->id()
            );

            return redirect()->route('rentals.show', $rental)
                ->with('success', 'Mobilization completed successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to complete mobilization', [
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
    public function startRental(Rental $rental, StartRentalAction $action)
    {
        try {
            $rental = $action->execute($rental, auth()->id());

            return redirect()->route('rentals.show', $rental)
                ->with('success', 'Rental started successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to start rental', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to start rental: ' . $e->getMessage());
        }
    }

    /**
     * Complete a rental.
     */
    public function completeRental(Rental $rental, CompleteRentalAction $action)
    {
        try {
            $rental = $action->execute($rental, auth()->id());

            return redirect()->route('rentals.show', $rental)
                ->with('success', 'Rental completed successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to complete rental', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to complete rental: ' . $e->getMessage());
        }
    }

    /**
     * Create an invoice for a rental.
     */
    public function createInvoice(Rental $rental, CreateInvoiceAction $action)
    {
        try {
            $invoice = $action->execute($rental);

            return redirect()->route('invoices.show', $invoice)
                ->with('success', 'Invoice created successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to create invoice', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

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

            return redirect()->route('rentals.show', $rental)
                ->with('success', 'Extension request submitted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to request extension', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to request extension: ' . $e->getMessage());
        }
    }

    /**
     * Manually check and update the rental's overdue status.
     */
    public function checkOverdueStatus(Rental $rental)
    {
        try {
            $result = $this->checkOverdueAction->execute($rental);

            $message = match ($result) {
                'became_overdue' => 'Rental has been marked as overdue.',
                'no_longer_overdue' => 'Rental is no longer overdue.',
                default => 'Overdue status is unchanged.',
            };

            return redirect()->route('rentals.show', $rental)
                ->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Failed to check overdue status', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to check overdue status: ' . $e->getMessage());
        }
    }

    /**
     * Cancel a rental at any stage.
     */
    public function cancelRental(Rental $rental)
    {
        try {
            $rental->update(['status' => 'cancelled']);
            // Optionally log the action in status logs
            $rental->statusLogs()->create([
                'status' => 'cancelled',
                'changed_by' => auth()->id(),
                'notes' => 'Rental cancelled by user.'
            ]);
            return redirect()->route('rentals.show', $rental)
                ->with('success', 'Rental cancelled successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to cancel rental', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->with('error', 'Failed to cancel rental: ' . $e->getMessage());
        }
    }

    /**
     * Reject a rental extension request.
     */
    public function rejectExtension(Rental $rental, $extensionId)
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
            return redirect()->route('rentals.show', $rental)
                ->with('success', 'Extension request rejected successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to reject extension', [
                'rental_id' => $rental->id,
                'extension_id' => $extensionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->with('error', 'Failed to reject extension: ' . $e->getMessage());
        }
    }
}


