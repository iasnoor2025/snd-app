<?php

namespace Modules\EquipmentManagement\Http\Controllers;

use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\MaintenanceRecord;
use Modules\RentalManagement\Domain\Models\RentalItem;
use Modules\Core\Domain\Models\Category;
use Modules\Core\Domain\Models\Location;
use App\Http\Requests\Equipment\StoreEquipmentRequest;
use App\Http\Requests\Equipment\UpdateEquipmentRequest;
use Modules\EquipmentManagement\Traits\HandlesDocumentUploads;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class EquipmentController extends Controller
{
    use HandlesDocumentUploads;

    public function __construct()
    {
        // Removed authorizeResource to rely only on Spatie permissions
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $status = $request->input('status');
        $category = $request->input('category');
        $search = $request->input('search');

        $query = Equipment::query()->with('category');

        if ($status) {
            $query->where('status', $status);
        }

        if ($category) {
            $query->whereHas('category', function($q) use ($category) {
                $q->where('name', $category);
            });
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%")
                  ->orWhere('serial_number', 'like', "%{$search}%")
                  ->orWhere('door_number', 'like', "%{$search}%");
            });
        }

        $equipment = $query->latest()->paginate(10)->withQueryString();

        // Add category name to each equipment
        $equipment->getCollection()->transform(function ($item) {
            // Convert category object to string to avoid React rendering issues
            if ($item->category && is_object($item->category)) {
                $categoryName = $item->category->name;
                unset($item->category);
                $item->category = $categoryName;
            } else if (is_null($item->category)) {
                $item->category = '';
            }
            return $item;
        });

        // Get unique categories for filter
        $categories = Category::where('category_type', 'equipment')->pluck('name')->values();

        // Available statuses with proper formatting
        $statuses = [
            'available' => 'Available',
            'rented' => 'Rented',
            'maintenance' => 'Maintenance',
            'out_of_service' => 'Out of Service'
        ];

        return Inertia::render('Equipment/Index', [
            'equipment' => $equipment,
            'categories' => $categories,
            'statuses' => $statuses,
            'filters' => [
                'status' => $status,
                'category' => $category,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {

        // Get categories and locations with id and name
        $categories = Category::where('category_type', 'equipment')->select('id', 'name')->get();
        $locations = Location::select('id', 'name')->get();
        
        // Get employees for assignment dropdown
        $employees = \Modules\EmployeeManagement\Domain\Models\Employee::select('id', 'first_name', 'last_name')
            ->whereNull('deleted_at')
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => trim($employee->first_name . ' ' . $employee->last_name)
                ];
            });

        // Available statuses with proper formatting
        $statuses = [
            'available' => 'Available',
            'rented' => 'Rented',
            'maintenance' => 'Maintenance',
            'out_of_service' => 'Out of Service'
        ];

        return Inertia::render('Equipment/Create', [
            'categories' => $categories,
            'locations' => $locations,
            'employees' => $employees,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEquipmentRequest $request)
    {
        try {
            // Get validated data
            $validated = $request->validated();

            // Create equipment
            $equipment = Equipment::create($validated);

            // Upload documents
            $this->uploadDocuments($request, $equipment);

            return redirect()->route('equipment.index')
                ->with('success', 'Equipment created successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to create equipment', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withInput()->with('error', 'Failed to create equipment: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Equipment $equipment)
    {
        // Load relationships
        $equipment->load(['location', 'category']);

        // Create a copy of the equipment for modification
        $equipmentData = $equipment->toArray();

        // Extract names from relationships
        $equipmentData['category'] = $equipment->category ? $equipment->category->name : null;
        $equipmentData['location'] = $equipment->location ? $equipment->location->name : null;

        // Load maintenance records
        $maintenanceRecords = MaintenanceRecord::where('equipment_id', $equipment->id)
            ->with(['performer', 'approver'])
            ->latest()
            ->take(5)
            ->get();

        // Load rental history
        $rentalItems = RentalItem::where('equipment_id', $equipment->id)
            ->with(['rental.customer', 'operator'])
            ->latest()
            ->take(5)
            ->get();

        // Make sure each rental item has a valid rental.customer object
        $rentalItems = $rentalItems->map(function ($item) {
            if (!$item->rental || !$item->rental->customer) {
                // Create a default customer object if needed
                if ($item->rental) {
                    // Using stdClass instead of array to better match expected structure
                    $customer = new \stdClass();
                    $customer->id = 0;
                    $customer->company_name = 'Unknown Customer';
                    $customer->contact_person = '';
                    $customer->email = '';
                    $customer->phone = '';

                    $item->rental->customer = $customer;
                }
            }
            return $item;
        });

        return Inertia::render('Equipment/Show', [
            'equipment' => $equipmentData,
            'attachments' => $equipment->media,
            'maintenanceRecords' => [
                'data' => $maintenanceRecords,
                'total' => MaintenanceRecord::where('equipment_id', $equipment->id)->count()
            ],
            'rentalItems' => [
                'data' => $rentalItems,
                'total' => RentalItem::where('equipment_id', $equipment->id)->count()
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Equipment $equipment)
    {
        // Get categories and locations with id and name
        $categories = Category::where('category_type', 'equipment')->select('id', 'name')->get();
        $locations = Location::select('id', 'name')->get();

        // Available statuses with proper formatting
        $statuses = [
            'available' => 'Available',
            'rented' => 'Rented',
            'maintenance' => 'Maintenance',
            'out_of_service' => 'Out of Service'
        ];

        return Inertia::render('Equipment/Edit', [
            'equipment' => $equipment,
            'attachments' => $equipment->media,
            'categories' => $categories,
            'locations' => $locations,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEquipmentRequest $request, Equipment $equipment)
    {
        try {
            // Get validated data
            $validated = $request->validated();

            // Update equipment
            $equipment->update($validated);

            // Upload documents
            $this->uploadDocuments($request, $equipment);

            return redirect()->route('equipment.show', $equipment)
                ->with('success', 'Equipment updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update equipment', [
                'equipment_id' => $equipment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withInput()->with('error', 'Failed to update equipment: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Equipment $equipment)
    {
        try {
            // Check if equipment is being used in rentals
            if ($equipment->rentalItems()->exists()) {
                return back()->with('error', 'Cannot delete equipment that is being used in rentals.');
            }

            // Check if equipment has maintenance records
            if ($equipment->maintenanceRecords()->exists()) {
                return back()->with('error', 'Cannot delete equipment that has maintenance records.');
            }

            // Check if equipment is used in projects
            if ($equipment->projectEquipment()->exists()) {
                return back()->with('error', 'Cannot delete equipment that is assigned to projects.');
            }

            // Delete all associated documents
            $equipment->documents()->delete();

            // Delete all media attachments
            $equipment->clearMediaCollection('documents');

            // Delete the equipment
            $equipment->delete();

            return redirect()->route('equipment.index')
                ->with('success', 'Equipment deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete equipment', [
                'equipment_id' => $equipment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to delete equipment: ' . $e->getMessage());
        }
    }

    /**
     * Change equipment status
     */
    public function changeStatus(Request $request, Equipment $equipment)
    {
        // Check if user has permission to edit equipment
        $this->authorize('update', $equipment);

        try {
            $request->validate([
                'status' => 'required|in:available,rented,maintenance,out_of_service',
                'reason' => 'nullable|string|max:255',
            ]);

            $oldStatus = $equipment->status;
            $newStatus = $request->input('status');
            $reason = $request->input('reason', 'Status changed via system');

            $equipment->update([
                'status' => $newStatus
            ]);

            // Log the status change
            activity()
                ->performedOn($equipment)
                ->causedBy(Auth::user())
                ->withProperties([
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                    'reason' => $reason
                ])
                ->log('Equipment status updated');

            return redirect()->back()
                ->with('success', 'Equipment status updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update equipment status', [
                'equipment_id' => $equipment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to update equipment status: ' . $e->getMessage());
        }
    }

    /**
     * Display equipment availability page.
     */
    public function availability(Request $request)
    {
        $this->authorize('viewAny', Equipment::class);

        $startDate = $request->input('start_date', now()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->addDays(7)->format('Y-m-d'));
        $category = $request->input('category');

        // Get equipment with their rental information for the given period
        $query = Equipment::query()
            ->with(['category']);

        if ($category) {
            $query->whereHas('category', function($q) use ($category) {
                $q->where('name', $category);
            });
        }

        $equipment = $query->get();

        // Check each equipment for availability
        foreach ($equipment as $item) {
            $item->is_available = $item->isAvailableBetween($startDate, $endDate);
            $item->category_name = $item->category ? $item->category->name : null;
            unset($item->category); // Remove the relation to prevent circular references
        }

        // Get categories for filter
        $categories = Category::where('category_type', 'equipment')->pluck('name')->values();

        return Inertia::render('Equipment/Availability', [
            'equipment' => $equipment,
            'categories' => $categories,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'category' => $category,
            ],
        ]);
    }
}




