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
}

