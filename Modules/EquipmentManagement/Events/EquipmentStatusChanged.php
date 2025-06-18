<?php

namespace Modules\EquipmentManagement\Events;

use Illuminate\Queue\SerializesModels;
use Modules\EquipmentManagement\Domain\Models\Equipment;

class EquipmentStatusChanged
{
    use SerializesModels;
use /**
     * The equipment instance.
     *
     * @var \Modules\EquipmentManagement\Domain\Models\Equipment
     */
    public $equipment;

    /**
     * The previous status.
     *
     * @var string
     */
    public $previousStatus;

    /**
     * Create a new event instance.
     *
     * @param  \Modules\EquipmentManagement\Domain\Models\Equipment  $equipment
     * @param  string  $previousStatus
     * @return void;
     */
    public function __construct(Equipment $equipment, $previousStatus)
    {
        $this->equipment = $equipment;
        $this->previousStatus = $previousStatus;
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


