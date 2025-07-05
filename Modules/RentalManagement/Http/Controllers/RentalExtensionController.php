<?php

namespace Modules\RentalManagement\Http\Controllers;

use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Domain\Models\RentalExtension;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Carbon;

class RentalExtensionController extends Controller
{
    /**
     * Display a listing of the extensions.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', RentalExtension::class);

        $query = RentalExtension::with(['rental.client', 'approver'])
            ->orderByDesc('created_at');

        // Apply filters
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->whereHas('rental', function ($q) use ($search) {
                $q->where('rental_number', 'like', "%{$search}%")
                  ->orWhereHas('client', function ($q2) use ($search) {
                      $q2->where('company_name', 'like', "%{$search}%");
                  });
            });
        }

        $extensions = $query->paginate(10)
            ->withQueryString()
            ->through(fn ($extension) => [
                'id' => $extension->id,
                'rental_id' => $extension->rental_id,
                'rental_number' => $extension->rental->rental_number,
                'client_name' => $extension->rental->customer->company_name,
                'previous_end_date' => $extension->previous_end_date->format('Y-m-d'),
                'new_end_date' => $extension->new_end_date->format('Y-m-d'),
                'duration_days' => $extension->duration_days,
                'status' => $extension->status,
                'created_at' => $extension->created_at?->format('Y-m-d H:i:s')->format('Y-m-d H:i:s'),
                'approver' => $extension->approver ? [
                    'id' => $extension->approver->id,
                    'name' => $extension->approver->name,
                ] : null,
                'approved_at' => $extension->approved_at ? $extension->approved_at->format('Y-m-d H:i:s') : null,
            ]);

        return Inertia::render('Extensions/Index', [
            'extensions' => $extensions,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    /**
     * Show the form for creating a new extension.
     */
    public function create(Request $request)
    {
        $this->authorize('create', RentalExtension::class);

        // Get the rental if a rental_id is provided
        $rental = null;
        if ($request->has('rental_id')) {
            $rental = Rental::with('client')->findOrFail($request->rental_id);
        }

        // If no rental is provided, redirect to rentals list
        if (!$rental) {
            return Redirect::route('rentals.index');
        }

        return Inertia::render('Extensions/Create', [
            'rental' => [
                'id' => $rental->id,
                'rental_number' => $rental->rental_number,
                'client' => [
                    'id' => $rental->customer->id,
                    'company_name' => $rental->customer->company_name,
                ],
                'start_date' => $rental->start_date?->format('Y-m-d')->format('Y-m-d'),
                'expected_end_date' => $rental->expected_end_date->format('Y-m-d'),
                'status' => $rental->status,
            ],
        ]);
    }

