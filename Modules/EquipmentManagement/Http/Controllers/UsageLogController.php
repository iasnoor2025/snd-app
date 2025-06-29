<?php

namespace Modules\EquipmentManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\EquipmentManagement\Services\UsageLogService;
use Modules\EquipmentManagement\Domain\Models\UsageLog;
use Modules\EquipmentManagement\Domain\Models\Equipment;

class UsageLogController extends Controller
{
    public function __construct(private UsageLogService $service) {}

    public function index(Equipment $equipment)
    {
        return response()->json([
            'data' => $this->service->getLogsForEquipment($equipment),
        ]);
    }

    public function store(Request $request, Equipment $equipment)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'used_at' => 'required|date',
            'duration_minutes' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);
        $data['equipment_id'] = $equipment->id;
        $log = $this->service->createLog($data);
        return response()->json(['message' => 'Log created', 'data' => $log]);
    }

    public function analytics(Equipment $equipment)
    {
        return response()->json([
            'data' => $this->service->getUsageAnalytics($equipment),
        ]);
    }
}
