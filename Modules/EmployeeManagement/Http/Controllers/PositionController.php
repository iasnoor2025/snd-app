<?php

namespace Modules\EmployeeManagement\Http\Controllers;

use Modules\EmployeeManagement\Domain\Models\Position;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class PositionController extends Controller
{
    // Ensure no auth middleware is applied
    public function __construct()
    {
        // Skip auth middleware for public endpoints
        $this->middleware('auth')->except(['publicIndex', 'simplePositions', 'store', 'update', 'destroy']);
    }

    /**
     * Public endpoint for positions - no authentication required
     */
    public function publicIndex()
    {
        try {
            $positions = Position::where('active', true)
                ->select('id', 'name', 'description', 'active')
                ->orderBy('name')
                ->get();

            return response()->json($positions);
        } catch (\Exception $e) {
            \Log::error('Error fetching public positions: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch positions',
                'data' => []
            ], 200); // Return 200 with empty data to prevent client errors
        }
    }

    public function index()
    {
        try {
            $positions = Position::where('active', true)
                ->select('id', 'name', 'description', 'active')
                ->orderBy('name')
                ->get();

            if (request()->wantsJson()) {
                return response()->json($positions);
            }

            return back()->with('positions', $positions);
        } catch (\Exception $e) {
            \Log::error('Error fetching positions: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch positions',
                    'error' => config('app.debug') ? $e->getMessage() : 'Server error'
                ], 500);
            }
            return back()->with('error', 'Failed to fetch positions');
        }
    }

    public function show(Position $position)
    {
        try {
            if (!$position) {
                if (request()->wantsJson()) {
                    return response()->json(['message' => 'Position not found'], 404);
                }
                return back()->with('error', 'Position not found');
            }

            if (request()->wantsJson()) {
                return response()->json($position);
            }

            return back()->with('position', $position);
        } catch (\Exception $e) {
            \Log::error('Error fetching position: ' . $e->getMessage());
            if (request()->wantsJson()) {
                return response()->json(['message' => 'Failed to fetch position'], 500);
            }
            return back()->with('error', 'Failed to fetch position');
        }
    }

    protected function clearPositionCaches()
    {
        // Clear the active positions cache
        Cache::forget('active_positions');

        // Clear any employee-related caches that might contain position data
        $employeeService = app(\Modules\EmployeeManagement\Services\EmployeeService::class);
        if (method_exists($employeeService, 'clearEmployeeCaches')) {
            $employeeService->clearEmployeeCaches();
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:positions,name',
                'description' => 'nullable|string|max:1000',
            ]);

            // Create the position without requiring authentication
            $position = Position::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'active' => true,
            ]);

            // Clear all position-related caches
            $this->clearPositionCaches();

            if (request()->wantsJson()) {
                return response()->json($position, 201);
            }

            return back()->with('success', 'Position created successfully');
        } catch (ValidationException $e) {
            if (request()->wantsJson()) {
                return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
            }
            return back()->withErrors($e->errors());
        } catch (\Exception $e) {
            \Log::error('Error creating position: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            if (request()->wantsJson()) {
                return response()->json([
                    'message' => 'Failed to create position',
                    'error' => config('app.debug') ? $e->getMessage() : 'Server error'
                ], 500);
            }
            return back()->with('error', 'Failed to create position');
        }
    }

    public function update(Request $request, Position $position)
    {
        try {
            \Log::info('Updating position:', [
                'position_id' => $position->id,
                'request_data' => $request->all()
            ]);

            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255', Rule::unique('positions')->ignore($position->id)],
                'description' => 'nullable|string|max:1000',
                'active' => 'boolean'
            ]);

            \Log::info('Validated data:', ['validated' => $validated]);

            DB::beginTransaction();
            try {
                $position->update([
                    'name' => $validated['name'],
                    'description' => $validated['description'] ?? null,
                    'active' => $validated['active'] ?? true
                ]);

                // Clear all position-related caches
                $this->clearPositionCaches();

                DB::commit();

                \Log::info('Position updated successfully:', ['position' => $position->fresh()->toArray()]);

                if (request()->wantsJson()) {
                    return response()->json($position->fresh());
                }

                return back()->with('success', 'Position updated successfully');
            } catch (\Exception $e) {
                DB::rollBack();
                \Log::error('Error during position update:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'position_id' => $position->id,
                    'validated_data' => $validated
                ]);
                throw $e;
            }
        } catch (ValidationException $e) {
            \Log::error('Validation error updating position:', [
                'errors' => $e->errors(),
                'position_id' => $position->id,
                'request_data' => $request->all()
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $e->errors()
                ], 422);
            }
            return back()->withErrors($e->errors());
        } catch (\Exception $e) {
            \Log::error('Error updating position:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'position_id' => $position->id,
                'request_data' => $request->all()
            ]);

            if (request()->wantsJson()) {
                return response()->json([
                    'message' => 'Failed to update position',
                    'error' => $e->getMessage()
                ], 500);
            }
            return back()->with('error', 'Failed to update position');
        }
    }

    public function destroy(Position $position)
    {
        try {
            if (!$position) {
                if (request()->wantsJson()) {
                    return response()->json(['message' => 'Position not found'], 404);
                }
                return back()->with('error', 'Position not found');
            }

            $position->delete();

            // Clear all position-related caches
            $this->clearPositionCaches();

            if (request()->wantsJson()) {
                return response()->json(null, 204);
            }

            return back()->with('success', 'Position deleted successfully');
        } catch (\Exception $e) {
            \Log::error('Error deleting position: ' . $e->getMessage());
            if (request()->wantsJson()) {
                return response()->json(['message' => 'Failed to delete position'], 500);
            }
            return back()->with('error', 'Failed to delete position');
        }
    }

    public function getList()
    {
        try {
            // Log the request
            \Log::info('Positions list request received', [
                'user_id' => auth()->id(),
                'session_id' => session()->getId(),
            ]);

            // Get all active positions, ordered by name
            $positions = \Modules\EmployeeManagement\Domain\Models\Position::where('active', true)
                ->orderBy('name')
                ->get();

            // Log the query result
            \Log::info('Positions query result:', [
                'count' => $positions->count(),
                'positions' => $positions->toArray()
            ]);

            return response()->json($positions);
        } catch (\Exception $e) {
            \Log::error('Error fetching positions: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to fetch positions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function create(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:positions',
                'description' => 'nullable|string',
            ]);

            $position = \Modules\EmployeeManagement\Domain\Models\Position::create([
                'name' => $request->name,
                'description' => $request->description,
                'active' => true,
            ]);

            // Clear all position-related caches
            $this->clearPositionCaches();

            return response()->json($position, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error creating position: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create position',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function webUpdate(Request $request, \Modules\EmployeeManagement\Domain\Models\Position $position)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:positions,name,' . $position->id,
                'description' => 'nullable|string',
            ]);

            $position->update([
                'name' => $request->name,
                'description' => $request->description,
            ]);

            // Clear all position-related caches
            $this->clearPositionCaches();

            return response()->json($position);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating position: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update position',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function webDelete(\Modules\EmployeeManagement\Domain\Models\Position $position)
    {
        try {
            $position->delete();

            // Clear all position-related caches
            $this->clearPositionCaches();

            return response()->json(null, 204);
        } catch (\Exception $e) {
            \Log::error('Error deleting position: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete position',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Public endpoint for simple positions - no authentication required, no translations
     */
    public function simplePositions()
    {
        try {
            // Get positions from database
            $dbPositions = Position::where('active', true)
                ->select('id', 'name', 'description', 'active')
                ->orderBy('name')
                ->get();
            
            // Convert translatable fields to simple strings
            $positions = $dbPositions->map(function ($position) {
                $name = is_array($position->name) || is_object($position->name) 
                    ? (isset($position->name['en']) ? $position->name['en'] : reset($position->name)) 
                    : $position->name;
                
                $description = null;
                if (!empty($position->description)) {
                    $description = is_array($position->description) || is_object($position->description)
                        ? (isset($position->description['en']) ? $position->description['en'] : reset($position->description))
                        : $position->description;
                }
                
                return [
                    'id' => $position->id,
                    'name' => $name,
                    'description' => $description,
                    'active' => (bool) $position->active
                ];
            });
            
            return response()->json($positions);
        } catch (\Exception $e) {
            \Log::error('Error fetching simple positions: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch positions',
                'data' => []
            ], 200); // Return 200 with empty data to prevent client errors
        }
    }
}


