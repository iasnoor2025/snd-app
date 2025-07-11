<?php

namespace Modules\RentalManagement\Http\Controllers;

use Modules\RentalManagement\Domain\Models\RentalItem;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Illuminate\Http\Request;

class RentalItemController extends Controller
{
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RentalItem $rentalItem)
    {
        $validated = $request->validate([
            'equipment_id' => 'required|exists:equipment,id',
            'rate' => 'required|numeric|min:0',
            'rate_type' => 'required|in:hourly,daily,weekly,monthly',
            'operator_id' => 'nullable|exists:employees,id',
            'notes' => 'nullable|string',
        ]);

        // Check if equipment ID is changing
        if ($rentalItem->equipment_id != $validated['equipment_id']) {
            // Set flag to sync equipment ID to associated timesheets
            $validated['needs_equipment_sync'] = true;
        }

        // Get the equipment and map the rate based on rate type
        // Ensure ID is numeric
        if (!is_numeric($validated['equipment_id'])) {
            abort(404, 'Invalid ID provided');
        }
        $equipment = Equipment::find($validated['equipment_id']);
        if ($equipment) {
            $rateField = $validated['rate_type'] . '_rate';
            if (isset($equipment->$rateField)) {
                $validated['rate'] = $equipment->$rateField;
            }
        }

        // Update the rental item
        $rentalItem->update($validated);

        // Update rental's total if rate changes
        if ($request->has('rate')) {
            $rentalItem->rental->updateTotalAmount();
        }

        return back()->with('success', 'Equipment updated successfully.');
    }

    /**
     * Show the form for creating a new rental item.
     */
    public function create(Request $request, $rentalId)
    {
        $rental = \Modules\RentalManagement\Domain\Models\Rental::findOrFail($rentalId);
        $equipment = \Modules\EquipmentManagement\Domain\Models\Equipment::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(function ($item) {
                $name = $item->name;
                if (is_array($name)) {
                    $name = $name['en'] ?? reset($name) ?? '';
                }
                return [
                    'id' => $item->id,
                    'name' => $name,
                ];
            });
        $operators = \Modules\EmployeeManagement\Domain\Models\Employee::where('is_operator', true)
            ->where('status', 'active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name'])
            ->map(function ($op) {
                return [
                    'id' => $op->id,
                    'name' => trim($op->first_name . ' ' . $op->last_name),
                ];
            });
        return inertia('Rentals/Items/Create', [
            'rental' => [
                'id' => $rental->id,
            ],
            'equipment' => $equipment,
            'operators' => $operators,
        ]);
    }

    /**
     * Store a newly created rental item in storage.
     */
    public function store(Request $request, $rentalId)
    {
        $validated = $request->validate([
            'equipment_id' => 'required|exists:equipment,id',
            'operator_id' => 'nullable|exists:employees,id',
            'rate' => 'required|numeric|min:0',
            'rate_type' => 'required|in:hourly,daily,weekly,monthly',
            'days' => 'required|integer|min:1',
            'discount_percentage' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);
        $validated['rental_id'] = $rentalId;
        $rate = $validated['rate'];
        $days = $validated['days'];
        $discount = isset($validated['discount_percentage']) ? $validated['discount_percentage'] : 0;
        $total = $rate * $days * (1 - ($discount / 100));
        $validated['total_amount'] = $total;
        \Modules\RentalManagement\Domain\Models\RentalItem::create($validated);
        return redirect()->route('rentals.show', $rentalId)
            ->with('success', 'Rental item added successfully.');
    }

    /**
     * Mark a rental item as returned.
     */
    public function return(Request $request, RentalItem $rentalItem)
    {
        $validated = $request->validate([
            'return_date' => 'required|date',
            'return_condition' => 'required|string',
        ]);

        $rentalItem->returned_at = $validated['return_date'];
        $rentalItem->return_condition = $validated['return_condition'];
        $rentalItem->save();

        // Optionally, recalculate rental totals
        if ($rentalItem->rental) {
            $rentalItem->rental->updateTotalAmount();
        }

        return response()->json([
            'success' => true,
            'message' => 'Rental item returned successfully',
            'data' => $rentalItem
        ]);
    }
}

