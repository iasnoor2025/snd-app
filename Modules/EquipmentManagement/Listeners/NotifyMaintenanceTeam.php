<?php

namespace Modules\EquipmentManagement\Listeners;

use Modules\EquipmentManagement\Events\EquipmentStatusChanged;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;
use Modules\EquipmentManagement\Notifications\EquipmentRequiresMaintenance;

class NotifyMaintenanceTeam implements ShouldQueue
{
    use InteractsWithQueue;
use /**
     * Create the event listener.
     *
     * @return void;
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  EquipmentStatusChanged  $event
     * @return void;
     */
    public function handle(EquipmentStatusChanged $event)
    {
        // Check if the new status indicates maintenance is needed
        if ($event->equipment->status === 'needs_maintenance') {
            // Here you would get the maintenance team members
            // For simplicity, let's assume we have a maintenance role
            // $maintenanceTeam = User::role('maintenance')->get();

            // Instead, we'll just log it for now
            \Log::info('Equipment requires maintenance', [
                'equipment_id' => $event->equipment->id,
                'name' => $event->equipment->name,
                'previous_status' => $event->previousStatus,
                'current_status' => $event->equipment->status
            ]);

            // Notification example (commented out for now)
            // Notification::send($maintenanceTeam, new EquipmentRequiresMaintenance($event->equipment));
        }
    }
}


