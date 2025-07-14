<?php

namespace Modules\EquipmentManagement\Services;

use App\Models\Equipment;
use Illuminate\Support\Facades\Date;

class EquipmentService
{
    public function calculateCurrentValue($equipment)
    {
        if (!$equipment->purchase_cost || !$equipment->purchase_date || !$equipment->depreciation_years) {
            return null;
        }
        $yearsUsed = now()->diffInYears($equipment->purchase_date);
        $depreciationPerYear = $equipment->purchase_cost / $equipment->depreciation_years;
        $currentValue = $equipment->purchase_cost - ($yearsUsed * $depreciationPerYear);
        return max($currentValue, 0);
    }
}
