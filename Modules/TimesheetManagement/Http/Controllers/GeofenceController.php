<?php

namespace Modules\TimesheetManagement\Http\Controllers;

use Modules\TimesheetManagement\Domain\Models\GeofenceZone;
use Modules\TimesheetManagement\Services\GeofencingService;
use Modules\TimesheetManagement\Http\Requests\CreateGeofenceZoneRequest;
use Modules\TimesheetManagement\Http\Requests\UpdateGeofenceZoneRequest;
use Modules\Core\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class GeofenceController extends Controller
{
    public function __construct(
        private GeofencingService $geofencingService
    ) {
        $this->middleware('auth:sanctum');
    }

    /**
     * Display a listing of geofence zones
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = GeofenceZone::query();

            // Filter by project if specified
            if ($request->has('project_id')) {
                $query->where('project_id', $request->project_id);
            }

            // Filter by active status
            if ($request->has('active')) {
                $query->where('is_active', $request->boolean('active'));
            }

            // Filter by zone type
            if ($request->has('zone_type')) {
                $query->where('zone_type', $request->zone_type);
            }

            // Search by name
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            $zones = $query->with(['project'])
                ->orderBy('name')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $zones,
                'message' => 'Geofence zones retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve geofence zones', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve geofence zones'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created geofence zone
     */
    public function store(CreateGeofenceZoneRequest $request): JsonResponse
    {
        try {
            $zone = $this->geofencingService->createZone($request->validated());

            Log::info('Geofence zone created', [
                'zone_id' => $zone->id,
                'name' => $zone->name,
                'created_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'data' => $zone->load('project'),
                'message' => 'Geofence zone created successfully'
            ], Response::HTTP_CREATED);

        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);

        } catch (\Exception $e) {
            Log::error('Failed to create geofence zone', [
                'error' => $e->getMessage(),
                'data' => $request->validated(),
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create geofence zone'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified geofence zone
     */
    public function show(GeofenceZone $geofence): JsonResponse
    {
        try {
            $geofence->load(['project', 'activityLogs' => function ($query) {
                $query->latest()->limit(10);
            }]);

            return response()->json([
                'success' => true,
                'data' => $geofence,
                'message' => 'Geofence zone retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve geofence zone', [
                'zone_id' => $geofence->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve geofence zone'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update the specified geofence zone
     */
    public function update(UpdateGeofenceZoneRequest $request, GeofenceZone $geofence): JsonResponse
    {
        try {
            $updatedZone = $this->geofencingService->updateZone($geofence, $request->validated());

            Log::info('Geofence zone updated', [
                'zone_id' => $updatedZone->id,
                'name' => $updatedZone->name,
                'updated_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'data' => $updatedZone->load('project'),
                'message' => 'Geofence zone updated successfully'
            ]);

        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);

        } catch (\Exception $e) {
            Log::error('Failed to update geofence zone', [
                'zone_id' => $geofence->id,
                'error' => $e->getMessage(),
                'data' => $request->validated(),
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update geofence zone'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified geofence zone
     */
    public function destroy(GeofenceZone $geofence): JsonResponse
    {
        try {
            $zoneName = $geofence->name;
            $geofence->delete();

            Log::info('Geofence zone deleted', [
                'zone_id' => $geofence->id,
                'name' => $zoneName,
                'deleted_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Geofence zone deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to delete geofence zone', [
                'zone_id' => $geofence->id,
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete geofence zone'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Validate a location against geofence zones
     */
    public function validateLocation(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'project_id' => 'nullable|integer|exists:projects,id',
            'employee_id' => 'nullable|integer|exists:users,id'
        ]);

        try {
            $validation = $this->geofencingService->validateLocation(
                $request->latitude,
                $request->longitude,
                $request->project_id,
                $request->employee_id
            );

            return response()->json([
                'success' => true,
                'data' => $validation,
                'message' => 'Location validation completed'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to validate location', [
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'project_id' => $request->project_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to validate location'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get geofence statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        $request->validate([
            'project_id' => 'nullable|integer|exists:projects,id',
            'employee_id' => 'nullable|integer|exists:users,id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from'
        ]);

        try {
            $statistics = $this->geofencingService->getGeofenceStatistics(
                $request->project_id,
                $request->employee_id,
                $request->date_from,
                $request->date_to
            );

            return response()->json([
                'success' => true,
                'data' => $statistics,
                'message' => 'Geofence statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve geofence statistics', [
                'project_id' => $request->project_id,
                'employee_id' => $request->employee_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve geofence statistics'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get recent geofence violations
     */
    public function violations(Request $request): JsonResponse
    {
        $request->validate([
            'project_id' => 'nullable|integer|exists:projects,id',
            'limit' => 'nullable|integer|min:1|max:100'
        ]);

        try {
            $violations = $this->geofencingService->getRecentViolations(
                $request->get('limit', 50),
                $request->project_id
            );

            return response()->json([
                'success' => true,
                'data' => $violations,
                'message' => 'Recent violations retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve recent violations', [
                'project_id' => $request->project_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve recent violations'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get work area coverage analytics
     */
    public function workAreaCoverage(Request $request): JsonResponse
    {
        $request->validate([
            'project_id' => 'nullable|integer|exists:projects,id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from'
        ]);

        try {
            $coverage = $this->geofencingService->calculateWorkAreaCoverage(
                $request->project_id,
                $request->date_from,
                $request->date_to
            );

            return response()->json([
                'success' => true,
                'data' => $coverage,
                'message' => 'Work area coverage calculated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to calculate work area coverage', [
                'project_id' => $request->project_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to calculate work area coverage'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Toggle geofence zone active status
     */
    public function toggleActive(GeofenceZone $geofence): JsonResponse
    {
        try {
            $geofence->is_active = !$geofence->is_active;
            $geofence->save();

            $status = $geofence->is_active ? 'activated' : 'deactivated';

            Log::info("Geofence zone {$status}", [
                'zone_id' => $geofence->id,
                'name' => $geofence->name,
                'is_active' => $geofence->is_active,
                'updated_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'data' => $geofence,
                'message' => "Geofence zone {$status} successfully"
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to toggle geofence zone status', [
                'zone_id' => $geofence->id,
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update geofence zone status'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
