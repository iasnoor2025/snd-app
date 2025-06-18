<?php

namespace Modules\EquipmentManagement\Http\Controllers;

use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\MaintenanceRecord;
use App\Services\EquipmentMaintenanceService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class EquipmentMaintenanceController extends Controller
{
    protected $maintenanceService;

    public function __construct(/* EquipmentMaintenanceService $maintenanceService */)
    {
        // $this->maintenanceService = $maintenanceService;
    }

    /**
     * Display maintenance history
     */
    public function index(Equipment $equipment)
    {
        $history = $this->maintenanceService->getMaintenanceHistory($equipment);
        $costs = $this->maintenanceService->getMaintenanceCosts($equipment);
        $performance = $this->maintenanceService->getMaintenancePerformance($equipment);
        $schedule = $this->maintenanceService->getMaintenanceSchedule($equipment);

        return Inertia::render('Equipment/Maintenance/Index', [
            'equipment' => $equipment->load('category'),
            'history' => $history,
            'costs' => $costs,
            'performance' => $performance,
            'schedule' => $schedule
        ]);
    }

    /**
     * Show form to create a new maintenance record
     */
    public function create(Equipment $equipment)
    {
        return Inertia::render('Equipment/Maintenance/Create', [
            'equipment' => $equipment->load('category'),
        ]);
    }

    /**
     * Store a new maintenance record
     */
    public function store(Request $request, Equipment $equipment)
    {
        $request->validate([
            'type' => 'required|in:preventive,repair,inspection',
            'description' => 'required|string|max:500',
            'cost' => 'required|numeric|min:0',
            'scheduled_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            $maintenance = $this->maintenanceService->createMaintenanceRecord(
                $equipment,
                $request->type,
                $request->description,
                $request->cost,
                auth()->user(),
                $request->scheduled_date ? Carbon::parse($request->scheduled_date) : null,
                $request->notes
            );

            return redirect()->route('equipment.maintenance.show', [$equipment->id, $maintenance->id])
                ->with('success', 'Maintenance record created successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Show maintenance record
     */
    public function show(Equipment $equipment, MaintenanceRecord $maintenance)
    {
        // Make sure the maintenance record belongs to the equipment
        if ($maintenance->equipment_id !== $equipment->id) {
            abort(404);
        }

        return Inertia::render('Equipment/Maintenance/Show', [
            'equipment' => $equipment->load('category'),
            'maintenance' => $maintenance->load(['performedBy', 'approvedBy', 'equipment'])
        ]);
    }

    /**
     * Show form to edit a maintenance record
     */
    public function edit(Equipment $equipment, MaintenanceRecord $maintenance)
    {
        // Make sure the maintenance record belongs to the equipment
        if ($maintenance->equipment_id !== $equipment->id) {
            abort(404);
        }

        // Don't allow editing completed or cancelled maintenance
        if (in_array($maintenance->status, ['completed', 'cancelled'])) {
            return redirect()->route('equipment.maintenance.show', [$equipment->id, $maintenance->id])
                ->with('error', 'Cannot edit a completed or cancelled maintenance record.');
        }

        return Inertia::render('Equipment/Maintenance/Edit', [
            'equipment' => $equipment->load('category'),
            'maintenance' => $maintenance
        ]);
    }

    /**
     * Update a maintenance record
     */
    public function update(Request $request, Equipment $equipment, MaintenanceRecord $maintenance)
    {
        // Make sure the maintenance record belongs to the equipment
        if ($maintenance->equipment_id !== $equipment->id) {
            abort(404);
        }

        // Don't allow updating completed or cancelled maintenance
        if (in_array($maintenance->status, ['completed', 'cancelled'])) {
            return redirect()->route('equipment.maintenance.show', [$equipment->id, $maintenance->id])
                ->with('error', 'Cannot update a completed or cancelled maintenance record.');
        }

        $request->validate([
            'type' => 'required|in:preventive,repair,inspection',
            'description' => 'required|string|max:500',
            'cost' => 'required|numeric|min:0',
            'scheduled_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            $maintenance->type = $request->type;
            $maintenance->description = $request->description;
            $maintenance->cost = $request->cost;
            $maintenance->scheduled_date = $request->scheduled_date;
            $maintenance->notes = $request->notes;
            $maintenance->save();

            return redirect()->route('equipment.maintenance.show', [$equipment->id, $maintenance->id])
                ->with('success', 'Maintenance record updated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Complete maintenance
     */
    public function complete(Request $request, Equipment $equipment, MaintenanceRecord $maintenance)
    {
        // Make sure the maintenance record belongs to the equipment
        if ($maintenance->equipment_id !== $equipment->id) {
            abort(404);
        }

        // Don't allow completing already completed or cancelled maintenance
        if (in_array($maintenance->status, ['completed', 'cancelled'])) {
            return redirect()->route('equipment.maintenance.show', [$equipment->id, $maintenance->id])
                ->with('error', 'Cannot complete a record that is already completed or cancelled.');
        }

        try {
            $this->maintenanceService->completeMaintenance(
                $maintenance,
                $maintenance->cost,
                auth()->user(),
                $maintenance->notes
            );

            return redirect()->route('equipment.maintenance.show', [$equipment->id, $maintenance->id])
                ->with('success', 'Maintenance completed successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Cancel maintenance
     */
    public function cancel(Equipment $equipment, MaintenanceRecord $maintenance)
    {
        // Make sure the maintenance record belongs to the equipment
        if ($maintenance->equipment_id !== $equipment->id) {
            abort(404);
        }

        // Don't allow cancelling already completed or cancelled maintenance
        if (in_array($maintenance->status, ['completed', 'cancelled'])) {
            return redirect()->route('equipment.maintenance.show', [$equipment->id, $maintenance->id])
                ->with('error', 'Cannot cancel a record that is already completed or cancelled.');
        }

        try {
            $maintenance->status = 'cancelled';
            $maintenance->save();

            return redirect()->route('equipment.maintenance.show', [$equipment->id, $maintenance->id])
                ->with('success', 'Maintenance cancelled successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Get upcoming maintenance
     */
    public function upcoming(Request $request)
    {
        $days = $request->input('days', 7);
        $upcoming = $this->maintenanceService->getUpcomingMaintenance($days);

        return Inertia::render('Equipment/Maintenance/Upcoming', [
            'upcoming' => $upcoming,
            'days' => $days
        ]);
    }

    /**
     * Get maintenance costs
     */
    public function costs(Equipment $equipment, Request $request)
    {
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : null;
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : null;

        $costs = $this->maintenanceService->getMaintenanceCosts($equipment, $startDate, $endDate);

        return response()->json($costs);
    }

    /**
     * Get maintenance performance
     */
    public function performance(Equipment $equipment)
    {
        $performance = $this->maintenanceService->getMaintenancePerformance($equipment);

        return response()->json($performance);
    }

    /**
     * Get maintenance schedule
     */
    public function schedule(Equipment $equipment)
    {
        $schedule = $this->maintenanceService->getMaintenanceSchedule($equipment);

        return response()->json($schedule);
    }

    /**
     * Get maintenance summary for dashboard
     */
    public function summary()
    {
        $upcoming = $this->maintenanceService->getUpcomingMaintenance(7);
        $overdue = MaintenanceRecord::where('status', 'scheduled')
            ->where('scheduled_date', '<', now())
            ->count();

        return response()->json([
            'upcoming_count' => $upcoming->count(),
            'overdue_count' => $overdue,
            'next_maintenance' => $upcoming->first()
        ]);
    }
}


