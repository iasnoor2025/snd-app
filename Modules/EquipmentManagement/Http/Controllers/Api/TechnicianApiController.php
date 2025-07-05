<?php

namespace Modules\EquipmentManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\EquipmentManagement\Services\TechnicianService;
use Modules\EquipmentManagement\Services\MaintenanceService;

class TechnicianApiController extends Controller
{
    protected $technicianService;
    protected $maintenanceService;

    public function __construct(TechnicianService $technicianService, MaintenanceService $maintenanceService)
    {
        $this->technicianService = $technicianService;
        $this->maintenanceService = $maintenanceService;
    }

    /**
     * Display a listing of technicians.
     */
    public function index(Request $request): JsonResponse
    {
        $technicians = $this->technicianService->getTechnicians($request->all());

        return response()->json([
            'success' => true,
            'data' => $technicians,
            'message' => 'Technicians retrieved successfully'
        ]);
    }

    /**
     * Store a newly created technician.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'specialization' => 'required|array',
            'certification_level' => 'required|string|in:junior,senior,expert,master',
            'hourly_rate' => 'required|numeric|min:0',
            'availability_status' => 'required|string|in:available,busy,unavailable',
            'skills' => 'nullable|array',
            'certifications' => 'nullable|array',
            'is_active' => 'boolean'
        ]);

        $technician = $this->technicianService->createTechnician($validated);

        return response()->json([
            'success' => true,
            'data' => $technician,
            'message' => 'Technician created successfully'
        ], 201);
    }

    /**
     * Display the specified technician.
     */
    public function show(string $id): JsonResponse
    {
        $technician = $this->technicianService->getTechnician($id);

        if (!$technician) {
            return response()->json([
                'success' => false,
                'message' => 'Technician not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $technician,
            'message' => 'Technician retrieved successfully'
        ]);
    }

    /**
     * Update the specified technician.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'sometimes|exists:employees,id',
            'specialization' => 'sometimes|array',
            'certification_level' => 'sometimes|string|in:junior,senior,expert,master',
            'hourly_rate' => 'sometimes|numeric|min:0',
            'availability_status' => 'sometimes|string|in:available,busy,unavailable',
            'skills' => 'nullable|array',
            'certifications' => 'nullable|array',
            'is_active' => 'boolean'
        ]);

        $technician = $this->technicianService->updateTechnician($id, $validated);

        if (!$technician) {
            return response()->json([
                'success' => false,
                'message' => 'Technician not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $technician,
            'message' => 'Technician updated successfully'
        ]);
    }

    /**
     * Remove the specified technician.
     */
    public function destroy(string $id): JsonResponse
    {
        $deleted = $this->technicianService->deleteTechnician($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Technician not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Technician deleted successfully'
        ]);
    }

    /**
     * Get available technicians for assignment.
     */
    public function available(Request $request): JsonResponse
    {
        $technicians = $this->technicianService->getAvailableTechnicians($request->all());

        return response()->json([
            'success' => true,
            'data' => $technicians,
            'message' => 'Available technicians retrieved successfully'
        ]);
    }

    /**
     * Get technician's assigned maintenance tasks.
     */
    public function maintenanceTasks(string $id, Request $request): JsonResponse
    {
        $tasks = $this->maintenanceService->getTechnicianTasks($id, $request->all());

        return response()->json([
            'success' => true,
            'data' => $tasks,
            'message' => 'Technician maintenance tasks retrieved successfully'
        ]);
    }

    /**
     * Get technician's work schedule.
     */
    public function schedule(string $id, Request $request): JsonResponse
    {
        $schedule = $this->technicianService->getTechnicianSchedule($id, $request->all());

        return response()->json([
            'success' => true,
            'data' => $schedule,
            'message' => 'Technician schedule retrieved successfully'
        ]);
    }

    /**
     * Update technician availability.
     */
    public function updateAvailability(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'availability_status' => 'required|string|in:available,busy,unavailable',
            'notes' => 'nullable|string|max:500'
        ]);

        $technician = $this->technicianService->updateAvailability($id, $validated);

        if (!$technician) {
            return response()->json([
                'success' => false,
                'message' => 'Technician not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $technician,
            'message' => 'Technician availability updated successfully'
        ]);
    }

    /**
     * Get technician performance metrics.
     */
    public function performance(string $id, Request $request): JsonResponse
    {
        $performance = $this->technicianService->getPerformanceMetrics($id, $request->all());

        return response()->json([
            'success' => true,
            'data' => $performance,
            'message' => 'Technician performance metrics retrieved successfully'
        ]);
    }

    /**
     * Assign technician to maintenance task.
     */
    public function assignTask(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'maintenance_task_id' => 'required|exists:maintenance_tasks,id',
            'priority' => 'required|string|in:low,medium,high,urgent',
            'estimated_hours' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000'
        ]);

        $assignment = $this->technicianService->assignTask($id, $validated);

        return response()->json([
            'success' => true,
            'data' => $assignment,
            'message' => 'Task assigned to technician successfully'
        ]);
    }

    /**
     * Get technician statistics.
     */
    public function stats(string $id): JsonResponse
    {
        $stats = $this->technicianService->getTechnicianStats($id);

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Technician statistics retrieved successfully'
        ]);
    }
}
