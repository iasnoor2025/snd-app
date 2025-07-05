<?php

namespace Modules\RentalManagement\Http\Controllers;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Domain\Models\RentalItem;
use Modules\RentalManagement\Domain\Models\RentalTimesheet;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Illuminate\Support\Facades\DB;

class RentalTimesheetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = RentalTimesheet::with(['rental', 'rentalItem.equipment', 'operator', 'creator']);

        // Apply filters
        if ($request->has('rental_id') && !empty($request->input('rental_id'))) {
            $query->where('rental_id', $request->input('rental_id'));
        }

        if ($request->has('operator_id') && !empty($request->input('operator_id'))) {
            $query->where('operator_id', $request->input('operator_id'));
        }

        if ($request->has('status') && !empty($request->input('status'))) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('start_date') && !empty($request->input('start_date'))) {
            $query->whereDate('date', '>=', $request->input('start_date'));
        }

        if ($request->has('end_date') && !empty($request->input('end_date'))) {
            $query->whereDate('date', '<=', $request->input('end_date'));
        }

        $timesheets = $query->latest()->paginate(10)
            ->withQueryString();

        return Inertia::render('RentalTimesheets/Index', [
            'timesheets' => $timesheets,
            'filters' => $request->only(['rental_id', 'operator_id', 'status', 'start_date', 'end_date'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        \Log::info('RentalTimesheet create method called', [
            'request' => $request->all()
        ]);

        try {
            $rentalId = $request->input('rental_id');

            // Get active rentals if no rental ID is specified
            $rentals = Rental::where(function($query) use ($rentalId) {
                $query->where('status', 'active');
                if ($rentalId) {
                    $query->orWhere('id', $rentalId);
                }
            })
            ->with('client')
            ->get();

            // Get rental items related to the specified rental with eager loading of equipment
            $rentalItems = [];
            if ($rentalId) {
                $rentalItems = RentalItem::where('rental_id', $rentalId)
                    ->with(['equipment' => function($query) {
                        $query->select('id', 'name', 'serial_number', 'status', 'daily_rate', 'weekly_rate', 'monthly_rate')
                              ->where('status', 'active'); // Only get active equipment
                    }])
                    ->whereHas('equipment', function($query) {
                        $query->whereNotNull('id')
                              ->whereNotNull('name')
                              ->where('status', 'active'); // Only get items with active equipment
                    })
                    ->get();

                // Log rental items and their equipment data
                \Log::info('Rental items found:', [
                    'count' => count($rentalItems),
                    'rental_id' => $rentalId,
                    'items' => $rentalItems->map(function($item) {
                        return [
                            'id' => $item->id,
                            'equipment_id' => $item->equipment_id,
                            'equipment' => $item->equipment ? [
                                'id' => $item->equipment->id,
                                'name' => $item->equipment->name,
                                'serial_number' => $item->equipment->serial_number,
                                'status' => $item->equipment->status
                            ] : null
                        ];
                    })
                ]);

                // Filter out any rental items that don't have valid equipment
                $rentalItems = $rentalItems->filter(function($item) {
                    return $item->equipment &&
                           $item->equipment->id &&
                           $item->equipment->status === 'active';
                })->values(); // Reset array keys

                // Check if rental items exist for this rental
                if ($rentalItems->isEmpty()) {
                    \Log::warning('No valid rental items with active equipment found for rental ID: ' . $rentalId);
                }
            }

            // Get operators (employees)
            $operators = Employee::where('status', 'active')
                ->select('id', 'first_name', 'last_name')
                ->orderBy('first_name')
                ->orderBy('last_name')
                ->get();

            \Log::info('Rendering RentalTimesheets/Create page', [
                'rentals_count' => $rentals->count(),
                'rental_items_count' => count($rentalItems),
                'valid_rental_items_count' => $rentalItems->filter(function($item) {
                    return $item->equipment && $item->equipment->id;
                })->count(),
                'operators_count' => $operators->count(),
                'selected_rental_id' => $rentalId
            ]);

            return Inertia::render('RentalTimesheets/Create', [
                'rentals' => $rentals,
                'rentalItems' => $rentalItems,
                'operators' => $operators,
                'selectedRentalId' => $rentalId ? (int)$rentalId : null,
                'csrf_token' => csrf_token(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in RentalTimesheet create:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'rental_id' => $request->input('rental_id'),
                'request_data' => $request->all()
            ]);

            return redirect()->back()
                ->with('error', 'An error occurred while loading the timesheet form: ' . $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Log incoming request
            Log::info('Creating new timesheet', [
                'request_data' => $request->all(),
                'user_id' => auth()->id(),
                'ip_address' => $request->ip()
            ]);

            // Validate the basic required fields
            $validated = $request->validate([
                'rental_id' => 'required|exists:rentals,id',
                'rental_item_id' => 'required|exists:rental_items,id',
                'date' => 'required|date',
                'start_time' => 'required|string',
                'end_time' => 'required|string',
                'hours_used' => 'required|numeric|min:0.5|max:24',
                'notes' => 'nullable|string|max:1000',
                'operator_id' => 'nullable|exists:employees,id',
                'operator_absent' => 'nullable|boolean',
            ]);

            // Validate rental is active
            // Ensure ID is numeric
        if (!is_numeric($validated['rental_id'])) {
            abort(404, 'Invalid ID provided');
        }
        $rental = Rental::find($validated['rental_id']);
            if (!$rental || $rental->status !== 'active') {
                Log::error('Invalid rental status for timesheet creation', [
                    'rental_id' => $validated['rental_id'],
                    'status' => $rental ? $rental->status : 'not found',
                    'user_id' => auth()->id()
                ]);
                return back()->withErrors(['rental_id' => 'Timesheets can only be created for active rentals.']);
            }

            // Validate rental item belongs to rental and has valid equipment
            $rentalItem = RentalItem::with('equipment')
                ->where('id', $validated['rental_item_id'])
                ->where('rental_id', $validated['rental_id'])
                ->first();

            if (!$rentalItem) {
                Log::error('Rental item validation failed', [
                    'rental_id' => $validated['rental_id'],
                    'rental_item_id' => $validated['rental_item_id'],
                    'user_id' => auth()->id()
                ]);
                return back()->withErrors(['rental_item_id' => 'The selected equipment does not belong to this rental.']);
            }

            if (!$rentalItem->equipment || !$rentalItem->equipment_id) {
                Log::error('Rental item missing equipment data', [
                    'rental_item_id' => $rentalItem->id,
                    'equipment_id' => $rentalItem->equipment_id,
                    'equipment' => $rentalItem->equipment,
                    'user_id' => auth()->id()
                ]);
                return back()->withErrors(['rental_item_id' => 'The selected equipment is not properly configured. Please check the rental configuration.']);
            }

            // Validate operator is active if provided
            if ($validated['operator_id']) {
                // Ensure ID is numeric
        if (!is_numeric($validated['operator_id'])) {
            abort(404, 'Invalid ID provided');
        }
        $operator = Employee::find($validated['operator_id']);
                if (!$operator || $operator->status !== 'active') {
                    Log::error('Invalid operator status for timesheet creation', [
                        'operator_id' => $validated['operator_id'],
                        'status' => $operator ? $operator->status : 'not found',
                        'user_id' => auth()->id()
                    ]);
                    return back()->withErrors(['operator_id' => 'The selected operator is not active.']);
                }
            }

            // Check for duplicate timesheet entries
            $existingTimesheet = RentalTimesheet::where('rental_id', $validated['rental_id'])
                ->where('rental_item_id', $rentalItem->id)
                ->where('date', $validated['date'])
                ->exists();

            if ($existingTimesheet) {
                Log::warning('Duplicate timesheet entry attempted', [
                    'rental_id' => $validated['rental_id'],
                    'rental_item_id' => $rentalItem->id,
                    'date' => $validated['date'],
                    'user_id' => auth()->id()
                ]);
                return back()->withErrors(['rental_item_id' => 'A timesheet entry already exists for this equipment on the selected date.']);
            }

            // Format times and calculate hours
            $date = $validated['date'];
            $startTime = $validated['start_time'];
            $endTime = $validated['end_time'];

            try {
                // Create formatted datetime for calculation
                $startDateTime = Carbon::parse($date . ' ' . $startTime);
                $endDateTime = Carbon::parse($date . ' ' . $endTime);

                // Add a day to end time if it's earlier than start time (overnight shift)
                if ($endDateTime < $startDateTime) {
                    $endDateTime->addDay();
                }

                $hoursUsed = $startDateTime->diffInMinutes($endDateTime) / 60;

                // Validate calculated hours
                if ($hoursUsed <= 0 || $hoursUsed > 24) {
                    Log::error('Invalid hours calculation', [
                        'start_time' => $startTime,
                        'end_time' => $endTime,
                        'calculated_hours' => $hoursUsed,
                        'user_id' => auth()->id()
                    ]);
                    return back()->withErrors(['hours_used' => 'Invalid time range. Hours must be between 0 and 24.']);
                }

                // Validate rate matches equipment rate
                $rate = $rentalItem->rate;
                if ($rentalItem->equipment) {
                    $rateType = $rentalItem->rate_type;
                    $rateField = $rateType . '_rate';
                    $equipmentRate = $rentalItem->equipment->$rateField;
                    if ($equipmentRate && $equipmentRate != $rate) {
                        Log::warning('Rate mismatch detected', [
                            'rental_item_rate' => $rate,
                            'equipment_rate' => $equipmentRate,
                            'rate_type' => $rateType,
                            'user_id' => auth()->id()
                        ]);
                    }
                }

                Log::info('Time calculation successful', [
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'hours_used' => $hoursUsed,
                    'user_id' => auth()->id()
                ]);

                // Create the timesheet
                $timesheet = RentalTimesheet::create([
                    'rental_id' => $validated['rental_id'],
                    'rental_item_id' => $rentalItem->id,
                    'equipment_id' => $rentalItem->equipment_id,
                    'operator_id' => $validated['operator_id'],
                    'date' => $date,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'hours_used' => $hoursUsed,
                    'notes' => $validated['notes'],
                    'status' => 'active',
                    'created_by' => auth()->id(),
                    'rate' => $rate,
                    'total_amount' => $rate * $hoursUsed,
                    'operator_absent' => $validated['operator_absent'] ?? false
                ]);

                Log::info('Timesheet created successfully', [
                    'timesheet_id' => $timesheet->id,
                    'rental_id' => $timesheet->rental_id,
                    'rental_item_id' => $timesheet->rental_item_id,
                    'user_id' => auth()->id()
                ]);

                return redirect()->route('rental-timesheets.show', $timesheet)
                    ->with('success', 'Timesheet created successfully.');

            } catch (\Exception $e) {
                Log::error('Error calculating timesheet hours', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'date' => $date,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'user_id' => auth()->id()
                ]);

                return back()->withErrors(['hours_used' => 'Error calculating hours. Please check the time values.']);
            }

        } catch (\Exception $e) {
            Log::error('Error creating timesheet', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'user_id' => auth()->id()
            ]);

            return back()->with('error', 'An error occurred while creating the timesheet: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(RentalTimesheet $rentalTimesheet)
    {
        try {
            // Load all relationships with detailed equipment data
            $rentalTimesheet->load([
                'rental.client',
                'rentalItem.equipment',
                'operator',
                'creator',
                'approver',
                'equipment' // Load direct equipment relationship
            ]);

            // Calculate rate and total amount
            $calculations = $this->calculateRateAndTotal($rentalTimesheet);
            $rentalTimesheet->rate = $calculations['rate'];
            $rentalTimesheet->total_amount = $calculations['total_amount'];

            // Log timesheet data for debugging
            Log::info('Viewing timesheet details', [
                'timesheet_id' => $rentalTimesheet->id,
                'has_rental_item' => $rentalTimesheet->rentalItem ? true : false,
                'rental_item_id' => $rentalTimesheet->rental_item_id,
                'has_equipment' => $rentalTimesheet->rentalItem && $rentalTimesheet->rentalItem->equipment ? true : false,
                'equipment_id' => $rentalTimesheet->rentalItem ? $rentalTimesheet->rentalItem->equipment_id : null,
                'equipment_name' => $rentalTimesheet->rentalItem && $rentalTimesheet->rentalItem->equipment
                    ? $rentalTimesheet->rentalItem->equipment->name
                    : 'Unknown',
                'rate' => $calculations['rate'],
                'total_amount' => $calculations['total_amount'],
                'hours_used' => $rentalTimesheet->hours_used
            ]);

            // If rental item is not properly loaded, try to load it directly
            if (!$rentalTimesheet->rentalItem && $rentalTimesheet->rental_item_id) {
                $directRentalItem = RentalItem::with('equipment')->find($rentalTimesheet->rental_item_id);

                if ($directRentalItem) {
                    Log::info('Found rental item directly for show page', [
                        'rental_item_id' => $directRentalItem->id,
                        'has_equipment' => $directRentalItem->equipment ? true : false,
                        'equipment_id' => $directRentalItem->equipment_id,
                        'equipment_name' => $directRentalItem->equipment ? $directRentalItem->equipment->name : 'N/A',
                        'rate_type' => $directRentalItem->rate_type,
                        'rate' => $directRentalItem->rate
                    ]);

                    // Manually attach the rental item to fix the relationship
                    $rentalTimesheet->setRelation('rentalItem', $directRentalItem);

                    // Recalculate rate and total amount with the loaded rental item
                    $calculations = $this->calculateRateAndTotal($rentalTimesheet);
                    $rentalTimesheet->rate = $calculations['rate'];
                    $rentalTimesheet->total_amount = $calculations['total_amount'];
                }
            }

            return Inertia::render('RentalTimesheets/Show', [
                'timesheet' => $rentalTimesheet,
                'rental' => $rentalTimesheet->rental,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in RentalTimesheet show:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'timesheet_id' => $rentalTimesheet->id
            ]);

            return redirect()->route('rental-timesheets.index')
                ->with('error', 'An error occurred while viewing the timesheet: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(RentalTimesheet $rentalTimesheet)
    {
        try {
            $this->authorize('update', $rentalTimesheet);

            // Load the timesheet relationships
            $rentalTimesheet->load([
                'rental.client',
                'rentalItem.equipment',
                'operator',
                'creator',
                'approver',
                'equipment'
            ]);

            // Get all rental items for the rental, regardless of status
            $rentalItems = RentalItem::where('rental_id', $rentalTimesheet->rental_id)
                ->with(['equipment' => function($query) {
                    // Include all equipment, but prefer active ones
                    $query->select('id', 'name', 'serial_number', 'status', 'daily_rate', 'weekly_rate', 'monthly_rate');
                }])
                ->get();

            // Log the rental items found
            Log::info('Rental items for timesheet edit', [
                'timesheet_id' => $rentalTimesheet->id,
                'rental_id' => $rentalTimesheet->rental_id,
                'rental_items_count' => $rentalItems->count(),
                'rental_items' => $rentalItems->map(function($item) {
                    return [
                        'id' => $item->id,
                        'equipment_id' => $item->equipment_id,
                        'has_equipment' => $item->equipment ? true : false,
                        'equipment_name' => $item->equipment ? $item->equipment->name : null,
                        'equipment_status' => $item->equipment ? $item->equipment->status : null
                    ];
                })
            ]);

            // Get active operators
            $operators = Employee::where('status', 'active')
                ->select('id', 'first_name', 'last_name')
                ->orderBy('first_name')
                ->orderBy('last_name')
                ->get();

            // Calculate rate and total amount
            $calculations = $this->calculateRateAndTotal($rentalTimesheet);
            $rentalTimesheet->rate = $calculations['rate'];
            $rentalTimesheet->total_amount = $calculations['total_amount'];

            // Log the edit page access
            Log::info('Accessing timesheet edit page', [
                'timesheet_id' => $rentalTimesheet->id,
                'rental_id' => $rentalTimesheet->rental_id,
                'rental_item_id' => $rentalTimesheet->rental_item_id,
                'rental_items_count' => $rentalItems->count(),
                'operators_count' => $operators->count(),
                'rate' => $calculations['rate'],
                'total_amount' => $calculations['total_amount']
            ]);

            return Inertia::render('RentalTimesheets/Edit', [
                'timesheet' => $rentalTimesheet,
                'rental' => $rentalTimesheet->rental,
                'rentalItems' => $rentalItems,
                'operators' => $operators,
            ]);

        } catch (\Exception $e) {
            Log::error('Error in timesheet edit:', [
                'timesheet_id' => $rentalTimesheet->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('rental-timesheets.index')
                ->with('error', 'An error occurred while loading the timesheet edit form: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RentalTimesheet $rentalTimesheet)
    {
        $this->authorize('update', $rentalTimesheet);

        if ($rentalTimesheet->status === 'completed') {
            return back()->with('error', 'Cannot update a completed timesheet.');
        }

        try {
            // Log incoming update request
            Log::info('Updating timesheet', [
                'timesheet_id' => $rentalTimesheet->id,
                'request_data' => $request->all()
            ]);

            $validated = $request->validate([
                'rental_id' => 'required|exists:rentals,id',
                'rental_item_id' => 'required|exists:rental_items,id',
                'date' => 'required|date',
                'start_time' => 'required|string',
                'end_time' => 'required|string',
                'hours_used' => 'required|numeric|min:0',
                'notes' => 'nullable|string|max:1000',
                'operator_id' => 'nullable'
            ]);

            // Get the rental item with equipment
            $rentalItem = RentalItem::with('equipment')
                ->where('id', $validated['rental_item_id'])
                ->where('rental_id', $validated['rental_id'])
                ->first();

            if (!$rentalItem) {
                Log::error('Rental item validation failed in update', [
                    'rental_id' => $validated['rental_id'],
                    'rental_item_id' => $validated['rental_item_id']
                ]);
                return back()->withErrors(['rental_item_id' => 'The selected equipment does not belong to this rental.']);
            }

            // Format times for proper storage
            $date = $validated['date'];
            $startTime = $validated['start_time'];
            $endTime = $validated['end_time'];

            try {
                // Create formatted datetime objects for calculation
                $startDateTime = Carbon::parse($date . ' ' . $startTime);
                $endDateTime = Carbon::parse($date . ' ' . $endTime);

                // Add a day to end time if it's earlier than start time (overnight shift)
                if ($endDateTime < $startDateTime) {
                    $endDateTime->addDay();
                }

                $hoursUsed = $validated['hours_used'];

                Log::info('Time calculation for update', [
                    'date' => $date,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'start_datetime' => $startDateTime->format('Y-m-d H:i:s'),
                    'end_datetime' => $endDateTime->format('Y-m-d H:i:s'),
                    'hours_used' => $hoursUsed
                ]);
            } catch (\Exception $e) {
                Log::error('Error processing times for update', [
                    'error' => $e->getMessage(),
                    'start_time' => $startTime,
                    'end_time' => $endTime
                ]);
                return back()->withErrors(['start_time' => 'Invalid time format provided.']);
            }

            // Update timesheet with validated data
            $rentalTimesheet->fill([
                'rental_id' => $validated['rental_id'],
                'rental_item_id' => $validated['rental_item_id'],
                'equipment_id' => $rentalItem->equipment_id,
                'date' => $date,
                'start_time' => $startDateTime,
                'end_time' => $endDateTime,
                'hours_used' => $hoursUsed,
                'notes' => $validated['notes'] ?? null,
                'operator_id' => $validated['operator_id'] ?: null
            ]);

            // Calculate and set rate and total amount
            $calculations = $this->calculateRateAndTotal($rentalTimesheet);
            $rentalTimesheet->rate = $calculations['rate'];
            $rentalTimesheet->total_amount = $calculations['total_amount'];

            $rentalTimesheet->save();

            // Update rental total amount
            $this->updateRentalTotal($rentalTimesheet->rental);

            Log::info('Timesheet updated successfully', [
                'timesheet_id' => $rentalTimesheet->id,
                'rate' => $calculations['rate'],
                'total_amount' => $calculations['total_amount']
            ]);

            return redirect()->route('rental-timesheets.show', $rentalTimesheet)
                ->with('success', 'Timesheet updated successfully.');
        } catch (\Exception $e) {
            Log::error('Error updating timesheet:', [
                'timesheet_id' => $rentalTimesheet->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors(['general' => 'An error occurred while updating the timesheet: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RentalTimesheet $rentalTimesheet)
    {
        try {
            // Get the rental ID before deletion
            // First try to get it from the rentalItem relationship
            if ($rentalTimesheet->rental_item && $rentalTimesheet->rental_item->rental_id) {
                $rentalId = $rentalTimesheet->rental_item->rental_id;
            }
            // Fallback to the direct rental_id property on the timesheet
            else {
                $rentalId = $rentalTimesheet->rental_id;
            }

            // Make sure we have a valid rental ID
            if (!$rentalId) {
                return back()->with('error', 'Could not determine the parent rental for this timesheet.');
            }

            $rentalTimesheet->delete();

            return redirect()->route('rentals.timesheets', $rentalId)
                ->with('success', 'Timesheet deleted successfully.');
        } catch (\Exception $e) {
            \Log::error('Error deleting timesheet:', [
                'timesheet_id' => $rentalTimesheet->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'An error occurred while deleting the timesheet.');
        }
    }

    /**
     * Complete a timesheet and mark it as finished.
     */
    public function complete(Request $request, RentalTimesheet $rentalTimesheet)
    {
        // Prevent completing already completed timesheets
        if ($rentalTimesheet->status === 'completed') {
            return back()->with('error', 'Timesheet is already completed.');
        }

        // Mark timesheet as completed
        $rentalTimesheet->update([
            'status' => 'completed',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Timesheet completed successfully.');
    }

    /**
     * Display timesheets for a specific rental.
     */
    public function forRental(Rental $rental)
    {
        try {
            // Log the initial request
            \Log::info('Accessing rental timesheets page', [
                'rental_id' => $rental->id,
                'rental_number' => $rental->rental_number,
                'user_id' => auth()->id()
            ]);

            // First verify the rental exists and is accessible
            if (!$rental || !$rental->exists) {
                \Log::error('Rental not found', ['rental_id' => $rental->id]);
                return redirect()->route('rentals.index')
                    ->with('error', 'Rental not found.');
            }

            // Load timesheets with all necessary relationships
            $timesheets = RentalTimesheet::where('rental_id', $rental->id)
                ->with([
                    'rentalItem.equipment',
                    'rentalItem.operator',
                    'operator',
                    'equipment'
                ])
                ->orderByDesc('date')
                ->get();

            // Log the number of timesheets found
            \Log::info('Timesheets found', [
                'rental_id' => $rental->id,
                'count' => $timesheets->count()
            ]);

            // Enhanced error detection and data validation
            $problemTimesheets = [];
            $validTimesheets = collect();

            foreach ($timesheets as $timesheet) {
                $isValid = true;
                $problem = [];

                // Check rental item relationship
                if (!$timesheet->rentalItem) {
                    $isValid = false;
                    $problem[] = "Missing rental item";

                    // Try to recover rental item
                    if ($timesheet->rental_item_id) {
                        $rentalItem = RentalItem::with(['equipment', 'operator'])
                            ->find($timesheet->rental_item_id);

                        if ($rentalItem) {
                            $timesheet->setRelation('rentalItem', $rentalItem);
                            if ($rentalItem->equipment) {
                                $isValid = true;
                                $problem = [];
                            }
                        }
                    }
                }

                // Check equipment data
                if (!$timesheet->rentalItem?->equipment && !$timesheet->equipment) {
                    $isValid = false;
                    $problem[] = "Missing equipment data";

                    // Try to recover equipment
                    if ($timesheet->equipment_id) {
                        // Ensure ID is numeric
        if (!is_numeric($timesheet->equipment_id)) {
            abort(404, 'Invalid ID provided');
        }
        $equipment = Equipment::find($timesheet->equipment_id);
                        if ($equipment) {
                            $timesheet->setRelation('equipment', $equipment);
                            $isValid = true;
                            $problem = [];
                        }
                    }
                }

                // Log problems if any
                if (!$isValid) {
                    $problemTimesheets[] = [
                        'id' => $timesheet->id,
                        'date' => $timesheet->date?->format('Y-m-d'),
                        'rental_item_id' => $timesheet->rental_item_id,
                        'rental_item_exists' => $timesheet->rentalItem ? true : false,
                        'equipment_id' => $timesheet->equipment_id,
                        'equipment_exists' => ($timesheet->rentalItem?->equipment || $timesheet->equipment) ? true : false,
                        'problem' => implode(", ", $problem)
                    ];
                }

                $validTimesheets->push($timesheet);
            }

            // Log the results
            \Log::info('Rental timesheets processed', [
                'rental_id' => $rental->id,
                'total_timesheets' => $timesheets->count(),
                'valid_timesheets' => $validTimesheets->count(),
                'problem_timesheets' => count($problemTimesheets)
            ]);

            // Load the rental with client relationship
            $rental->load('client');

            return Inertia::render('RentalTimesheets/ForRental', [
                'rental' => $rental,
                'timesheets' => $validTimesheets,
                'debug' => [
                    'rentalId' => $rental->id,
                    'timesheetsCount' => $timesheets->count(),
                    'problemTimesheets' => $problemTimesheets
                ]
            ]);
        } catch (\Exception $e) {
            // Log the error with detailed information
            \Log::error('Error in forRental method:', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            // Redirect with error message
            return redirect()->route('rentals.index')
                ->with('error', 'An error occurred while viewing timesheets: ' . $e->getMessage());
        }
    }

    /**
     * Bulk complete multiple timesheet entries.
     */
    public function bulkComplete(Request $request)
    {
        // Validate
        $validated = $request->validate([
            'timesheet_ids' => 'required|array',
            'timesheet_ids.*' => 'exists:rental_timesheets,id',
        ]);

        // Bulk update
        RentalTimesheet::whereIn('id', $validated['timesheet_ids'])
            ->update(['status' => 'completed']);

        return redirect()->back()
            ->with('success', count($validated['timesheet_ids']) . ' timesheet entries marked as completed.');
    }

    /**
     * Bulk delete multiple timesheet entries.
     */
    public function bulkDelete(Request $request)
    {
        // Validate
        $validated = $request->validate([
            'timesheet_ids' => 'required|array',
            'timesheet_ids.*' => 'exists:rental_timesheets,id',
        ]);

        try {
            // Count before deletion for message
            $count = count($validated['timesheet_ids']);

            // Bulk delete
            RentalTimesheet::whereIn('id', $validated['timesheet_ids'])->delete();

            // Log successful bulk deletion
            \Log::info('Bulk deletion of timesheets completed', [
                'count' => $count,
                'deleted_by' => auth()->id(),
                'timesheet_ids' => $validated['timesheet_ids']
            ]);

            return redirect()->back()
                ->with('success', $count . ' timesheet entries deleted successfully.');
        } catch (\Exception $e) {
            \Log::error('Error bulk deleting timesheets:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'timesheet_ids' => $validated['timesheet_ids']
            ]);

            return redirect()->back()
                ->with('error', 'An error occurred while deleting timesheets: ' . $e->getMessage());
        }
    }

    /**
     * Check and fill missing timesheets for a rental.
     */
    public function checkMissingTimesheets(Rental $rental)
    {
        try {
            // Only proceed if the rental is active
            if ($rental->status !== 'active') {
                return back()->with('error', 'Only active rentals can have timesheet checks.');
            }

            $service = app(\App\Services\RentalTimesheetService::class);
            $missingTimesheets = $service->fillMissingTimesheets($rental);

            $count = count($missingTimesheets);

            if ($count > 0) {
                return back()->with('success', "{$count} missing timesheets were created successfully.");
            } else {
                return back()->with('info', 'No missing timesheets were found. All dates are covered.');
            }
        } catch (\Exception $e) {
            \Log::error('Error checking for missing timesheets', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'An error occurred while checking for missing timesheets: ' . $e->getMessage());
        }
    }

    /**
     * Update the status of a rental timesheet.
     *
     * @param Request $request
     * @param RentalTimesheet $rentalTimesheet
     * @return \Illuminate\Http\JsonResponse;
     */
    public function updateStatus(Request $request, RentalTimesheet $rentalTimesheet)
    {
        try {
            // Validate the request
            $validated = $request->validate([
                'status' => ['required', 'string', 'in:approved,rejected,voided']
            ]);

            DB::beginTransaction();

            // Update the timesheet status
            $rentalTimesheet->status = $validated['status'];
            $rentalTimesheet->status_updated_at = now();
            $rentalTimesheet->status_updated_by = auth()->id();
            $rentalTimesheet->save();

            // Log the status change
            Log::info('Timesheet status updated', [
                'timesheet_id' => $rentalTimesheet->id,
                'old_status' => $rentalTimesheet->getOriginal('status'),
                'new_status' => $validated['status'],
                'updated_by' => auth()->id(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Timesheet status updated successfully',
                'timesheet' => $rentalTimesheet
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating timesheet status', [
                'timesheet_id' => $rentalTimesheet->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to update timesheet status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate rate and total amount for a timesheet
     */
    private function calculateRateAndTotal(RentalTimesheet $timesheet): array
    {
        try {
            // Get the rental item with equipment
            $rentalItem = $timesheet->rentalItem;
            if (!$rentalItem) {
                Log::error('Rental item not found for timesheet', [
                    'timesheet_id' => $timesheet->id,
                    'rental_item_id' => $timesheet->rental_item_id
                ]);
                return ['rate' => 0, 'total_amount' => 0];
            }

            // Get the equipment
            $equipment = $rentalItem->equipment;
            if (!$equipment) {
                Log::error('Equipment not found for rental item', [
                    'rental_item_id' => $rentalItem->id,
                    'equipment_id' => $rentalItem->equipment_id
                ]);
                return ['rate' => 0, 'total_amount' => 0];
            }

            // Get the rate based on rate type
            $rateType = $rentalItem->rate_type;
            $rateField = $rateType . '_rate';

            if (!isset($equipment->$rateField)) {
                Log::error('Rate field not found for equipment', [
                    'equipment_id' => $equipment->id,
                    'rate_type' => $rateType,
                    'rate_field' => $rateField
                ]);
                return ['rate' => 0, 'total_amount' => 0];
            }

            $rate = $equipment->$rateField;
            $totalAmount = $rate * $timesheet->hours_used;

            Log::info('Rate and total amount calculated', [
                'timesheet_id' => $timesheet->id,
                'rate_type' => $rateType,
                'rate' => $rate,
                'hours_used' => $timesheet->hours_used,
                'total_amount' => $totalAmount
            ]);

            return [
                'rate' => $rate,
                'total_amount' => $totalAmount
            ];
        } catch (\Exception $e) {
            Log::error('Error calculating rate and total amount', [
                'timesheet_id' => $timesheet->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return ['rate' => 0, 'total_amount' => 0];
        }
    }

    /**
     * Update rental total amount
     */
    private function updateRentalTotal(Rental $rental): void
    {
        try {
            // Get all timesheets for the rental
            $timesheets = $rental->timesheets()->get();

            // Calculate total amount from all timesheets
            $totalAmount = $timesheets->sum('total_amount');

            // Update rental total amount
            $rental->total_amount = $totalAmount;
            $rental->save();

            Log::info('Rental total amount updated', [
                'rental_id' => $rental->id,
                'total_amount' => $totalAmount,
                'timesheets_count' => $timesheets->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating rental total amount', [
                'rental_id' => $rental->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Mark operator as absent for a timesheet.
     */
    public function markAbsent(Request $request, RentalTimesheet $rentalTimesheet)
    {
        try {
            // Log the action
            Log::info('Marking operator as absent for timesheet', [
                'timesheet_id' => $rentalTimesheet->id,
                'rental_id' => $rentalTimesheet->rental_id,
                'operator_id' => $rentalTimesheet->operator_id,
                'user_id' => Auth::id()
            ]);

            // Check if timesheet is already completed
            if ($rentalTimesheet->status === 'completed') {
                return back()->with('error', 'Cannot mark operator as absent for a completed timesheet.');
            }

            // Mark the operator as absent
            $rentalTimesheet->operator_absent = true;
            $rentalTimesheet->hours_used = 0; // Set hours to 0 since the operator was absent
            $rentalTimesheet->save();

            return back()->with('success', 'Operator marked as absent for this timesheet.');
        } catch (\Exception $e) {
            Log::error('Error marking operator as absent:', [
                'timesheet_id' => $rentalTimesheet->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'An error occurred while marking the operator as absent.');
        }
    }
}


