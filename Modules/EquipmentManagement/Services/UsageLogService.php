<?php

namespace Modules\EquipmentManagement\Services;

use Modules\EquipmentManagement\Domain\Models\UsageLog;
use Modules\EquipmentManagement\Domain\Models\Equipment;

class UsageLogService
{
    public function getLogsForEquipment(Equipment $equipment)
    {
        return $equipment->usageLogs()->orderByDesc('used_at')->get();
    }

    public function createLog(array $data): UsageLog
    {
        return UsageLog::create($data);
    }

    public function getUsageAnalytics(Equipment $equipment)
    {
        $logs = $equipment->usageLogs()->get();
        $totalUsage = $logs->sum('duration_minutes');
        $usageCount = $logs->count();
        $averageDuration = $usageCount ? $totalUsage / $usageCount : 0;
        return [
            'total_usage_minutes' => $totalUsage,
            'usage_count' => $usageCount,
            'average_duration_minutes' => $averageDuration,
        ];
    }
}
