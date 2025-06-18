<?php

namespace Modules\EquipmentManagement\Http\Controllers;

use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\MaintenanceRecord;
use Modules\Core\Domain\Models\User;
use Modules\EquipmentManagement\Services\MaintenanceScheduleService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class MaintenanceScheduleController extends Controller
{
    protected MaintenanceScheduleService $scheduleService;

    public function __construct(MaintenanceScheduleService $scheduleService)
    {
        $this->scheduleService = $scheduleService;
    }

    /**
     * Display maintenance schedule
     */
    public function index(Request $request)
    {
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : now();
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : now()->addDays(7);

        $schedule = $this->scheduleService->getScheduleForDateRange($startDate, $endDate);
        $workload = $this->scheduleService->getTechnicianWorkload();
        $conflicts = $this->scheduleService->getScheduleConflicts($startDate, $endDate);

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
                $schedules = $this->scheduleService->scheduleRecurringMaintenance(
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
                        $this->scheduleService->assignTechnician($schedule, $technician);
                    }
                }

                return redirect()->route('equipment.maintenance.schedule.index')
                    ->with('success', 'Recurring maintenance scheduled successfully.');
            } else {
                $schedule = $this->scheduleService->schedulePreventiveMaintenance(
                    $equipment,
                    $request->type,
                    $request->description,
                    Carbon::parse($request->scheduled_date),
                    auth()->user(),
                    $request->notes
                );

                if ($request->technician_id) {
                    $technician = User::findOrFail($request->technician_id);
                    $this->scheduleService->assignTechnician($schedule, $technician);
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

            $this->scheduleService->assignTechnician($maintenance, $technician, $scheduledDate);

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

            $this->scheduleService->rescheduleMaintenance(
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

        $technicians = $this->scheduleService->getAvailableTechnicians(
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
        $schedule = $this->scheduleService->getTechnicianSchedule($technician, $days);

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

        $conflicts = $this->scheduleService->getScheduleConflicts(
            Carbon::parse($request->start_date),
            Carbon::parse($request->end_date)
        );

        return response()->json($conflicts);
    }
}


