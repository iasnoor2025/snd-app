<?php

namespace Modules\EquipmentManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;
use Modules\EquipmentManagement\Models\MaintenanceSchedule;

class MaintenanceScheduleApiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $schedules = MaintenanceSchedule::all();
        return response($schedules);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): Response
    {
        $data = $request->validate([
            // Add your validation rules here
        ]);
        $schedule = MaintenanceSchedule::create($data);
        return response($schedule, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id): Response
    {
        $schedule = MaintenanceSchedule::findOrFail($id);
        return response($schedule);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): Response
    {
        $schedule = MaintenanceSchedule::findOrFail($id);
        $data = $request->validate([
            // Add your validation rules here
        ]);
        $schedule->update($data);
        return response($schedule);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): Response
    {
        $schedule = MaintenanceSchedule::findOrFail($id);
        $schedule->delete();
        return response(null, 204);
    }
}
