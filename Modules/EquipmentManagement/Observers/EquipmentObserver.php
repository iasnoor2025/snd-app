<?php

namespace Modules\EquipmentManagement\Observers;

use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Events\EquipmentCreated;
use Modules\EquipmentManagement\Events\EquipmentUpdated;
use Modules\EquipmentManagement\Events\EquipmentDeleted;
use Modules\EquipmentManagement\Events\EquipmentStatusChanged;

class EquipmentObserver
{
    /**
     * Handle the Equipment "created" event.
     *
     * @param  \Modules\EquipmentManagement\Domain\Models\Equipment  $equipment
     * @return void;
     */
    public function created(Equipment $equipment)
    {
        event(new EquipmentCreated($equipment));
    }

    /**
     * Handle the Equipment "updated" event.
     *
     * @param  \Modules\EquipmentManagement\Domain\Models\Equipment  $equipment
     * @return void;
     */
    public function updated(Equipment $equipment)
    {
        event(new EquipmentUpdated($equipment));

        // Check if status has been changed
        if ($equipment->isDirty('status')) {
            event(new EquipmentStatusChanged($equipment, $equipment->getOriginal('status')));
        }
    }

    /**
     * Handle the Equipment "deleted" event.
     *
     * @param  \Modules\EquipmentManagement\Domain\Models\Equipment  $equipment
     * @return void;
     */
    public function deleted(Equipment $equipment)
    {
        event(new EquipmentDeleted($equipment));
    }

    /**
     * Handle the Equipment "restored" event.
     *
     * @param  \Modules\EquipmentManagement\Domain\Models\Equipment  $equipment
     * @return void;
     */
    public function restored(Equipment $equipment)
    {
        //
    }

    /**
     * Handle the Equipment "force deleted" event.
     *
     * @param  \Modules\EquipmentManagement\Domain\Models\Equipment  $equipment
     * @return void;
     */
    public function forceDeleted(Equipment $equipment)
    {
        //
    }
}


