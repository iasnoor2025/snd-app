<?php

namespace Modules\EquipmentManagement\Services;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Modules\EquipmentManagement\Models\Equipment;
use Modules\EquipmentManagement\Models\MaintenanceRecord;
use Modules\EquipmentManagement\Models\MaintenanceSchedule;
use Modules\EquipmentManagement\Events\MaintenanceDueEvent;
use Modules\EquipmentManagement\Events\MaintenanceCompletedEvent;

class MaintenanceService
{
    /**
     * Create a maintenance schedule for equipment
     */
    public function createSchedule(Equipment $equipment, array $data): MaintenanceSchedule
    {
        $schedule = $equipment->maintenanceSchedules()->create([
            'type' => $data['type'],
            'frequency_type' => $data['frequency_type'], // daily, weekly, monthly, quarterly, yearly
            'frequency_value' => $data['frequency_value'],
            'description' => $data['description'] ?? null,
            'estimated_duration' => $data['estimated_duration'] ?? null,
            'estimated_cost' => $data['estimated_cost'] ?? null,
            'priority' => $data['priority'] ?? 'medium',
            'next_due_date' => $this->calculateNextDueDate(
                Carbon::now(),
                $data['frequency_type'],
                $data['frequency_value']
            ),
            'is_active' => $data['is_active'] ?? true,
            'notifications_enabled' => $data['notifications_enabled'] ?? true,
            'notification_days_before' => $data['notification_days_before'] ?? 7,
        ]);

        return $schedule;
    }

    /**
     * Update a maintenance schedule
     */
    public function updateSchedule(MaintenanceSchedule $schedule, array $data): MaintenanceSchedule
    {
        if (isset($data['frequency_type']) || isset($data['frequency_value'])) {
            $data['next_due_date'] = $this->calculateNextDueDate(
                $schedule->last_completed_at ?? Carbon::now(),
                $data['frequency_type'] ?? $schedule->frequency_type,
                $data['frequency_value'] ?? $schedule->frequency_value
            );
        }

        $schedule->update($data);
        return $schedule->fresh();
    }

    /**
     * Record a completed maintenance
     */
    public function recordMaintenance(Equipment $equipment, array $data): MaintenanceRecord
    {
        $record = $equipment->maintenanceRecords()->create([
            'maintenance_schedule_id' => $data['maintenance_schedule_id'] ?? null,
            'type' => $data['type'],
            'description' => $data['description'],
            'performed_by' => $data['performed_by'],
            'performed_at' => $data['performed_at'] ?? Carbon::now(),
            'duration' => $data['duration'] ?? null,
            'cost' => $data['cost'] ?? null,
            'parts_cost' => $data['parts_cost'] ?? null,
            'labor_cost' => $data['labor_cost'] ?? null,
            'status' => $data['status'] ?? 'completed',
            'notes' => $data['notes'] ?? null,
            'next_maintenance_date' => $data['next_maintenance_date'] ?? null,
        ]);

        if ($record->maintenance_schedule_id) {
            $this->updateScheduleAfterMaintenance($record->maintenanceSchedule);
        }

        event(new MaintenanceCompletedEvent($record));

        return $record;
    }

    /**
     * Get upcoming maintenance for equipment
     */
    public function getUpcomingMaintenance(Equipment $equipment, ?int $days = 30): Collection
    {
        $endDate = Carbon::now()->addDays($days);

        return $equipment->maintenanceSchedules()
            ->where('is_active', true)
            ->where('next_due_date', '<=', $endDate)
            ->orderBy('next_due_date')
            ->get();
    }

    /**
     * Get maintenance history for equipment
     */
    public function getMaintenanceHistory(Equipment $equipment, array $filters = []): Collection
    {
        $query = $equipment->maintenanceRecords()->with('maintenanceSchedule');

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['start_date'])) {
            $query->where('performed_at', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date'])) {
            $query->where('performed_at', '<=', $filters['end_date']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('performed_at', 'desc')->get();
    }

    /**
     * Get maintenance costs summary
     */
    public function getMaintenanceCostsSummary(Equipment $equipment, ?string $startDate = null, ?string $endDate = null): array
    {
        $query = $equipment->maintenanceRecords()
            ->selectRaw('
                COUNT(*) as total_records,
                SUM(cost) as total_cost,
                SUM(parts_cost) as total_parts_cost,
                SUM(labor_cost) as total_labor_cost,
                SUM(duration) as total_duration,
                AVG(cost) as average_cost,
                MAX(cost) as highest_cost,
                MIN(cost) as lowest_cost
            ');

        if ($startDate) {
            $query->where('performed_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('performed_at', '<=', $endDate);
        }

        $summary = $query->first()->toArray();

        // Add cost breakdown by type
        $costByType = $equipment->maintenanceRecords()
            ->when($startDate, fn($q) => $q->where('performed_at', '>=', $startDate))
            ->when($endDate, fn($q) => $q->where('performed_at', '<=', $endDate))
            ->selectRaw('type, SUM(cost) as total_cost')
            ->groupBy('type')
            ->get()
            ->pluck('total_cost', 'type')
            ->toArray();

        return array_merge($summary, ['cost_by_type' => $costByType]);
    }

    /**
     * Check for overdue maintenance
     */
    public function checkOverdueMaintenance(): Collection
    {
        $overdueSchedules = MaintenanceSchedule::where('is_active', true)
            ->where('next_due_date', '<', Carbon::now())
            ->with('equipment')
            ->get();

        foreach ($overdueSchedules as $schedule) {
            event(new MaintenanceDueEvent($schedule));
        }

        return $overdueSchedules;
    }

    /**
     * Calculate next maintenance due date
     */
    protected function calculateNextDueDate(Carbon $fromDate, string $frequencyType, int $frequencyValue): Carbon
    {
        return match($frequencyType) {
            'daily' => $fromDate->copy()->addDays($frequencyValue),
            'weekly' => $fromDate->copy()->addWeeks($frequencyValue),
            'monthly' => $fromDate->copy()->addMonths($frequencyValue),
            'quarterly' => $fromDate->copy()->addMonths($frequencyValue * 3),
            'yearly' => $fromDate->copy()->addYears($frequencyValue),
            default => throw new \InvalidArgumentException("Invalid frequency type: {$frequencyType}")
        };
    }

    /**
     * Update schedule after maintenance is completed
     */
    protected function updateScheduleAfterMaintenance(MaintenanceSchedule $schedule): void
    {
        $schedule->update([
            'last_completed_at' => Carbon::now(),
            'next_due_date' => $this->calculateNextDueDate(
                Carbon::now(),
                $schedule->frequency_type,
                $schedule->frequency_value
            )
        ]);
    }
} 