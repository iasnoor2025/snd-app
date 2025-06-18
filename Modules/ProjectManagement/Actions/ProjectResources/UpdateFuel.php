<?php

namespace Modules\ProjectManagement\Actions\ProjectResources;

use Modules\ProjectManagement\Domain\Models\ProjectFuel;

class UpdateFuel
{
    /**
     * Execute the action to update an existing fuel resource.
     *
     * @param ProjectFuel $fuel
     * @param array $data
     * @return ProjectFuel
     */
    public function execute(ProjectFuel $fuel, array $data): ProjectFuel
    {
        $fuel->equipment_id = $data['equipment_id'] ?? $fuel->equipment_id;
        $fuel->date = $data['date'] ?? $fuel->date;
        $fuel->quantity = $data['quantity'] ?? $fuel->quantity;
        $fuel->unit_price = $data['unit_price'] ?? $fuel->unit_price;
        $fuel->notes = $data['notes'] ?? $fuel->notes;
        $fuel->save();

        return $fuel;
    }
}
