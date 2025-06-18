<?php

namespace Modules\EquipmentManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\EquipmentManagement\Domain\Equipment;
use Illuminate\Http\Response;
use Exception;

class EquipmentController extends Controller
{
    /**
     * Display a listing of equipment.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Equipment::with(['category', 'location', 'maintenance']);

            // Apply filters if provided
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('location_id')) {
                $query->where('location_id', $request->location_id);
            }

            if ($request->has('available_only')) {
                $query->where('status', 'available');
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('model', 'like', "%{$search}%")
                      ->orWhere('serial_number', 'like', "%{$search}%");
                });
            }

            $equipment = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $equipment,
                'message' => 'Equipment retrieved successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve equipment',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created equipment.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'category_id' => 'required|exists:equipment_categories,id',
                'model' => 'nullable|string|max:255',
                'serial_number' => 'required|string|unique:equipment,serial_number',
                'purchase_date' => 'nullable|date',
                'purchase_price' => 'nullable|numeric|min:0',
                'rental_rate_daily' => 'required|numeric|min:0',
                'rental_rate_weekly' => 'nullable|numeric|min:0',
                'rental_rate_monthly' => 'nullable|numeric|min:0',
                'status' => 'required|in:available,rented,maintenance,retired',
                'location_id' => 'nullable|exists:locations,id',
                'condition' => 'required|in:excellent,good,fair,poor',
                'notes' => 'nullable|string'
            ]);

            $equipment = Equipment::create($validated);
            $equipment->load(['category', 'location']);

            return response()->json([
                'success' => true,
                'data' => $equipment,
                'message' => 'Equipment created successfully'
            ], Response::HTTP_CREATED);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create equipment',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified equipment.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $equipment = Equipment::with(['category', 'location', 'maintenance', 'rentals'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $equipment,
                'message' => 'Equipment retrieved successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Equipment not found',
                'error' => $e->getMessage()
            ], Response::HTTP_NOT_FOUND);
        }
    }

    /**
     * Update the specified equipment.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $equipment = Equipment::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'category_id' => 'sometimes|exists:equipment_categories,id',
                'model' => 'nullable|string|max:255',
                'serial_number' => 'sometimes|string|unique:equipment,serial_number,' . $id,
                'purchase_date' => 'nullable|date',
                'purchase_price' => 'nullable|numeric|min:0',
                'rental_rate_daily' => 'sometimes|numeric|min:0',
                'rental_rate_weekly' => 'nullable|numeric|min:0',
                'rental_rate_monthly' => 'nullable|numeric|min:0',
                'status' => 'sometimes|in:available,rented,maintenance,retired',
                'location_id' => 'nullable|exists:locations,id',
                'condition' => 'sometimes|in:excellent,good,fair,poor',
                'notes' => 'nullable|string'
            ]);

            $equipment->update($validated);
            $equipment->load(['category', 'location']);

            return response()->json([
                'success' => true,
                'data' => $equipment,
                'message' => 'Equipment updated successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update equipment',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified equipment.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $equipment = Equipment::findOrFail($id);

            // Check if equipment is currently rented
            if ($equipment->status === 'rented') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete equipment that is currently rented'
                ], Response::HTTP_CONFLICT);
            }

            $equipment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Equipment deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete equipment',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get equipment availability.
     */
    public function availability(Request $request, string $id): JsonResponse
    {
        try {
            $equipment = Equipment::findOrFail($id);

            $validated = $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date'
            ]);

            // Check for conflicting rentals
            $conflictingRentals = $equipment->rentals()
                ->where('status', '!=', 'cancelled')
                ->where(function($query) use ($validated) {
                    $query->whereBetween('rental_date', [$validated['start_date'], $validated['end_date']])
                          ->orWhereBetween('return_date', [$validated['start_date'], $validated['end_date']])
                          ->orWhere(function($q) use ($validated) {
                              $q->where('rental_date', '<=', $validated['start_date'])
                                ->where('return_date', '>=', $validated['end_date']);
                          });
                })
                ->exists();

            $isAvailable = !$conflictingRentals && $equipment->status === 'available';

            return response()->json([
                'success' => true,
                'data' => [
                    'equipment_id' => $equipment->id,
                    'is_available' => $isAvailable,
                    'status' => $equipment->status,
                    'period' => [
                        'start_date' => $validated['start_date'],
                        'end_date' => $validated['end_date']
                    ]
                ],
                'message' => 'Equipment availability checked successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check equipment availability',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Schedule maintenance for equipment.
     */
    public function scheduleMaintenance(Request $request, string $id): JsonResponse
    {
        try {
            $equipment = Equipment::findOrFail($id);

            $validated = $request->validate([
                'maintenance_type' => 'required|string',
                'scheduled_date' => 'required|date|after:today',
                'description' => 'nullable|string',
                'estimated_duration' => 'nullable|integer|min:1', // in hours
                'cost_estimate' => 'nullable|numeric|min:0'
            ]);

            // Create maintenance record
            $maintenance = $equipment->maintenance()->create([
                'type' => $validated['maintenance_type'],
                'scheduled_date' => $validated['scheduled_date'],
                'description' => $validated['description'] ?? null,
                'estimated_duration' => $validated['estimated_duration'] ?? null,
                'cost_estimate' => $validated['cost_estimate'] ?? null,
                'status' => 'scheduled',
                'scheduled_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'data' => $maintenance,
                'message' => 'Maintenance scheduled successfully'
            ], Response::HTTP_CREATED);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to schedule maintenance',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
