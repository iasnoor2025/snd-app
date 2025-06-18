<?php

namespace Modules\RentalManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Services\RentalService;

class RentalController extends Controller
{
    protected $rentalService;

    public function __construct(RentalService $rentalService)
    {
        $this->rentalService = $rentalService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'start_date', 'end_date', 'page', 'per_page']);
        $perPage = $filters['per_page'] ?? 10;
        $rentals = $this->rentalService->getPaginatedRentals($perPage, $filters);

        return Inertia::render('Rentals/Index', [
            'filters' => $filters,
            'rentals' => $rentals
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Rental/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:pending,active,completed,cancelled',
            'total_amount' => 'required|numeric|min:0',
        ]);

        $this->rentalService->create($validated);

        return redirect()->route('rentals.index')
            ->with('success', 'Rental created successfully.');
    }

    /**
     * Show the specified resource.
     */
    public function show($id)
    {
        $rental = $this->rentalService->findById((int)$id);

        if (!$rental) {
            return redirect()->route('rentals.index')->with('error', 'Rental not found.');
        }

        return Inertia::render('Rentals/Show', [
            'rental' => $rental,
            'equipment' => $rental->equipment,
            'payments' => $rental->payments,
            'timesheets' => $rental->timesheets,
            'customer' => $rental->customer,
            'user' => $rental->user,
            'rental_status' => $rental->status,
            'rental_status_label' => $rental->getStatusLabel(),
            'rental_status_color' => $rental->getStatusColor(),
            'rental_status_color_label' => $rental->getStatusColorLabel(),
            'rental_status_class' => $rental->getStatusClass(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $rental = $this->rentalService->findById($id);
        return Inertia::render('Rentals/Edit', [
            'rental' => $rental
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:pending,active,completed,cancelled',
            'total_amount' => 'required|numeric|min:0',
        ]);

        $this->rentalService->update($id, $validated);

        return redirect()->route('rentals.index')
            ->with('success', 'Rental updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->rentalService->delete($id);
        return redirect()->route('rentals.index')
            ->with('success', 'Rental deleted successfully.');
    }
}