    /**
     * Store a newly created extension in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', RentalExtension::class);

        // Validate the request
        $validated = $request->validate([
            'rental_id' => 'required|exists:rentals,id',
            'new_end_date' => 'required|date|after:today',
            'reason' => 'required|string|min:10',
            'keep_operators' => 'boolean',
            'additional_equipment' => 'nullable|array',
        ]);

        // Get the rental
        $rental = Rental::findOrFail($validated['rental_id']);

        // Create the extension
        $extension = new RentalExtension([
            'rental_id' => $rental->id,
            'previous_end_date' => $rental->expected_end_date,
            'new_end_date' => $validated['new_end_date'],
            'reason' => $validated['reason'],
            'keep_operators' => $validated['keep_operators'] ?? true,
            'additional_equipment' => $validated['additional_equipment'] ?? null,
            'status' => 'pending',
        ]);

        $extension->save();

        return Redirect::route('extensions.show', $extension->id)
            ->with('success', 'Extension request submitted successfully.');
    }

    /**
     * Display the specified extension.
     */
    public function show(RentalExtension $extension)
    {
        $this->authorize('view', $extension);

        $extension->load(['rental.client', 'approver']);

        return Inertia::render('Extensions/Show', [
            'extension' => [
                'id' => $extension->id,
                'rental_id' => $extension->rental_id,
                'rental_number' => $extension->rental->rental_number,
                'client' => [
                    'id' => $extension->rental->customer->id,
                    'company_name' => $extension->rental->customer->company_name,
                ],
                'previous_end_date' => $extension->previous_end_date->format('Y-m-d'),
                'new_end_date' => $extension->new_end_date->format('Y-m-d'),
                'duration_days' => $extension->duration_days,
                'reason' => $extension->reason,
                'keep_operators' => $extension->keep_operators,
                'additional_equipment' => $extension->additional_equipment,
                'status' => $extension->status,
                'created_at' => $extension->created_at?->format('Y-m-d H:i:s')->format('Y-m-d H:i:s'),
                'approver' => $extension->approver ? [
                    'id' => $extension->approver->id,
                    'name' => $extension->approver->name,
                ] : null,
                'approved_at' => $extension->approved_at ? $extension->approved_at->format('Y-m-d H:i:s') : null,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified extension.
     */
    public function edit(RentalExtension $extension)
    {
        $this->authorize('update', $extension);

        $extension->load(['rental.client']);

        return Inertia::render('Extensions/Edit', [
            'extension' => [
                'id' => $extension->id,
                'rental_id' => $extension->rental_id,
                'rental_number' => $extension->rental->rental_number,
                'client' => [
                    'id' => $extension->rental->customer->id,
                    'company_name' => $extension->rental->customer->company_name,
                ],
                'previous_end_date' => $extension->previous_end_date->format('Y-m-d'),
                'new_end_date' => $extension->new_end_date->format('Y-m-d'),
                'reason' => $extension->reason,
                'keep_operators' => $extension->keep_operators,
                'additional_equipment' => $extension->additional_equipment,
                'status' => $extension->status,
            ],
        ]);
    }

    /**
     * Update the specified extension in storage.
     */
    public function update(Request $request, RentalExtension $extension)
    {
        $this->authorize('update', $extension);

        // Can only update pending extensions
        if ($extension->status !== 'pending') {
            return Redirect::back()->with('error', 'Cannot update an extension that is already approved or rejected.');
        }

        // Validate the request
        $validated = $request->validate([
            'new_end_date' => 'required|date|after:today',
            'reason' => 'required|string|min:10',
            'keep_operators' => 'boolean',
            'additional_equipment' => 'nullable|array',
        ]);

        $extension->update([
            'new_end_date' => $validated['new_end_date'],
            'reason' => $validated['reason'],
            'keep_operators' => $validated['keep_operators'] ?? true,
            'additional_equipment' => $validated['additional_equipment'] ?? null
        ]);

        return Redirect::route('extensions.show', $extension->id)
            ->with('success', 'Extension request updated successfully.');
    }

    /**
     * Remove the specified extension from storage.
     */
    public function destroy(RentalExtension $extension)
    {
        $this->authorize('delete', $extension);

        // Can only delete pending extensions
        if ($extension->status !== 'pending') {
            return Redirect::back()->with('error', 'Cannot delete an extension that is already approved or rejected.');
        }

        $extension->delete();

        return Redirect::route('extensions.index')
            ->with('success', 'Extension request deleted successfully.');
    }

    /**
     * Approve the specified extension.
     */
    public function approve(Request $request, RentalExtension $extension)
    {
        $this->authorize('approve', $extension);

        // Can only approve pending extensions
        if ($extension->status !== 'pending') {
            return Redirect::back()->with('error', 'This extension has already been processed.');
        }

        // Update the extension
        $extension->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        // Update the rental's expected end date
        $rental = $extension->rental;
        $rental->update([
            'expected_end_date' => $extension->new_end_date
        ]);

        // Check if the request wants to create a timesheet after approval
        if ($request->has('create_timesheet') && $request->create_timesheet) {
            return Redirect::route('timesheets.create', [
                'include_rentals' => true,
                'rental_id' => $extension->rental_id
            ])->with('success', 'Extension request approved successfully. Create a timesheet for this rental.');
        }

        return Redirect::route('extensions.show', $extension->id)
            ->with('success', 'Extension request approved successfully.');
    }

    /**
     * Reject the specified extension.
     */
    public function reject(Request $request, RentalExtension $extension)
    {
        $this->authorize('approve', $extension);

        // Can only reject pending extensions
        if ($extension->status !== 'pending') {
            return Redirect::back()->with('error', 'This extension has already been processed.');
        }

        // Validate rejection reason
        $validated = $request->validate([
            'rejection_reason' => 'required|string|min:5'
        ]);

        // Update the extension
        $extension->update([
            'status' => 'rejected',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'rejection_reason' => $validated['rejection_reason']
        ]);

        return Redirect::route('extensions.show', $extension->id)
            ->with('success', 'Extension request rejected.');
    }
}




