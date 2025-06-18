<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\MaintenanceTask;
use Carbon\Carbon;

class MaintenanceTaskService
{
    /**
     * Create a new maintenance task
     *
     * @param array $data
     * @return MaintenanceTask
     */
    public function createTask(array $data): MaintenanceTask
    {
        return MaintenanceTask::create([
            'equipment_id' => $data['equipment_id'],
            'task_type' => $data['task_type'],
            'description' => $data['description'],
            'scheduled_date' => $data['scheduled_date'],
            'priority' => $data['priority'] ?? 'medium',
            'estimated_duration' => $data['estimated_duration'] ?? null,
            'assigned_to' => $data['assigned_to'] ?? null,
            'status' => 'pending'
        ]);
    }

    /**
     * Get overdue maintenance tasks
     *
     * @return Collection
     */
    public function getOverdueTasks(): Collection
    {
        return MaintenanceTask::where('scheduled_date', '<', Carbon::now())
            ->where('status', '!=', 'completed')
            ->with(['equipment'])
            ->get();
    }

    /**
     * Get upcoming maintenance tasks
     *
     * @param int $days
     * @return Collection
     */
    public function getUpcomingTasks(int $days = 7): Collection
    {
        return MaintenanceTask::whereBetween('scheduled_date', [
                Carbon::now(),
                Carbon::now()->addDays($days)
            ])
            ->where('status', '!=', 'completed')
            ->with(['equipment'])
            ->orderBy('scheduled_date')
            ->get();
    }

    /**
     * Complete a maintenance task
     *
     * @param int $taskId
     * @param array $completionData
     * @return MaintenanceTask
     */
    public function completeTask(int $taskId, array $completionData): MaintenanceTask
    {
        $task = MaintenanceTask::findOrFail($taskId);

        $task->update([
            'status' => 'completed',
            'completed_date' => Carbon::now(),
            'completion_notes' => $completionData['notes'] ?? null,
            'actual_duration' => $completionData['duration'] ?? null,
            'cost' => $completionData['cost'] ?? null
        ]);

        return $task;
    }

    /**
     * Schedule preventive maintenance for equipment
     *
     * @param Equipment $equipment
     * @return Collection
     */
    public function schedulePreventiveMaintenance(Equipment $equipment): Collection
    {
        $tasks = collect();

        // Example preventive maintenance schedule
        $maintenanceTypes = [
            ['type' => 'inspection', 'interval_days' => 30],
            ['type' => 'oil_change', 'interval_days' => 90],
            ['type' => 'filter_replacement', 'interval_days' => 180],
            ['type' => 'annual_service', 'interval_days' => 365]
        ];

        foreach ($maintenanceTypes as $maintenance) {
            $lastTask = MaintenanceTask::where('equipment_id', $equipment->id)
                ->where('task_type', $maintenance['type'])
                ->where('status', 'completed')
                ->orderBy('completed_date', 'desc')
                ->first();

            $nextDate = $lastTask
                ? Carbon::parse($lastTask->completed_date)->addDays($maintenance['interval_days'])
                : Carbon::now()->addDays($maintenance['interval_days']);

            if ($nextDate <= Carbon::now()->addDays(30)) { // Schedule if due within 30 days
                $task = $this->createTask([
                    'equipment_id' => $equipment->id,
                    'task_type' => $maintenance['type'],
                    'description' => 'Scheduled ' . str_replace('_', ' ', $maintenance['type']),
                    'scheduled_date' => $nextDate,
                    'priority' => 'medium'
                ]);

                $tasks->push($task);
            }
        }

        return $tasks;
    }

    /**
     * Get maintenance statistics
     *
     * @return array
     */
    public function getMaintenanceStats(): array
    {
        $totalTasks = MaintenanceTask::count();
        $completedTasks = MaintenanceTask::where('status', 'completed')->count();
        $overdueTasks = $this->getOverdueTasks()->count();
        $upcomingTasks = $this->getUpcomingTasks()->count();

        return [
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'overdue_tasks' => $overdueTasks,
            'upcoming_tasks' => $upcomingTasks,
            'completion_rate' => $totalTasks > 0 ? ($completedTasks / $totalTasks) * 100 : 0
        ];
    }

    /**
     * Get equipment maintenance history
     *
     * @param int $equipmentId
     * @return Collection
     */
    public function getEquipmentMaintenanceHistory(int $equipmentId): Collection
    {
        return MaintenanceTask::where('equipment_id', $equipmentId)
            ->orderBy('scheduled_date', 'desc')
            ->get();
    }
}
