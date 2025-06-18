<?php

namespace Modules\EquipmentManagement\Http\Controllers;

use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\EquipmentTracking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EquipmentTrackingController extends Controller
{
    public function index()
    {
        $equipment = Equipment::with('tracking')->get();

        return Inertia::render('Equipment/Tracking/Index', [
            'equipment' => $equipment,
        ]);
    }

    public function show(Equipment $equipment)
    {
        $tracking = $equipment->tracking()->with('currentRental')->first();

        return Inertia::render('Equipment/Tracking/Show', [
            'equipment' => $equipment,
            'tracking' => $tracking,
        ]);
    }

    public function updateLocation(Request $request, Equipment $equipment)
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'location_name' => 'required|string',
            'status' => 'required|string|in:active,inactive,maintenance,rented',
        ]);

        $tracking = $equipment->tracking()->firstOrCreate();
        $tracking->updateLocation($validated, $request->status);

        return response()->json([
            'message' => 'Location updated successfully',
            'tracking' => $tracking,
        ]);
    }

    public function getLocation(Equipment $equipment)
    {
        $tracking = $equipment->tracking()->first();

        return response()->json([
            'tracking' => $tracking,
        ]);
    }
}


