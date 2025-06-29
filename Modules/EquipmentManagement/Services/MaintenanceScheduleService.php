<?php

namespace Modules\EquipmentManagement\Services;

use Modules\EquipmentManagement\Domain\Models\MaintenanceSchedule;
use Modules\EquipmentManagement\Domain\Models\Equipment;

/**
 * Placeholder service to make routes work
 */
class MaintenanceScheduleService
{
    // Placeholder methods to make routes work
    public function getUpcomingMaintenanceTasks()
    {
        return [];
    }

    public function getDueMaintenanceTasks()
    {
        return [];
    }

    public function getOverdueMaintenanceTasks()
    {
        return [];
    }

    public function getSchedulesForEquipment(Equipment $equipment)
    {
        return $equipment->maintenanceSchedules()->orderByDesc('scheduled_at')->get();
    }

    public function createSchedule(array $data): MaintenanceSchedule
    {
        return MaintenanceSchedule::create($data);
    }

    public function updateSchedule(MaintenanceSchedule $schedule, array $data): MaintenanceSchedule
    {
        $schedule->update($data);
        return $schedule->fresh();
    }

    public function deleteSchedule(MaintenanceSchedule $schedule): void
    {
        $schedule->delete();
    }
}
