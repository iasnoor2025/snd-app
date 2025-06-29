<?php

namespace Modules\EquipmentManagement\Services;

use Modules\EquipmentManagement\Domain\Models\Equipment;

class InventoryService
{
    public function getLowStockEquipment()
    {
        return Equipment::whereColumn('quantity', '<=', 'low_stock_threshold')->get();
    }
}
