<?php

namespace Modules\EquipmentManagement\Services;

use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\UsageLog;
use Modules\EquipmentManagement\Domain\Models\PurchaseOrder;

class InventoryForecastService
{
    public function forecastForEquipment(Equipment $equipment, int $days = 30)
    {
        $usage = UsageLog::where('equipment_id', $equipment->id)
            ->where('used_at', '>=', now()->subDays($days))
            ->sum('duration_minutes');
        $orders = PurchaseOrder::where('equipment_id', $equipment->id)
            ->where('order_date', '>=', now()->subDays($days))
            ->sum('quantity');
        // Simple forecast: average daily usage minus incoming orders
        $avgDailyUsage = $usage / $days;
        $forecast = $equipment->quantity - ($avgDailyUsage * $days) + $orders;
        return [
            'avg_daily_usage_minutes' => $avgDailyUsage,
            'incoming_orders' => $orders,
            'forecast_quantity' => $forecast,
        ];
    }
}
