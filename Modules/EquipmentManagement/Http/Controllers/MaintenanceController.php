<?php

namespace Modules\EquipmentManagement\Http\Controllers;

use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\MaintenanceHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    public function index()
    {
        $maintenance = MaintenanceHistory::with(['equipment', 'technician'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Maintenance/Index', [
            'maintenance' => $maintenance,
        ]);
    }

    public function show(MaintenanceHistory $maintenance)
    {
        $maintenance->load(['equipment', 'technician']);

        return Inertia::render('Maintenance/Show', [
            'maintenance' => $maintenance,
        ]);
    }

    public function create(Equipment $equipment)
    {
        return Inertia::render('Maintenance/Create', [
            'equipment' => $equipment,
        ]);
    }

    public function store(Request $request, Equipment $equipment)
    {
        $validated = $request->validate([
            'maintenance_type' => 'required|string|in:preventive,repair,inspection',
            'description' => 'required|string',
            'cost' => 'required|numeric|min:0',
            'performed_at' => 'required|date',
            'next_maintenance_due' => 'nullable|date|after:performed_at',
            'parts_used' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $maintenance = $equipment->maintenanceHistory()->create([
            ...$validated,
            'performed_by' => auth()->id(),
            'status' => 'completed',
        ]);

        $maintenance->scheduleNextMaintenance();

        return redirect()->route('maintenance.show', $maintenance)
            ->with('success', 'Maintenance record created successfully.');
    }

    public function schedule(Request $request, Equipment $equipment)
    {
        $validated = $request->validate([
            'maintenance_type' => 'required|string|in:preventive,repair,inspection',
            'description' => 'required|string',
            'performed_at' => 'required|date',
            'next_maintenance_due' => 'nullable|date|after:performed_at',
            'notes' => 'nullable|string',
        ]);

        $maintenance = $equipment->maintenanceHistory()->create([
            ...$validated,
            'status' => 'scheduled',
            'cost' => 0,
        ]);

        $maintenance->scheduleNextMaintenance();

        return redirect()->route('maintenance.show', $maintenance)
            ->with('success', 'Maintenance scheduled successfully.');
    }

    public function complete(MaintenanceHistory $maintenance)
    {
        $maintenance->markAsCompleted();

        return redirect()->route('maintenance.show', $maintenance)
            ->with('success', 'Maintenance marked as completed.');
    }
}


