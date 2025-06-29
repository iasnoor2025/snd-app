<?php

namespace Modules\EquipmentManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\EquipmentManagement\Services\MaintenanceScheduleService;
use Modules\EquipmentManagement\Domain\Models\MaintenanceSchedule;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\MaintenanceRecord;
use Modules\Core\Domain\Models\User;
use Inertia\Inertia;
use Carbon\Carbon;

class MaintenanceScheduleController extends Controller
{
    public function __construct(private MaintenanceScheduleService $service) {}

    public function index(Equipment $equipment)
    {
        return response()->json([
            'data' => $this->service->getSchedulesForEquipment($equipment),
        ]);
    }

    public function store(Request $request, Equipment $equipment)
    {
        $data = $request->validate([
            'scheduled_at' => 'required|date',
            'type' => 'required|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|string',
        ]);
        $data['equipment_id'] = $equipment->id;
        $schedule = $this->service->createSchedule($data);
        return response()->json(['message' => 'Scheduled', 'data' => $schedule]);
    }

    public function update(Request $request, Equipment $equipment, MaintenanceSchedule $schedule)
    {
        $data = $request->validate([
            'scheduled_at' => 'sometimes|date',
            'completed_at' => 'nullable|date',
            'type' => 'sometimes|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|string',
        ]);
        $updated = $this->service->updateSchedule($schedule, $data);
        return response()->json(['message' => 'Updated', 'data' => $updated]);
    }

    public function destroy(Equipment $equipment, MaintenanceSchedule $schedule)
    {
        $this->service->deleteSchedule($schedule);
        return response()->json(['message' => 'Deleted']);
    }

    /**
     * Display maintenance schedule
     */
    public function indexOld(Request $request)
    {
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : now();
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : now()->addDays(7);

        $schedule = $this->service->getScheduleForDateRange($startDate, $endDate);
        $workload = $this->service->getTechnicianWorkload();
        $conflicts = $this->service->getScheduleConflicts($startDate, $endDate);

        return Inertia::render('Equipment/Maintenance/Schedule/Index', [
            'schedule' => $schedule,
            'workload' => $workload,
            'conflicts' => $conflicts,
            'start_date' => $startDate,
            'end_date' => $endDate
        ]);
    }

    /**
     * Schedule preventive maintenance
     */
    public function schedule(Request $request, Equipment $equipment)
    {
        $request->validate([
            'type' => 'required|in:preventive,repair,inspection',
            'description' => 'required|string|max:500',
            'scheduled_date' => 'required|date|after:today',
            'is_recurring' => 'boolean',
            'interval_days' => 'required_if:is_recurring,true|integer|min:1',
            'occurrences' => 'required_if:is_recurring,true|integer|min:1|max:52',
            'technician_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            if ($request->is_recurring) {
                $schedules = $this->service->scheduleRecurringMaintenance(
                    $equipment,
                    $request->type,
                    $request->description,
                    Carbon::parse($request->scheduled_date),
                    $request->interval_days,
                    $request->occurrences,
                    auth()->user(),
                    $request->notes
                );

                if ($request->technician_id) {
                    $technician = User::findOrFail($request->technician_id);
                    foreach ($schedules as $schedule) {
                        $this->service->assignTechnician($schedule, $technician);
                    }
                }

                return redirect()->route('equipment.maintenance.schedule.index')
                    ->with('success', 'Recurring maintenance scheduled successfully.');
            } else {
                $schedule = $this->service->schedulePreventiveMaintenance(
                    $equipment,
                    $request->type,
                    $request->description,
                    Carbon::parse($request->scheduled_date),
                    auth()->user(),
                    $request->notes
                );

                if ($request->technician_id) {
                    $technician = User::findOrFail($request->technician_id);
                    $this->service->assignTechnician($schedule, $technician);
                }

                return redirect()->route('equipment.maintenance.schedule.index')
                    ->with('success', 'Maintenance scheduled successfully.');
            }
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Assign technician to maintenance
     */
    public function assignTechnician(Request $request, MaintenanceRecord $maintenance)
    {
        $request->validate([
            'technician_id' => 'required|exists:users,id',
            'scheduled_date' => 'nullable|date|after:today'
        ]);

        try {
            $technician = User::findOrFail($request->technician_id);
            $scheduledDate = $request->scheduled_date ? Carbon::parse($request->scheduled_date) : null;

            $this->service->assignTechnician($maintenance, $technician, $scheduledDate);

            return redirect()->route('equipment.maintenance.schedule.index')
                ->with('success', 'Technician assigned successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Reschedule maintenance
     */
    public function reschedule(Request $request, MaintenanceRecord $maintenance)
    {
        $request->validate([
            'scheduled_date' => 'required|date|after:today',
            'technician_id' => 'nullable|exists:users,id'
        ]);

        try {
            $technician = $request->technician_id ? User::findOrFail($request->technician_id) : null;

            $this->service->rescheduleMaintenance(
                $maintenance,
                Carbon::parse($request->scheduled_date),
                $technician
            );

            return redirect()->route('equipment.maintenance.schedule.index')
                ->with('success', 'Maintenance rescheduled successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Get available technicians
     */
    public function getAvailableTechnicians(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date'
        ]);

        $technicians = $this->service->getAvailableTechnicians(
            Carbon::parse($request->start_date),
            Carbon::parse($request->end_date)
        );

        return response()->json($technicians);
    }

    /**
     * Get technician schedule
     */
    public function getTechnicianSchedule(Request $request, User $technician)
    {
        $days = $request->input('days', 7);
        $schedule = $this->service->getTechnicianSchedule($technician, $days);

        return response()->json($schedule);
    }

    /**
     * Get schedule conflicts
     */
    public function getConflicts(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date'
        ]);

        $conflicts = $this->service->getScheduleConflicts(
            Carbon::parse($request->start_date),
            Carbon::parse($request->end_date)
        );

        return response()->json($conflicts);
    }
}


