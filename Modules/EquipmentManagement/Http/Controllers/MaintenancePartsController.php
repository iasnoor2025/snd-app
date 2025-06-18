<?php
namespace Modules\EquipmentManagement\Http\Controllers;

use Modules\EquipmentManagement\Domain\Models\MaintenanceRecord;
use Modules\EquipmentManagement\Domain\Models\Part;
use Modules\EquipmentManagement\Domain\Models\MaintenancePart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MaintenancePartsController extends Controller
{
    /**
     * Store a new part for a maintenance record.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'maintenance_id' => 'required|exists:maintenance_records,id',
            'part_id' => 'required|exists:parts,id',
            'quantity' => 'required|integer|min:1',
        ]);

        // Get the part and maintenance record
        $part = Part::findOrFail($validated['part_id']);
        $maintenanceRecord = MaintenanceRecord::findOrFail($validated['maintenance_id']);

        // Store the maintenance part association
        DB::transaction(function () use ($maintenanceRecord, $part, $validated) {
            // Check if the part is already assigned to this maintenance
            $existingPart = $maintenanceRecord->maintenanceParts()
                ->where('part_id', $part->id)
                ->first();

            if ($existingPart) {
                // Update the quantity if it already exists
                $existingPart->quantity += $validated['quantity'];
                $existingPart->total_cost = $part->unit_cost * $existingPart->quantity;
                $existingPart->save();
            } else {
                // Create a new association
                $maintenanceRecord->maintenanceParts()->create([
                    'part_id' => $part->id,
                    'quantity' => $validated['quantity'],
                    'unit_cost' => $part->unit_cost,
                    'total_cost' => $part->unit_cost * $validated['quantity']
                ]);
            }

            // Update the total cost of the maintenance record
            $this->updateMaintenanceRecordCost($maintenanceRecord);
        });

        return redirect()->back()->with('success', 'Part added to maintenance record successfully.');
    }

    /**
     * Remove a part from a maintenance record.
     */
    public function remove(Request $request, $id, $partId)
    {
        $maintenanceRecord = MaintenanceRecord::findOrFail($id);

        // Find the maintenance part
        $maintenancePart = $maintenanceRecord->maintenanceParts()
            ->where('part_id', $partId)
            ->firstOrFail();

        // Remove the part
        DB::transaction(function () use ($maintenanceRecord, $maintenancePart) {
            $maintenancePart->delete();

            // Update the total cost of the maintenance record
            $this->updateMaintenanceRecordCost($maintenanceRecord);
        });

        return redirect()->back()->with('success', 'Part removed from maintenance record successfully.');
    }

    /**
     * Display parts management page for a maintenance record.
     */
    public function index(MaintenanceRecord $maintenanceRecord)
    {
        // Load the maintenance record with its parts
        $maintenanceRecord->load([
            'equipment',
            'performedBy',
            'maintenanceParts.part',
        ]);

        // Get available parts
        $availableParts = Part::all();

        // Format parts data for the frontend
        $parts = $maintenanceRecord->maintenanceParts->map(function ($maintenancePart) {
            $part = $maintenancePart->part;
            return [
                'id' => $part->id,
                'name' => $part->name,
                'part_number' => $part->part_number,
                'quantity' => $maintenancePart->quantity,
                'unit_cost' => $maintenancePart->unit_cost,
                'total_cost' => $maintenancePart->total_cost,
                'in_stock' => $part->in_stock,
            ];
        });

        // Format available parts for the frontend
        $formattedAvailableParts = $availableParts->map(function ($part) {
            return [
                'id' => $part->id,
                'name' => $part->name,
                'part_number' => $part->part_number,
                'unit_cost' => $part->unit_cost,
                'in_stock' => $part->in_stock,
            ];
        });

        return Inertia::render('Equipment/Maintenance/Parts/Index', [
            'maintenanceRecord' => [
                'id' => $maintenanceRecord->id,
                'equipment_id' => $maintenanceRecord->equipment_id,
                'type' => $maintenanceRecord->type,
                'description' => $maintenanceRecord->description,
                'status' => $maintenanceRecord->status,
                'scheduled_date' => $maintenanceRecord->scheduled_date,
                'performed_date' => $maintenanceRecord->performed_date,
                'performed_by' => $maintenanceRecord->performed_by,
                'notes' => $maintenanceRecord->notes,
                'equipment' => $maintenanceRecord->equipment,
                'performedBy' => $maintenanceRecord->performedBy,
                'parts' => $parts,
            ],
            'availableParts' => $formattedAvailableParts,
        ]);
    }

    /**
     * Update the total cost of a maintenance record based on its parts.
     */
    private function updateMaintenanceRecordCost(MaintenanceRecord $maintenanceRecord)
    {
        // Calculate the total cost of parts
        $partsCost = $maintenanceRecord->maintenanceParts()->sum('total_cost');

        // Update the maintenance record cost
        $maintenanceRecord->cost = $partsCost;
        $maintenanceRecord->save();
    }
}