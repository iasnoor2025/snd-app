<?php

namespace Modules\EmployeeManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\EmployeeManagement\Domain\Models\Position;
use Illuminate\Support\Facades\Log;

class PublicDesignationController extends Controller
{
    /**
     * Get a list of positions in simple format (no translations)
     */
    public function index()
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
            Log::error('Error fetching simple positions: ' . $e->getMessage(), [
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

    /**
     * Create a new position
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:positions,name',
                'description' => 'nullable|string|max:1000',
            ]);

            // Create the position
            $position = Position::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'active' => true,
            ]);

            return response()->json($position, 201);
        } catch (\Exception $e) {
            Log::error('Error creating position: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create position',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a position
     */
    public function update(Request $request, $id)
    {
        try {
            $position = Position::findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:positions,name,' . $position->id,
                'description' => 'nullable|string|max:1000',
            ]);

            $position->update([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
            ]);

            return response()->json($position);
        } catch (\Exception $e) {
            Log::error('Error updating position: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update position',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a position
     */
    public function destroy($id)
    {
        try {
            $position = Position::findOrFail($id);
            $position->delete();

            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Error deleting position: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete position',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
