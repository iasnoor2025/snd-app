<?php

namespace Modules\EquipmentManagement\Http\Controllers;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use Modules\EquipmentManagement\Domain\Models\MaintenancePart;
use Modules\EquipmentManagement\Domain\Models\MaintenanceRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MaintenanceRecordController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $status = $request->input('status');
        $type = $request->input('type');
        $search = $request->input('search');

        $query = MaintenanceRecord::with(['equipment', 'performer', 'approver']);

        if ($status) {
            $query->where('status', $status);
        }

        if ($type) {
            $query->where('type', $type);
        }

        if ($search) {
            $query->whereHas('equipment', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%")
                  ->orWhere('serial_number', 'like', "%{$search}%");
            });
        }

        $maintenanceRecords = $query->latest()->paginate(10);

        // Get all equipment for filter dropdown
        $equipment = Equipment::all();

        return Inertia::render('Maintenance/Index', [
            'maintenanceRecords' => $maintenanceRecords,
            'equipment' => $equipment,
            'filters' => [
                'status' => $status,
                'type' => $type,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // TEMPORARY: Bypass permission check for debugging
        /*
        // Check if user has permission to create maintenance records
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager') && !$user->hasRole('workshop')) {
            return redirect()->route('maintenance.index');
                ->with('error', 'You do not have permission to create maintenance records.');
        }
        */

        $equipment = Equipment::all();
        $employees = Employee::where('status', 'active')->get();
        $inventoryItems = InventoryItem::all();

        return Inertia::render('Maintenance/Create', [
            'equipment' => $equipment,
            'employees' => $employees,
            'inventoryItems' => $inventoryItems,
        ]);
    }

    /**
     * Create a maintenance record for a specific equipment
     */
    public function createForEquipment(Equipment $equipment)
    {
        // TEMPORARY: Bypass permission check for debugging
        /*
        // Check if user has permission to create maintenance records
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager') && !$user->hasRole('workshop')) {
            return redirect()->route('maintenance.index');
                ->with('error', 'You do not have permission to create maintenance records.');
        }
        */

        $employees = Employee::where('status', 'active')->get();
        $inventoryItems = InventoryItem::all();
        $allEquipment = Equipment::all();

        // Debug to verify the equipment ID is properly being passed
        \Log::info('Creating maintenance for equipment', [
            'equipment_id' => $equipment->id,
            'equipment_name' => $equipment->name
        ]);

        // Ensure the equipment ID is properly formatted as a number
        $equipmentId = (int)$equipment->id;

        return Inertia::render('Maintenance/Create', [
            'equipment' => $allEquipment,
            'employees' => $employees,
            'inventoryItems' => $inventoryItems,
            'selectedEquipment' => $equipmentId
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // TEMPORARY: Bypass permission check for debugging
        /*
        // Check if user has permission to create maintenance records
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager') && !$user->hasRole('workshop')) {
            return redirect()->route('maintenance.index');
                ->with('error', 'You do not have permission to create maintenance records.');
        }
        */
        $user = Auth::user();

        $request->validate([
            'equipment_id' => 'required|exists:equipment,id',
            'maintenance_date' => 'required|date',
            'type' => 'required|in:routine,repair,inspection,other',
            'status' => 'required|in:scheduled,in_progress,completed,cancelled',
            'description' => 'required|string',
            'cost' => 'nullable|numeric|min:0',
            'performed_by' => 'nullable|exists:employees,id',
            'next_maintenance_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'parts' => 'nullable|array',
            'parts.*.part_name' => 'required|string|max:255',
            'parts.*.part_number' => 'nullable|string|max:255',
            'parts.*.quantity' => 'required|integer|min:1',
            'parts.*.unit_cost' => 'required|numeric|min:0',
            'parts.*.supplier' => 'nullable|string|max:255',
            'parts.*.inventory_item_id' => 'nullable|exists:inventory_items,id',
        ]);

        DB::beginTransaction();

        try {
            // Create maintenance record
            $maintenanceRecord = MaintenanceRecord::create([
                'equipment_id' => $request->equipment_id,
                'maintenance_date' => $request->maintenance_date,
                'type' => $request->type,
                'status' => $request->status,
                'description' => $request->description,
                'cost' => $request->cost ?? 0,
                'performed_by' => $request->performed_by,
                'approved_by' => $user->isAdmin() || $user->hasRole('manager') ? $user->id : null,
                'next_maintenance_date' => $request->next_maintenance_date,
                'notes' => $request->notes,
            ]);

            // Create maintenance parts
            if ($request->parts && count($request->parts) > 0) {
                foreach ($request->parts as $part) {
                    $maintenancePart = MaintenancePart::create([
                        'maintenance_record_id' => $maintenanceRecord->id,
                        'part_name' => $part['part_name'],
                        'part_number' => $part['part_number'] ?? null,
                        'quantity' => $part['quantity'],
                        'unit_cost' => $part['unit_cost'],
                        'total_cost' => $part['quantity'] * $part['unit_cost'],
                        'supplier' => $part['supplier'] ?? null,
                        'notes' => $part['notes'] ?? null
                    ]);

                    // Update inventory if part is from inventory
                    if (isset($part['inventory_item_id']) && $part['inventory_item_id']) {
                        // Ensure ID is numeric
        if (!is_numeric($part['inventory_item_id'])) {
            abort(404, 'Invalid ID provided');
        }
        // Ensure ID is numeric
        if (!is_numeric($part['inventory_item_id'])) {
            abort(404, 'Invalid ID provided');
        }
        $inventoryItem = InventoryItem::find($part['inventory_item_id']);

                        if ($inventoryItem) {
                            // Create inventory transaction
                            InventoryTransaction::create([
                                'inventory_item_id' => $inventoryItem->id,
                                'type' => 'use',
                                'quantity' => $part['quantity'],
                                'transaction_date' => $request->maintenance_date,
                                'maintenance_record_id' => $maintenanceRecord->id,
                                'unit_cost' => $part['unit_cost'],
                                'total_cost' => $part['quantity'] * $part['unit_cost'],
                                'created_by' => $user->id,
                                'notes' => 'Used for maintenance: ' . $maintenanceRecord->description,
                            ]);

                            // Update inventory item stock
                            $inventoryItem->quantity_in_stock -= $part['quantity'];
                            $inventoryItem->save();
                        }
                    }
                }
            }

            // Update equipment status and maintenance dates if maintenance is completed
            if ($request->status === 'completed') {
                // Ensure ID is numeric
        if (!is_numeric($request->equipment_id)) {
            abort(404, 'Invalid ID provided');
        }
        // Ensure ID is numeric
        if (!is_numeric($request->equipment_id)) {
            abort(404, 'Invalid ID provided');
        }
        // Ensure ID is numeric
        if (!is_numeric($request->equipment_id)) {
            abort(404, 'Invalid ID provided');
        }
        // Ensure ID is numeric
        if (!is_numeric($request->equipment_id)) {
            abort(404, 'Invalid ID provided');
        }
        $equipment = Equipment::find($request->equipment_id);

                if ($equipment) {
                    // Update equipment status if it was in maintenance
                    if ($equipment->status === 'maintenance') {
                        $equipment->status = 'available';
                    }

                    // Update maintenance dates
                    $equipment->last_maintenance_date = $request->maintenance_date;

                    if ($request->next_maintenance_date) {
                        $equipment->next_maintenance_date = $request->next_maintenance_date;
                    }

                    $equipment->save();
                }
            } elseif ($request->status === 'in_progress') {
                // Update equipment status to maintenance if maintenance is in progress
                // Ensure ID is numeric
        if (!is_numeric($request->equipment_id)) {
            abort(404, 'Invalid ID provided');
        }
        // Ensure ID is numeric
        if (!is_numeric($request->equipment_id)) {
            abort(404, 'Invalid ID provided');
        }
        // Ensure ID is numeric
        if (!is_numeric($request->equipment_id)) {
            abort(404, 'Invalid ID provided');
        }
        // Ensure ID is numeric
        if (!is_numeric($request->equipment_id)) {
            abort(404, 'Invalid ID provided');
        }
        $equipment = Equipment::find($request->equipment_id);

                if ($equipment && $equipment->status !== 'rented') {
                    $equipment->status = 'maintenance';
                    $equipment->save();
                }
            }

            DB::commit();

            return redirect()->route('maintenance.index')
                ->with('success', 'Maintenance record created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'An error occurred while creating the maintenance record: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(MaintenanceRecord $maintenance)
    {
        $maintenance->load(['equipment', 'performer', 'approver', 'maintenanceParts', 'inventoryTransactions.inventoryItem']);

        return Inertia::render('Maintenance/Show', [
            'maintenanceRecord' => $maintenance,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MaintenanceRecord $maintenance)
    {
        // Check if user has permission to edit maintenance records
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager') && !$user->hasRole('workshop')) {
            return redirect()->route('maintenance.index')
                ->with('error', 'You do not have permission to edit maintenance records.');
        }

        $maintenance->load(['equipment', 'performer', 'maintenanceParts']);

        $equipment = Equipment::all();
        $employees = Employee::where('status', 'active')->get();
        $inventoryItems = InventoryItem::all();

        return Inertia::render('Maintenance/Edit', [
            'maintenanceRecord' => $maintenance,
            'equipment' => $equipment,
            'employees' => $employees,
            'inventoryItems' => $inventoryItems,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MaintenanceRecord $maintenance)
    {
        // Check if user has permission to update maintenance records
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager') && !$user->hasRole('workshop')) {
            return redirect()->route('maintenance.index')
                ->with('error', 'You do not have permission to update maintenance records.');
        }

        $request->validate([
            'equipment_id' => 'required|exists:equipment,id',
            'maintenance_date' => 'required|date',
            'type' => 'required|in:routine,repair,inspection,other',
            'status' => 'required|in:scheduled,in_progress,completed,cancelled',
            'description' => 'required|string',
            'cost' => 'nullable|numeric|min:0',
            'performed_by' => 'nullable|exists:employees,id',
            'next_maintenance_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'parts' => 'nullable|array',
            'parts.*.id' => 'nullable|exists:maintenance_parts,id',
            'parts.*.part_name' => 'required|string|max:255',
            'parts.*.part_number' => 'nullable|string|max:255',
            'parts.*.quantity' => 'required|integer|min:1',
            'parts.*.unit_cost' => 'required|numeric|min:0',
            'parts.*.supplier' => 'nullable|string|max:255',
            'parts.*.inventory_item_id' => 'nullable|exists:inventory_items,id',
        ]);

        DB::beginTransaction();

        try {
            // Update maintenance record
            $maintenance->update([
                'equipment_id' => $request->equipment_id,
                'maintenance_date' => $request->maintenance_date,
                'type' => $request->type,
                'status' => $request->status,
                'description' => $request->description,
                'cost' => $request->cost ?? 0,
                'performed_by' => $request->performed_by,
                'next_maintenance_date' => $request->next_maintenance_date,
                'notes' => $request->notes,
            ]);

            // If status changed to completed, update approved_by
            if ($request->status === 'completed' && $maintenance->status !== 'completed') {
                $maintenance->update([
                    'approved_by' => $user->id,
                    'approved_at' => now(),
                ]);
            }

            // Handle maintenance parts
            if ($request->parts && count($request->parts) > 0) {
                // Get existing part IDs
                $existingPartIds = $maintenance->maintenanceParts->pluck('id')->toArray();
                $updatedPartIds = [];

                foreach ($request->parts as $part) {
                    if (isset($part['id']) && $part['id']) {
                        // Update existing part
                        // Ensure ID is numeric
        if (!is_numeric($part['id'])) {
            abort(404, 'Invalid ID provided');
        }
        $maintenancePart = MaintenancePart::find($part['id']);

                        if ($maintenancePart) {
                            $maintenancePart->update([
                                'part_name' => $part['part_name'],
                                'part_number' => $part['part_number'] ?? null,
                                'quantity' => $part['quantity'],
                                'unit_cost' => $part['unit_cost'],
                                'total_cost' => $part['quantity'] * $part['unit_cost'],
                                'supplier' => $part['supplier'] ?? null,
                                'notes' => $part['notes'] ?? null
                            ]);

                            $updatedPartIds[] = $maintenancePart->id;
                        }
                    } else {
                        // Create new part
                        $maintenancePart = MaintenancePart::create([
                            'maintenance_record_id' => $maintenance->id,
                            'part_name' => $part['part_name'],
                            'part_number' => $part['part_number'] ?? null,
                            'quantity' => $part['quantity'],
                            'unit_cost' => $part['unit_cost'],
                            'total_cost' => $part['quantity'] * $part['unit_cost'],
                            'supplier' => $part['supplier'] ?? null,
                            'notes' => $part['notes'] ?? null
                        ]);

                        $updatedPartIds[] = $maintenancePart->id;

                        // Update inventory if part is from inventory
                        if (isset($part['inventory_item_id']) && $part['inventory_item_id']) {
                            // Ensure ID is numeric
        if (!is_numeric($part['inventory_item_id'])) {
            abort(404, 'Invalid ID provided');
        }
        // Ensure ID is numeric
        if (!is_numeric($part['inventory_item_id'])) {
            abort(404, 'Invalid ID provided');
        }
        $inventoryItem = InventoryItem::find($part['inventory_item_id']);

                            if ($inventoryItem) {
                                // Create inventory transaction
                                InventoryTransaction::create([
                                    'inventory_item_id' => $inventoryItem->id,
                                    'type' => 'use',
                                    'quantity' => $part['quantity'],
                                    'transaction_date' => $request->maintenance_date,
                                    'maintenance_record_id' => $maintenance->id,
                                    'unit_cost' => $part['unit_cost'],
                                    'total_cost' => $part['quantity'] * $part['unit_cost'],
                                    'created_by' => $user->id,
                                    'notes' => 'Used for maintenance: ' . $maintenance->description,
                                ]);

                                // Update inventory item stock
                                $inventoryItem->quantity_in_stock -= $part['quantity'];
                                $inventoryItem->save();
                            }
                        }
                    }
                }

                // Delete parts that were removed
                $partsToDelete = array_diff($existingPartIds, $updatedPartIds);

                if (count($partsToDelete) > 0) {
                    MaintenancePart::whereIn('id', $partsToDelete)->delete();
                }
            } else {
                // Delete all parts if none were provided
                $maintenance->maintenanceParts()->delete();
            }

            // Update equipment status and maintenance dates if maintenance is completed
            if ($request->status === 'completed') {
                // Ensure ID is numeric
        if (!is_numeric($request->equipment_id)) {
            abort(404, 'Invalid ID provided');
        }
        // Ensure ID is numeric
        if (!is_numeric($request->equipment_id)) {
            abort(404, 'Invalid ID provided');
        }
        // Ensure ID is numeric
        if (!is_numeric($request->equipment_id)) {
            abort(404, 'Invalid ID provided');
        }
        // Ensure ID is numeric
        if (!is_numeric($request->equipment_id)) {
            abort(404, 'Invalid ID provided');
        }
        $equipment = Equipment::find($request->equipment_id);

                if ($equipment) {
                    // Update equipment status if it was in maintenance
                    if ($equipment->status === 'maintenance') {
                        $equipment->status = 'available';
                    }

                    // Update maintenance dates
                    $equipment->last_maintenance_date = $request->maintenance_date;

                    if ($request->next_maintenance_date) {
                        $equipment->next_maintenance_date = $request->next_maintenance_date;
                    }

                    $equipment->save();
                }
            } elseif ($request->status === 'in_progress') {
                // Update equipment status to maintenance if maintenance is in progress
                // Ensure ID is numeric
        if (!is_numeric($request->equipment_id)) {
            abort(404, 'Invalid ID provided');
        }
        // Ensure ID is numeric
        if (!is_numeric($request->equipment_id)) {
            abort(404, 'Invalid ID provided');
        }
        // Ensure ID is numeric
        if (!is_numeric($request->equipment_id)) {
            abort(404, 'Invalid ID provided');
        }
        // Ensure ID is numeric
        if (!is_numeric($request->equipment_id)) {
            abort(404, 'Invalid ID provided');
        }
        $equipment = Equipment::find($request->equipment_id);

                if ($equipment && $equipment->status !== 'rented') {
                    $equipment->status = 'maintenance';
                    $equipment->save();
                }
            }

            DB::commit();

            return redirect()->route('maintenance.index')
                ->with('success', 'Maintenance record updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'An error occurred while updating the maintenance record: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MaintenanceRecord $maintenance)
    {
        // Check if user has permission to delete maintenance records
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager')) {
            return redirect()->route('maintenance.index')
                ->with('error', 'You do not have permission to delete maintenance records.');
        }

        DB::beginTransaction();

        try {
            // Delete related inventory transactions
            $maintenance->inventoryTransactions()->delete();

            // Delete related maintenance parts
            $maintenance->maintenanceParts()->delete();

            // Delete maintenance record
            $maintenance->delete();

            DB::commit();

            return redirect()->route('maintenance.index')
                ->with('success', 'Maintenance record deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'An error occurred while deleting the maintenance record: ' . $e->getMessage());
        }
    }

    /**
     * Display upcoming maintenance schedule.
     */
    public function schedule(Request $request)
    {
        $period = $request->input('period', '30');

        $startDate = now();
        $endDate = now()->addDays($period);

        // Get equipment with upcoming maintenance
        $equipment = Equipment::where('next_maintenance_date', '>=', $startDate)
            ->where('next_maintenance_date', '<=', $endDate)
            ->orderBy('next_maintenance_date')
            ->get();

        // Get scheduled maintenance records
        $scheduledMaintenance = MaintenanceRecord::with(['equipment', 'performer'])
            ->where('status', 'scheduled')
            ->where('maintenance_date', '>=', $startDate)
            ->where('maintenance_date', '<=', $endDate)
            ->orderBy('maintenance_date')
            ->get();

        return Inertia::render('Maintenance/Schedule', [
            'equipment' => $equipment,
            'scheduledMaintenance' => $scheduledMaintenance,
            'period' => $period,
        ]);
    }
}




