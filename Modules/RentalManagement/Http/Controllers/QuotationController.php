<?php

namespace Modules\RentalManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Modules\CustomerManagement\Domain\Models\Customer;
use Modules\RentalManagement\Domain\Models\Quotation;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EmployeeManagement\Domain\Models\Employee;

class QuotationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Quotation::with([
                'customer:id,company_name',
                'quotationItems' => function ($query) {
                    $query->with(['equipment:id,name']);
                }
            ]);

            // Apply filters
            if ($request->has('search') && !empty($request->input('search'))) {
                $search = $request->input('search');
                $query->where(function($q) use ($search) {
                    $q->where('quotation_number', 'like', "%{$search}%")
                      ->orWhereHas('customer', function ($q) use ($search) {
                          $q->where('company_name', 'like', "%{$search}%");
                      });
                });
            }

            if ($request->has('status') && !empty($request->input('status'))) {
                $query->where('status', $request->input('status'));
            }

            if ($request->has('start_date') && !empty($request->input('start_date'))) {
                $query->whereDate('issue_date', '>=', $request->input('start_date'));
            }

            if ($request->has('end_date') && !empty($request->input('end_date'))) {
                $query->whereDate('valid_until', '<=', $request->input('end_date'));
            }

            $quotations = $query->latest()->paginate(10)
                ->withQueryString();

            return Inertia::render('Quotations/Index', [
                'quotations' => $quotations,
                'filters' => $request->only(['search', 'status', 'start_date', 'end_date'])
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in QuotationController@index', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'An error occurred while loading quotations. Please try again later.');
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $customers = Customer::orderBy('company_name')->get();
        $equipment = Equipment::orderBy('name')->get();
        $operators = Employee::where('is_operator', true)->orderBy('name')->get();
        $drivers = Employee::where('is_driver', true)->orderBy('name')->get();

        return Inertia::render('Quotations/Create', [
            'customers' => $customers,
            'equipment' => $equipment,
            'operators' => [
                'operators' => $operators,
                'drivers' => $drivers
            ],
            'taxRate' => config('app.tax_rate', 15),
            'nextQuotationNumber' => Quotation::generateQuotationNumber(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the request data
        $validatedData = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'quotation_number' => 'required|string|unique:quotations,quotation_number',
            'issue_date' => 'required|date',
            'valid_until' => 'required|date|after_or_equal:issue_date',
            'status' => 'required|string|in:draft,sent,approved,rejected,expired',
            'subtotal' => 'required|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_percentage' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'terms_and_conditions' => 'nullable|string',
            'quotation_items' => 'required|array|min:1',
            'quotation_items.*.equipment_id' => 'required|exists:equipment,id',
            'quotation_items.*.operator_id' => 'nullable|exists:employees,id',
            'quotation_items.*.description' => 'nullable|string',
            'quotation_items.*.quantity' => 'required|integer|min:1',
            'quotation_items.*.rate' => 'required|numeric|min:0',
            'quotation_items.*.rate_type' => 'required|string|in:hourly,daily,weekly,monthly',
            'quotation_items.*.total_amount' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Create the quotation
            $quotation = new Quotation();
            $quotation->customer_id = $validatedData['customer_id'];
            $quotation->quotation_number = $validatedData['quotation_number'];
            $quotation->issue_date = $validatedData['issue_date'];
            $quotation->valid_until = $validatedData['valid_until'];
            $quotation->status = $validatedData['status'];
            $quotation->subtotal = $validatedData['subtotal'];
            $quotation->discount_percentage = $validatedData['discount_percentage'] ?? 0;
            $quotation->discount_amount = $validatedData['discount_amount'] ?? 0;
            $quotation->tax_percentage = $validatedData['tax_percentage'] ?? 0;
            $quotation->tax_amount = $validatedData['tax_amount'] ?? 0;
            $quotation->total_amount = $validatedData['total_amount'];
            $quotation->notes = $validatedData['notes'] ?? '';
            $quotation->terms_and_conditions = $validatedData['terms_and_conditions'] ?? $this->getDefaultTerms();
            $quotation->created_by = Auth::id();
            $quotation->is_separate = true;
            $quotation->save();

            // Create quotation items
            foreach ($validatedData['quotation_items'] as $itemData) {
                $quotation->quotationItems()->create([
                    'equipment_id' => $itemData['equipment_id'],
                    'operator_id' => $itemData['operator_id'] ?? null,
                    'description' => $itemData['description'] ?? null,
                    'quantity' => $itemData['quantity'],
                    'rate' => $itemData['rate'],
                    'rate_type' => $itemData['rate_type'],
                    'total_amount' => $itemData['total_amount']
                ]);
            }

            // Handle documents if any
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $index => $file) {
                    $documentName = $request->input('document_names.' . $index, 'Document ' . ($index + 1));
                    $quotation->addMedia($file)
                        ->usingName($documentName)
                        ->toMediaCollection('documents');
                }
            }

            DB::commit();

            return redirect()->route('quotations.show', $quotation)
                ->with('success', 'Quotation created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create quotation', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()
                ->with('error', 'An error occurred while creating the quotation: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Quotation $quotation)
    {
        // Check if quotation is expired and update status if needed
        if ($quotation->valid_until < now() && $quotation->status !== 'approved') {
            $quotation->status = 'expired';
            $quotation->save();
        }

        // Load related data
        $quotation->load([
            'customer',
            'quotationItems.equipment',
            'quotationItems.operator',
            'rental'
        ]);

        return Inertia::render('Quotations/Show', [
            'quotation' => $quotation,
            'quotationItems' => [
                'data' => $quotation->quotationItems,
                'total' => $quotation->quotationItems->count(),
            ],
            'canApprove' => Auth::user()->can('approve', $quotation),
            'canReject' => Auth::user()->can('reject', $quotation),
            'canEdit' => Auth::user()->can('update', $quotation),
            'canDelete' => Auth::user()->can('delete', $quotation),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Quotation $quotation)
    {
        try {
            // Prevent editing approved or rejected quotations
            if (in_array($quotation->status, ['approved', 'rejected'])) {
                return redirect()->route('quotations.show', $quotation)
                    ->with('error', 'Approved or rejected quotations cannot be updated.');
            }

            // Load related data
            $quotation->load([
                'customer',
                'quotationItems.equipment',
                'quotationItems.operator'
            ]);

            $customers = Customer::orderBy('company_name')->get();
            $equipment = Equipment::orderBy('name')->get();
            $operators = Employee::where('is_operator', true)->orderBy('name')->get();

            return Inertia::render('Quotations/Edit', [
                'quotation' => $quotation,
                'customers' => $customers,
                'equipment' => $equipment,
                'operators' => $operators,
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading quotation edit form', [
                'quotation_id' => $quotation->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('quotations.index')
                ->with('error', 'Failed to load quotation edit form: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Quotation $quotation)
    {
        // Validate the request data
        $validatedData = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'quotation_number' => 'required|string|unique:quotations,quotation_number,' . $quotation->id,
            'issue_date' => 'required|date',
            'valid_until' => 'required|date|after_or_equal:issue_date',
            'status' => 'required|string|in:draft,sent,approved,rejected,expired',
            'subtotal' => 'required|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_percentage' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'terms_and_conditions' => 'nullable|string',
            'quotation_items' => 'required|array|min:1',
            'quotation_items.*.id' => 'nullable|exists:quotation_items,id',
            'quotation_items.*.equipment_id' => 'required|exists:equipment,id',
            'quotation_items.*.operator_id' => 'nullable|exists:employees,id',
            'quotation_items.*.description' => 'nullable|string',
            'quotation_items.*.quantity' => 'required|integer|min:1',
            'quotation_items.*.rate' => 'required|numeric|min:0',
            'quotation_items.*.rate_type' => 'required|string|in:hourly,daily,weekly,monthly',
            'quotation_items.*.total_amount' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Update the quotation
            $quotation->update([
                'customer_id' => $validatedData['customer_id'],
                'quotation_number' => $validatedData['quotation_number'],
                'issue_date' => $validatedData['issue_date'],
                'valid_until' => $validatedData['valid_until'],
                'status' => $validatedData['status'],
                'subtotal' => $validatedData['subtotal'],
                'discount_percentage' => $validatedData['discount_percentage'] ?? 0,
                'discount_amount' => $validatedData['discount_amount'] ?? 0,
                'tax_percentage' => $validatedData['tax_percentage'] ?? 0,
                'tax_amount' => $validatedData['tax_amount'] ?? 0,
                'total_amount' => $validatedData['total_amount'],
                'notes' => $validatedData['notes'] ?? '',
                'terms_and_conditions' => $validatedData['terms_and_conditions'] ?? $quotation->terms_and_conditions
            ]);

            // Update quotation items
            $existingItemIds = [];

            foreach ($validatedData['quotation_items'] as $itemData) {
                if (isset($itemData['id'])) {
                    // Update existing item
                    $quotation->quotationItems()->where('id', $itemData['id'])->update([
                        'equipment_id' => $itemData['equipment_id'],
                        'operator_id' => $itemData['operator_id'] ?? null,
                        'description' => $itemData['description'] ?? null,
                        'quantity' => $itemData['quantity'],
                        'rate' => $itemData['rate'],
                        'rate_type' => $itemData['rate_type'],
                        'total_amount' => $itemData['total_amount']
                    ]);
                    $existingItemIds[] = $itemData['id'];
                } else {
                    // Create new item
                    $item = $quotation->quotationItems()->create([
                        'equipment_id' => $itemData['equipment_id'],
                        'operator_id' => $itemData['operator_id'] ?? null,
                        'description' => $itemData['description'] ?? null,
                        'quantity' => $itemData['quantity'],
                        'rate' => $itemData['rate'],
                        'rate_type' => $itemData['rate_type'],
                        'total_amount' => $itemData['total_amount']
                    ]);
                    $existingItemIds[] = $item->id;
                }
            }

            // Delete items not in the request
            $quotation->quotationItems()->whereNotIn('id', $existingItemIds)->delete();

            // Handle documents if any
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $index => $file) {
                    $documentName = $request->input('document_names.' . $index, 'Document ' . ($index + 1));
                    $quotation->addMedia($file)
                        ->usingName($documentName)
                        ->toMediaCollection('documents');
                }
            }

            DB::commit();

            return redirect()->route('quotations.show', $quotation)
                ->with('success', 'Quotation updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update quotation', [
                'quotation_id' => $quotation->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()
                ->with('error', 'An error occurred while updating the quotation: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Quotation $quotation)
    {
        try {
            // Check if the quotation is linked to a rental
            if ($quotation->rental_id) {
                return redirect()->back()
                    ->with('error', 'Cannot delete a quotation that is linked to a rental.');
            }

            DB::beginTransaction();

            // Delete quotation items
            $quotation->quotationItems()->delete();

            // Delete media items
            $quotation->clearMediaCollection('documents');

            // Delete the quotation
            $quotation->delete();

            DB::commit();

            return redirect()->route('quotations.index')
                ->with('success', 'Quotation deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete quotation', [
                'quotation_id' => $quotation->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()
                ->with('error', 'An error occurred while deleting the quotation: ' . $e->getMessage());
        }
    }

    /**
     * Approve the specified quotation.
     */
    public function approve(Request $request, Quotation $quotation)
    {
        // Authorize the action
        $this->authorize('approve', $quotation);

        try {
            // Validate request if needed
            $request->validate([
                'notes' => 'nullable|string'
            ]);

            // Update quotation status
            $quotation->update([
                'status' => 'approved',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);

            return redirect()->route('quotations.show', $quotation)
                ->with('success', 'Quotation approved successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to approve quotation', [
                'quotation_id' => $quotation->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()
                ->with('error', 'Failed to approve quotation: ' . $e->getMessage());
        }
    }

    /**
     * Reject the specified quotation.
     */
    public function reject(Request $request, Quotation $quotation)
    {
        // Authorize the action
        $this->authorize('reject', $quotation);

        try {
            // Validate rejection reason
            $request->validate([
                'notes' => 'required|string|min:5'
            ]);

            // Update quotation status
            $quotation->update([
                'status' => 'rejected',
                'notes' => $request->notes,
            ]);

            return redirect()->route('quotations.show', $quotation)
                ->with('success', 'Quotation rejected successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to reject quotation', [
                'quotation_id' => $quotation->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()
                ->with('error', 'Failed to reject quotation: ' . $e->getMessage());
        }
    }

    /**
     * Get default terms and conditions
     */
    private function getDefaultTerms()
    {
        return "
1. Prices are valid for 30 days from the date of this quotation.
2. All prices are in Saudi Riyals and exclude VAT.
3. Payment terms: 50% advance payment and balance before delivery.
4. Delivery time: Within 7-14 days after receipt of purchase order.
5. Equipment remains the property of the company until payment is received in full.
6. Mobilization and demobilization costs are not included unless specifically stated.
7. Operator charges are separate and not included in the equipment rental rates.
8. The client is responsible for the equipment during the rental period.
9. Cancellation fees may apply for orders canceled within 48 hours of scheduled delivery.
10. The company reserves the right to substitute equipment of equivalent specification if necessary.
        ";
    }

    /**
     * Convert an approved quotation to a rental.
     */
    public function convertToRental(Request $request, Quotation $quotation)
    {
        // Only allow if approved and not already linked
        if ($quotation->status !== 'approved') {
            return redirect()->back()->with('error', 'Only approved quotations can be converted to rentals.');
        }
        if ($quotation->rental_id) {
            return redirect()->back()->with('error', 'This quotation is already linked to a rental.');
        }

        try {
            DB::beginTransaction();

            // Create the rental
            $rental = new Rental();
            $rental->customer_id = $quotation->customer_id;
            $rental->quotation_id = $quotation->id;
            $rental->rental_number = Rental::generateRentalNumber();
            $rental->start_date = $quotation->issue_date;
            $rental->expected_end_date = $quotation->valid_until;
            $rental->status = 'pending';
            $rental->total_amount = $quotation->total_amount;
            $rental->discount_percentage = $quotation->discount_percentage;
            $rental->tax_percentage = $quotation->tax_percentage;
            $rental->notes = $quotation->notes;
            $rental->created_by = Auth::id();
            $rental->save();

            // Copy quotation items to rental items
            foreach ($quotation->quotationItems as $item) {
                $rental->rentalItems()->create([
                    'equipment_id' => $item->equipment_id,
                    'operator_id' => $item->operator_id,
                    'notes' => $item->description,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->rate,
                    'rate_type' => $item->rate_type,
                    'total_amount' => $item->total_amount,
                ]);
            }

            // Link rental to quotation
            $quotation->update(['rental_id' => $rental->id]);

            DB::commit();

            return redirect()->route('rentals.show', $rental)
                ->with('success', 'Rental created successfully from quotation.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to convert quotation to rental', [
                'quotation_id' => $quotation->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'Failed to convert quotation to rental: ' . $e->getMessage());
        }
    }
}




