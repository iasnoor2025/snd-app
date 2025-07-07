<?php

namespace Modules\RentalManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Services\RentalService;

class RentalController extends Controller
{
    protected $rentalService;

    public function __construct(RentalService $rentalService)
    {
        $this->rentalService = $rentalService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        \Log::info('RentalController@index called');

        // Get filters from request
        $filters = $request->only(['search', 'status', 'date_from', 'date_to']);

        // Get paginated rentals from service
        $rentals = $this->rentalService->getPaginatedRentals(15, $filters);

        \Log::info('Rentals data from service:', ['count' => $rentals->count(), 'data' => $rentals->toArray()]);

        return Inertia::render('Rentals/Index', [
            'rentals' => $rentals,
            'filters' => $filters
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get active customers
        $customers = \Modules\CustomerManagement\Domain\Models\Customer::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'company_name', 'contact_person', 'email', 'phone'])
            ->map(function ($customer) {
                $name = $customer->name;
                if (is_array($name)) {
                    $name = $name['en'] ?? reset($name) ?? '';
                }
                return [
                    'id' => $customer->id,
                    'name' => $name,
                    'company_name' => $customer->company_name,
                    'contact_person' => $customer->contact_person,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                ];
            });

        // Get available equipment
        $equipment = \Modules\EquipmentManagement\Domain\Models\Equipment::where('is_active', true)
            ->where('status', '=', 'available')
            ->with(['category:id,name'])
            ->orderBy('name')
            ->get([
                'id', 'name', 'description', 'model_number', 'manufacturer',
                'serial_number', 'door_number', 'daily_rate', 'weekly_rate',
                'monthly_rate', 'category_id'
            ])
            ->map(function ($item) {
                $name = $item->name;
                if (is_array($name)) {
                    $name = $name['en'] ?? reset($name) ?? '';
                }
                return array_merge($item->toArray(), ['name' => $name]);
            });

        // Get operators (employees who can operate equipment)
        $employees = \Modules\EmployeeManagement\Domain\Models\Employee::where('is_operator', true)
            ->where('status', 'active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'employee_id'])
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->full_name,
                    'employee_id' => $employee->employee_id
                ];
            });

        // Generate next rental number using the model's method
        $nextRentalNumber = \Modules\RentalManagement\Domain\Models\Rental::generateRentalNumber();

        return Inertia::render('Rentals/Create', [
            'customers' => $customers,
            'equipment' => $equipment,
            'nextRentalNumber' => $nextRentalNumber,
            'employees' => $employees
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'rental_number' => 'required|string|unique:rentals,rental_number',
            'start_date' => 'required|date',
            'expected_end_date' => 'required|date|after:start_date',
            'status' => 'required|in:pending,active,completed,cancelled',
            'total_amount' => 'required|numeric|min:0',
            'deposit_amount' => 'nullable|numeric|min:0',
            'billing_cycle' => 'required|string|in:daily,weekly,monthly',
            'payment_terms_days' => 'nullable|integer',
            'has_timesheet' => 'nullable|boolean',
            'has_operators' => 'nullable|boolean',
            'tax_percentage' => 'nullable|numeric',
            'discount_percentage' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'created_by' => 'nullable|integer',
            'subtotal' => 'nullable|numeric',
            'tax_amount' => 'nullable|numeric',
            'rental_rate' => 'nullable|numeric',
            'discount_amount' => 'nullable|numeric',
            'rental_items' => 'required|array|min:1',
            'rental_items.*.equipment_id' => 'required|integer|exists:equipment,id',
            'rental_items.*.rate' => 'required|numeric',
            'rental_items.*.rate_type' => 'required|string',
            'rental_items.*.operator_id' => 'nullable|integer|exists:employees,id',
            'rental_items.*.notes' => 'nullable|string',
            'rental_items.*.days' => 'required|integer|min:1',
            'rental_items.*.discount_percentage' => 'nullable|numeric',
            'rental_items.*.total_amount' => 'required|numeric',
        ]);

        // Extract rental items and remove from main data
        $rentalItems = $validated['rental_items'];
        unset($validated['rental_items']);

        // Handle file upload if present
        if ($request->hasFile('document')) {
            $file = $request->file('document');
            $path = $file->store('rental_documents', 'public');
            $validated['document_path'] = $path;
        }

        // Create the rental
        $rental = $this->rentalService->create($validated);

        // Create rental items
        foreach ($rentalItems as $item) {
            $item['rental_id'] = $rental->id;
            \Modules\RentalManagement\Domain\Models\RentalItem::create($item);
        }

        return redirect()->route('rentals.index')
            ->with('success', 'Rental created successfully.');
    }

    /**
     * Show the specified resource.
     */
    public function show($id)
    {
        $rental = $this->rentalService->findById((int)$id);

        if (!$rental) {
            return redirect()->route('rentals.index')->with('error', 'Rental not found.');
        }

        // Eager load all relationships and fields
        $rental->load([
            'customer',
            'rentalItems.equipment',
            'invoices',
            'timesheets',
            'payments',
            'maintenanceRecords',
            'location',
        ]);

        // Dropdowns for related entities
        $customers = \Modules\CustomerManagement\Domain\Models\Customer::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'company_name', 'contact_person', 'email', 'phone'])
            ->map(function ($customer) {
                $name = $customer->name;
                if (is_array($name)) {
                    $name = $name['en'] ?? reset($name) ?? '';
                }
                return [
                    'id' => $customer->id,
                    'name' => $name,
                    'company_name' => $customer->company_name,
                    'contact_person' => $customer->contact_person,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                ];
            });
        $equipment = \Modules\EquipmentManagement\Domain\Models\Equipment::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'model', 'manufacturer', 'serial_number', 'status'])
            ->map(function ($item) {
                $name = $item->name;
                if (is_array($name)) {
                    $name = $name['en'] ?? reset($name) ?? '';
                }
                return array_merge($item->toArray(), ['name' => $name]);
            });
        $employees = \Modules\EmployeeManagement\Domain\Models\Employee::where('is_operator', true)
            ->where('status', 'active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'employee_id']);

        // Translations (if using Spatie Translatable)
        $translations = method_exists($rental, 'getTranslations') ? $rental->getTranslations('notes') : [];

        // Permissions (dummy for now, replace with real permission logic)
        $permissions = [
            'view' => true,
            'update' => true,
            'delete' => true,
            'approve' => true,
            'complete' => true,
            'generate_invoice' => true,
            'view_timesheets' => true,
            'request_extension' => true,
        ];

        // Next possible states (dummy, replace with workflow logic if available)
        $nextPossibleStates = method_exists($rental, 'getNextPossibleStates') ? $rental->getNextPossibleStates() : [];

        // Metrics (dummy, replace with real calculation if available)
        $metrics = [
            'rentalEfficiency' => 85,
            'profitMargin' => 40,
            'equipmentUtilization' => 75,
        ];

        // Fix rentalItems equipment name to always be a string and convert to array, re-indexed
        $rentalItems = $rental->rentalItems->map(function ($item) {
            if ($item->equipment) {
                $name = $item->equipment->name;
                if (is_array($name)) {
                    $name = $name['en'] ?? reset($name) ?? '';
                }
                $item->equipment->name = $name;
            } else {
                $item->equipment = [
                    'name' => ''
                ];
            }
            return $item->toArray();
        })->values();

        return Inertia::render('Rentals/Show', [
            'rental' => $rental,
            'rentalItems' => [
                'data' => $rentalItems,
                'total' => $rental->rentalItems->count(),
            ],
            'invoices' => [
                'data' => $rental->invoices,
                'total' => $rental->invoices->count(),
            ],
            'maintenanceRecords' => [
                'data' => $rental->maintenanceRecords,
                'total' => $rental->maintenanceRecords->count(),
            ],
            'timesheets' => $rental->timesheets,
            'payments' => $rental->payments,
            'equipment' => $rental->equipment,
            'location' => $rental->location,
            'translations' => $translations,
            'created_at' => $rental->created_at,
            'updated_at' => $rental->updated_at,
            'deleted_at' => $rental->deleted_at,
            'dropdowns' => [
                'customers' => $customers,
                'equipment' => $equipment,
                'employees' => $employees,
            ],
            'permissions' => $permissions,
            'nextPossibleStates' => $nextPossibleStates,
            'metrics' => $metrics,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $rental = $this->rentalService->findById($id);
        if (!$rental) {
            return redirect()->route('rentals.index')->with('error', 'Rental not found.');
        }
        $rental->load([
            'customer',
            'rentalItems.equipment',
            'invoices',
            'timesheets',
            'payments',
            'maintenanceRecords',
            'location',
        ]);
        $customers = \Modules\CustomerManagement\Domain\Models\Customer::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'company_name', 'contact_person', 'email', 'phone'])
            ->map(function ($customer) {
                $name = $customer->name;
                if (is_array($name)) {
                    $name = $name['en'] ?? reset($name) ?? '';
                }
                return [
                    'id' => $customer->id,
                    'name' => $name,
                    'company_name' => $customer->company_name,
                    'contact_person' => $customer->contact_person,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                ];
            });
        $equipment = \Modules\EquipmentManagement\Domain\Models\Equipment::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'model', 'manufacturer', 'serial_number', 'status'])
            ->map(function ($item) {
                $name = $item->name;
                if (is_array($name)) {
                    $name = $name['en'] ?? reset($name) ?? '';
                }
                return array_merge($item->toArray(), ['name' => $name]);
            });
        $employees = \Modules\EmployeeManagement\Domain\Models\Employee::where('is_operator', true)
            ->where('status', 'active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'employee_id']);
        $translations = method_exists($rental, 'getTranslations') ? $rental->getTranslations('notes') : [];
        return Inertia::render('Rentals/Edit', [
            'rental' => $rental,
            'customer' => $rental->customer,
            'rentalItems' => $rental->rentalItems,
            'equipment' => $rental->equipment,
            'invoices' => $rental->invoices,
            'timesheets' => $rental->timesheets,
            'payments' => $rental->payments,
            'maintenanceRecords' => $rental->maintenanceRecords,
            'location' => $rental->location,
            'translations' => $translations,
            'created_at' => $rental->created_at,
            'updated_at' => $rental->updated_at,
            'deleted_at' => $rental->deleted_at,
            'dropdowns' => [
                'customers' => $customers,
                'equipment' => $equipment,
                'employees' => $employees,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:pending,active,completed,cancelled',
            'total_amount' => 'required|numeric|min:0',
        ]);

        $this->rentalService->update($id, $validated);

        return redirect()->route('rentals.index')
            ->with('success', 'Rental updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->rentalService->delete($id);
        return redirect()->route('rentals.index')
            ->with('success', 'Rental deleted successfully.');
    }
}


