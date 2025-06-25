<?php

namespace Modules\EquipmentManagement\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\Core\Traits\ApiResponse;
use Modules\EquipmentManagement\Models\Equipment;
use Modules\EquipmentManagement\Models\MaintenanceSchedule;
use Modules\EquipmentManagement\Services\MaintenanceService;
use Modules\EquipmentManagement\Domain\Models\Equipment as EquipmentModel;
use Modules\EquipmentManagement\Domain\Models\MaintenanceHistory;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    use ApiResponse;

    protected MaintenanceService $maintenanceService;

    public function __construct(MaintenanceService $maintenanceService)
    {
        $this->maintenanceService = $maintenanceService;
    }

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

    public function create(EquipmentModel $equipment)
    {
        return Inertia::render('Maintenance/Create', [
            'equipment' => $equipment,
        ]);
    }

    public function store(Request $request, EquipmentModel $equipment)
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

    public function schedule(Request $request, EquipmentModel $equipment)
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

    /**
     * Create a maintenance schedule
     */
    public function createSchedule(Request $request, EquipmentModel $equipment): JsonResponse
    {
        $this->authorize('update', $equipment);

        $request->validate([
            'type' => 'required|string|max:50',
            'frequency_type' => 'required|string|in:daily,weekly,monthly,quarterly,yearly',
            'frequency_value' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'estimated_duration' => 'nullable|integer|min:1',
            'estimated_cost' => 'nullable|numeric|min:0',
            'priority' => 'nullable|string|in:low,medium,high',
            'is_active' => 'nullable|boolean',
            'notifications_enabled' => 'nullable|boolean',
            'notification_days_before' => 'nullable|integer|min:1|max:90'
        ]);

        $schedule = $this->maintenanceService->createSchedule($equipment, $request->all());

        return $this->success([
            'message' => 'Maintenance schedule created successfully',
            'schedule' => $schedule
        ]);
    }

    /**
     * Update a maintenance schedule
     */
    public function updateSchedule(Request $request, EquipmentModel $equipment, MaintenanceSchedule $schedule): JsonResponse
    {
        $this->authorize('update', $equipment);

        $request->validate([
            'type' => 'nullable|string|max:50',
            'frequency_type' => 'nullable|string|in:daily,weekly,monthly,quarterly,yearly',
            'frequency_value' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
            'estimated_duration' => 'nullable|integer|min:1',
            'estimated_cost' => 'nullable|numeric|min:0',
            'priority' => 'nullable|string|in:low,medium,high',
            'is_active' => 'nullable|boolean',
            'notifications_enabled' => 'nullable|boolean',
            'notification_days_before' => 'nullable|integer|min:1|max:90'
        ]);

        $schedule = $this->maintenanceService->updateSchedule($schedule, $request->all());

        return $this->success([
            'message' => 'Maintenance schedule updated successfully',
            'schedule' => $schedule
        ]);
    }

    /**
     * Record completed maintenance
     */
    public function recordMaintenance(Request $request, EquipmentModel $equipment): JsonResponse
    {
        $this->authorize('update', $equipment);

        $request->validate([
            'maintenance_schedule_id' => 'nullable|exists:maintenance_schedules,id',
            'type' => 'required|string|max:50',
            'description' => 'required|string',
            'performed_by' => 'required|string|max:100',
            'performed_at' => 'nullable|date',
            'duration' => 'nullable|integer|min:1',
            'cost' => 'nullable|numeric|min:0',
            'parts_cost' => 'nullable|numeric|min:0',
            'labor_cost' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|in:completed,partial,failed',
            'notes' => 'nullable|string',
            'next_maintenance_date' => 'nullable|date|after:today'
        ]);

        $record = $this->maintenanceService->recordMaintenance($equipment, $request->all());

        return $this->success([
            'message' => 'Maintenance record created successfully',
            'record' => $record
        ]);
    }

    /**
     * Get upcoming maintenance
     */
    public function getUpcomingMaintenance(Request $request, EquipmentModel $equipment): JsonResponse
    {
        $this->authorize('view', $equipment);

        $request->validate([
            'days' => 'nullable|integer|min:1|max:365'
        ]);

        $maintenance = $this->maintenanceService->getUpcomingMaintenance(
            $equipment,
            $request->input('days', 30)
        );

        return $this->success([
            'maintenance' => $maintenance
        ]);
    }

    /**
     * Get maintenance history
     */
    public function getMaintenanceHistory(Request $request, EquipmentModel $equipment): JsonResponse
    {
        $this->authorize('view', $equipment);

        $request->validate([
            'type' => 'nullable|string|max:50',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'status' => 'nullable|string|in:completed,partial,failed'
        ]);

        $history = $this->maintenanceService->getMaintenanceHistory($equipment, $request->all());

        return $this->success([
            'history' => $history
        ]);
    }

    /**
     * Get maintenance costs summary
     */
    public function getMaintenanceCostsSummary(Request $request, EquipmentModel $equipment): JsonResponse
    {
        $this->authorize('view', $equipment);

        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date'
        ]);

        $summary = $this->maintenanceService->getMaintenanceCostsSummary(
            $equipment,
            $request->input('start_date'),
            $request->input('end_date')
        );

        return $this->success([
            'summary' => $summary
        ]);
    }
}


