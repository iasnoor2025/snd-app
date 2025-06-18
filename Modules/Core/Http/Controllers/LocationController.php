<?php
namespace Modules\Core\Http\Controllers;

use Modules\Core\Domain\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class LocationController extends Controller
{
    /**
     * Display a listing of locations.
     */
    public function index(Request $request)
    {
        $query = Location::query();

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->input('status') === 'active');
        }

        $locations = $query->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Locations/Index', [
            'locations' => $locations,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    /**
     * Show the form for creating a new location.
     */
    public function create()
    {
        return Inertia::render('Locations/Create');
    }

    /**
     * Store a newly created location in storage.
     */
    public function store(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:255|unique:locations,name',
            'is_active' => 'boolean',
        ];

        // If not an AJAX request, require more fields
        if (!$request->ajax() && !$request->wantsJson()) {
            $rules = array_merge($rules, [
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:255',
            ]);
        } else {
            // For AJAX/JSON requests, make these fields optional
            $rules = array_merge($rules, [
                'address' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:255',
                'state' => 'nullable|string|max:255',
                'postal_code' => 'nullable|string|max:20',
                'country' => 'nullable|string|max:255',
        ]);
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $location = Location::create($validator->validated());

            if ($request->ajax() || $request->wantsJson()) {
            return response()->json([
                'message' => 'Location created successfully',
                'name' => $location->name,
                'id' => $location->id
            ], 201);
            }

        return redirect()->route('locations.index')
                ->with('success', 'Location created successfully.');
        } catch (\Exception $e) {
            if ($request->ajax() || $request->wantsJson()) {
            return response()->json([
                'message' => 'Failed to create location',
                'error' => $e->getMessage()
            ], 500);
            }

            return back()->with('error', 'Failed to create location: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified location.
     */
    public function show($id)
    {
        try {
            $location = Location::findOrFail($id);

            // Get equipment count at this location
            $equipmentCount = $location->equipment()->count();

            // Get employee count at this location
            $employeeCount = $location->employees()->count();

            return Inertia::render('Locations/Show', [
                'location' => $location,
                'equipmentCount' => $equipmentCount,
                'employeeCount' => $employeeCount,
            ]);
        } catch (\Exception $e) {
            return redirect()->route('locations.index')
                ->with('error', 'Location not found.');
        }
    }

    /**
     * Show the form for editing the specified location.
     */
    public function edit(Location $location)
    {
        return Inertia::render('Locations/Edit', [
            'location' => $location,
        ]);
    }

    /**
     * Update the specified location in storage.
     */
    public function update(Request $request, Location $location)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean',
        ]);

        $location->update($validated);

        return redirect()->route('locations.show', $location)
                ->with('success', 'Location updated successfully.');
    }

    /**
     * Remove the specified location from storage.
     */
    public function destroy(Location $location)
    {
        // Check if location has equipment
        if ($location->equipment()->exists()) {
            return back()->with('error', 'Cannot delete location with associated equipment. Please reassign equipment first.');
        }

        $location->delete();

        return redirect()->route('locations.index')
            ->with('success', 'Location deleted successfully.');
    }
}




