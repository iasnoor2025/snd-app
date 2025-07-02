<?php

namespace Modules\EquipmentManagement\Http\Controllers\Api;

use Illuminate\Routing\Controller;
use Modules\EquipmentManagement\Domain\Models\Equipment;

class WidgetController extends Controller
{
    /**
     * Get all equipment for dashboard widget.
     */
    public function all()
    {
        $equipment = Equipment::select('id', 'name', 'status', 'category_id', 'location_id')
            ->with(['category:id,name', 'location:id,name'])
            ->get();

        return response()->json([
            'data' => $equipment,
            'count' => $equipment->count(),
        ]);
    }
}
