<?php

namespace Modules\EquipmentManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\EquipmentManagement\Services\LocationService;

class LocationController extends Controller
{
    protected $locationService;

    public function __construct(LocationService $locationService)
    {
        $this->locationService = $locationService;
    }

    /**
     * Display a listing of the locations.
     */
    public function index(Request $request): Response
    {
        $locations = $this->locationService->getLocations($request->all());

        return Inertia::render('EquipmentManagement::Locations/Index', [
            'locations' => $locations,
            'filters' => $request->all()
        ]);
    }

    /**
     * Show the form for creating a new location.
     */
    public function create(): Response
    {
        return Inertia::render('EquipmentManagement::Locations/Create');
    }

    /**
     * Store a newly created location in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'is_active' => 'boolean'
        ]);

        $location = $this->locationService->createLocation($validated);

        return redirect()->route('equipment-management.locations.index')
            ->with('success', 'Location created successfully.');
    }

    /**
     * Display the specified location.
     */
    public function show(string $id): Response
    {
        $location = $this->locationService->getLocation($id);

        if (!$location) {
            abort(404, 'Location not found');
        }

        return Inertia::render('EquipmentManagement::Locations/Show', [
            'location' => $location
        ]);
    }

    /**
     * Show the form for editing the specified location.
     */
    public function edit(string $id): Response
    {
        $location = $this->locationService->getLocation($id);

        if (!$location) {
            abort(404, 'Location not found');
        }

        return Inertia::render('EquipmentManagement::Locations/Edit', [
            'location' => $location
        ]);
    }

    /**
     * Update the specified location in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'is_active' => 'boolean'
        ]);

        $location = $this->locationService->updateLocation($id, $validated);

        if (!$location) {
            return redirect()->back()->with('error', 'Location not found.');
        }

        return redirect()->route('equipment-management.locations.index')
            ->with('success', 'Location updated successfully.');
    }

    /**
     * Remove the specified location from storage.
     */
    public function destroy(string $id)
    {
        $deleted = $this->locationService->deleteLocation($id);

        if (!$deleted) {
            return redirect()->back()->with('error', 'Location not found or cannot be deleted.');
        }

        return redirect()->route('equipment-management.locations.index')
            ->with('success', 'Location deleted successfully.');
    }

    /**
     * Get equipment at this location.
     */
    public function equipment(string $id, Request $request)
    {
        $equipment = $this->locationService->getLocationEquipment($id, $request->all());

        return response()->json([
            'success' => true,
            'data' => $equipment,
            'message' => 'Location equipment retrieved successfully'
        ]);
    }

    /**
     * Get locations for dropdown/select.
     */
    public function options(Request $request)
    {
        $options = $this->locationService->getLocationOptions($request->all());

        return response()->json([
            'success' => true,
            'data' => $options,
            'message' => 'Location options retrieved successfully'
        ]);
    }

    /**
     * Get location statistics.
     */
    public function stats(string $id)
    {
        $stats = $this->locationService->getLocationStats($id);

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Location statistics retrieved successfully'
        ]);
    }
}
