<?php

namespace Modules\EquipmentManagement\Events;

use Illuminate\Queue\SerializesModels;
use Modules\EquipmentManagement\Domain\Models\Equipment;

class EquipmentCreated
{
    use SerializesModels;
use /**
     * The equipment instance.
     *
     * @var \Modules\EquipmentManagement\Domain\Models\Equipment
     */
    public $equipment;

    /**
     * Create a new event instance.
     *
     * @param  \Modules\EquipmentManagement\Domain\Models\Equipment  $equipment
     * @return void;
     */
    public function __construct(Equipment $equipment)
    {
        $this->equipment = $equipment;
    }

    /**
     * Get the channels the event should be broadcast on.
     *
     * @return array;
     */
    public function broadcastOn()
    {
        return [];
    }
}


