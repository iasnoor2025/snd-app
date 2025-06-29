<?php

namespace Modules\RentalManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\RentalManagement\Domain\Models\Rental;
use Illuminate\Http\Response;
use Exception;

class RentalController extends Controller
{
    /**
     * Display a listing of rentals.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Rental::with(['customer', 'rentalItems', 'equipment']);

            // Apply filters if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('customer_id')) {
                $query->where('customer_id', $request->customer_id);
            }

            if ($request->has('date_from')) {
                $query->whereDate('rental_date', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('rental_date', '<=', $request->date_to);
            }

            $rentals = $query->paginate($request->get('per_page', 15));

            // Add followup_sent_at to each rental in the response
            $rentals->getCollection()->transform(function ($rental) {
                $rental->followup_sent_at = $rental->followup_sent_at;
                return $rental;
            });

            return response()->json([
                'success' => true,
                'data' => $rentals,
                'message' => 'Rentals retrieved successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve rentals',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created rental.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'customer_id' => 'required|exists:customers,id',
                'rental_date' => 'required|date',
                'return_date' => 'required|date|after:rental_date',
                'total_amount' => 'required|numeric|min:0',
                'deposit_amount' => 'nullable|numeric|min:0',
                'status' => 'required|in:pending,active,completed,cancelled',
                'notes' => 'nullable|string',
                'items' => 'required|array',
                'items.*.equipment_id' => 'required|exists:equipment,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.rate' => 'required|numeric|min:0'
            ]);

            $rental = Rental::create($validated);

            // Create rental items if provided
            if (isset($validated['items'])) {
                foreach ($validated['items'] as $item) {
                    $rental->rentalItems()->create($item);
                }
            }

            $rental->load(['customer', 'rentalItems', 'equipment']);

            return response()->json([
                'success' => true,
                'data' => $rental,
                'message' => 'Rental created successfully'
            ], Response::HTTP_CREATED);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create rental',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified rental.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $rental = Rental::with(['customer', 'rentalItems', 'equipment', 'extensions', 'history'])
                ->findOrFail($id);
            $rental->followup_sent_at = $rental->followup_sent_at;
            return response()->json([
                'success' => true,
                'data' => $rental,
                'message' => 'Rental retrieved successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Rental not found',
                'error' => $e->getMessage()
            ], Response::HTTP_NOT_FOUND);
        }
    }

    /**
     * Update the specified rental.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $rental = Rental::findOrFail($id);

            $validated = $request->validate([
                'customer_id' => 'sometimes|exists:customers,id',
                'rental_date' => 'sometimes|date',
                'return_date' => 'sometimes|date|after:rental_date',
                'total_amount' => 'sometimes|numeric|min:0',
                'deposit_amount' => 'nullable|numeric|min:0',
                'status' => 'sometimes|in:pending,active,completed,cancelled',
                'notes' => 'nullable|string'
            ]);

            $rental->update($validated);
            $rental->load(['customer', 'rentalItems', 'equipment']);

            return response()->json([
                'success' => true,
                'data' => $rental,
                'message' => 'Rental updated successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update rental',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified rental.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $rental = Rental::findOrFail($id);
            $rental->delete();

            return response()->json([
                'success' => true,
                'message' => 'Rental deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete rental',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Extend rental period.
     */
    public function extend(Request $request, string $id): JsonResponse
    {
        try {
            $rental = Rental::findOrFail($id);

            $validated = $request->validate([
                'new_return_date' => 'required|date|after:return_date',
                'extension_fee' => 'required|numeric|min:0',
                'reason' => 'nullable|string'
            ]);

            // Create extension record
            $rental->extensions()->create([
                'original_return_date' => $rental->return_date,
                'new_return_date' => $validated['new_return_date'],
                'extension_fee' => $validated['extension_fee'],
                'reason' => $validated['reason'] ?? null,
                'extended_by' => auth()->id()
            ]);

            // Update rental
            $rental->update([
                'return_date' => $validated['new_return_date'],
                'total_amount' => $rental->total_amount + $validated['extension_fee']
            ]);

            $rental->load(['customer', 'items', 'equipment', 'extensions']);

            return response()->json([
                'success' => true,
                'data' => $rental,
                'message' => 'Rental extended successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to extend rental',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Return rental equipment.
     */
    public function return(Request $request, string $id): JsonResponse
    {
        try {
            $rental = Rental::findOrFail($id);

            $validated = $request->validate([
                'return_condition' => 'required|string',
                'damage_notes' => 'nullable|string',
                'late_fee' => 'nullable|numeric|min:0',
                'damage_fee' => 'nullable|numeric|min:0'
            ]);

            // Update rental status and return details
            $rental->update([
                'status' => 'completed',
                'actual_return_date' => now(),
                'return_condition' => $validated['return_condition'],
                'damage_notes' => $validated['damage_notes'] ?? null,
                'late_fee' => $validated['late_fee'] ?? 0,
                'damage_fee' => $validated['damage_fee'] ?? 0,
                'total_amount' => $rental->total_amount + ($validated['late_fee'] ?? 0) + ($validated['damage_fee'] ?? 0)
            ]);

            $rental->load(['customer', 'items', 'equipment']);

            return response()->json([
                'success' => true,
                'data' => $rental,
                'message' => 'Rental returned successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process rental return',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get automated follow-up settings.
     */
    public function getFollowUpSettings()
    {
        $settings = config('rentalmanagement.automated_followups');
        return response()->json($settings);
    }

    /**
     * Update automated follow-up settings.
     */
    public function updateFollowUpSettings(Request $request)
    {
        // In a real app, this should be persisted in DB or settings table
        $validated = $request->validate([
            'enabled' => 'boolean',
            'delay_days' => 'integer|min:1|max:30',
            'default_template' => 'string|max:1000',
        ]);
        // For now, just return the new settings (simulate update)
        return response()->json($validated);
    }
}
