<?php

namespace Modules\EquipmentManagement\Console\Commands;

use Illuminate\Console\Command;
use Modules\EquipmentManagement\Models\MaintenanceSchedule;
use Modules\EquipmentManagement\Notifications\MaintenanceDueNotification;
use Carbon\Carbon;

class CheckMaintenanceDueCommand extends Command
{
    protected $signature = 'equipment:check-maintenance';
    protected $description = 'Check for equipment maintenance due and send notifications';

    public function handle(): void
    {
        $this->info('Checking for maintenance due...');

        // Get active schedules where notifications are enabled
        $schedules = MaintenanceSchedule::query()
            ->where('is_active', true)
            ->where('notifications_enabled', true)
            ->with(['equipment', 'equipment.owner'])
            ->get();

        $notified = 0;
        foreach ($schedules as $schedule) {
            if ($this->shouldNotify($schedule)) {
                $this->notifyMaintenance($schedule);
                $notified++;
            }
        }

        $this->info("Sent {$notified} maintenance notifications");
    }

    protected function shouldNotify(MaintenanceSchedule $schedule): bool
    {
        if (!$schedule->next_due_date) {
            return false;
        }

        // If maintenance is overdue, always notify
        if ($schedule->next_due_date < Carbon::now()) {
            return true;
        }

        // Check if we're within the notification window
        $daysUntilDue = Carbon::now()->diffInDays($schedule->next_due_date, false);
        return $daysUntilDue <= $schedule->notification_days_before;
    }

    protected function notifyMaintenance(MaintenanceSchedule $schedule): void
    {
        $equipment = $schedule->equipment;
        
        // Notify equipment owner
        if ($equipment->owner) {
            $equipment->owner->notify(new MaintenanceDueNotification($schedule));
        }

        // Log the notification
        $this->info("Sent maintenance notification for equipment: {$equipment->name}");
    }
} 