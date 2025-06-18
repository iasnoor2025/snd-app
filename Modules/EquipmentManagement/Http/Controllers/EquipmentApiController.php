<?php
namespace Modules\EquipmentManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Illuminate\Http\Request;

class EquipmentApiController extends Controller
{
    /**
     * Get a list of equipment for dropdowns
     *
     * @return \Illuminate\Http\JsonResponse;
     */
    public function index()
    {
        $equipment = Equipment::where('status', 'available')
            ->select('id', 'name', 'model', 'door_number', 'daily_rate')
            ->orderBy('name')
            ->get();

        return response()->json($equipment);
    }
}


