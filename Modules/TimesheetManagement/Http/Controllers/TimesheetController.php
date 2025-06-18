<?php

namespace Modules\TimesheetManagement\Http\Controllers;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;
use Modules\TimesheetManagement\Domain\Models\Timesheet;
use Modules\TimesheetManagement\Services\GeofencingService;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\RentalManagement\Domain\Models\Rental;

class TimesheetController extends Controller
{
    public function __construct(
        private GeofencingService $geofencingService
    ) {
        // Constructor logic if needed
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Timesheet::with(['employee:id,first_name,last_name', 'project'])
            ->when($request->month, function ($query, $month) {
                return $query->whereMonth('date', Carbon::parse($month)->month)
                    ->whereYear('date', Carbon::parse($month)->year);
            })
            ->when($request->employee_id, function ($query, $employeeId) {
                return $query->where('employee_id', $employeeId);
            });

        // If user is not admin/hr, only show their own timesheets
        if (!auth()->user()->hasRole(['admin', 'hr'])) {
            $query->where('employee_id', auth()->user()->employee->id);
        }

        $timesheets = $query->latest()->paginate(10);

        return Inertia::render('Timesheets/Index', [

            'timesheets' => $timesheets,
            'filters' => $request->only(['month', 'employee_id'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $this->authorize('create', Timesheet::class);

        // Get employees with user relation
        $employees = Employee::with('user')
            ->orderBy('first_name')
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'first_name' => $employee->first_name,
                    'last_name' => $employee->last_name,
                    'email' => $employee->user ? $employee->user->email : null,
                ];
            });

        // Get projects
        $projects = Project::select('id', 'name')->get();

        // Check if rental data should be included
        $includeRentals = $request->has('include_rentals') || $request->has('rental_id');
        $selectedRentalId = $request->input('rental_id');
        $rentals = [];

        if ($includeRentals) {
            $rentals = Rental::with('rentalItems.equipment')
                ->when($selectedRentalId, function ($query) use ($selectedRentalId) {
                    // Ensure ID is numeric
                    if (!is_numeric($selectedRentalId)) {
                        abort(404);
                    }

                    return $query->where('id', $selectedRentalId);
                })
                ->get()
                ->map(function ($rental) {
                    $equipmentName = null;
                    if ($rental->rentalItems->isNotEmpty() && $rental->rentalItems->first()->equipment) {
                        $equipmentName = $rental->rentalItems->first()->equipment->name;
                    }
                    return [
                        'id' => $rental->id,
                        'equipment' => [
                            'name' => $equipmentName
                        ],
                        'rental_number' => $rental->rental_number,
                    ];
                });
        }

        return Inertia::render('Timesheets/Create', [
            'employees' => $employees,
            'projects' => $projects,
            'rentals' => $rentals,
            'include_rentals' => $includeRentals,
            'rental_id' => $selectedRentalId,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Log incoming request data
            Log::info('Timesheet creation request received', [
                'request_data' => $request->all(),
                'user_id' => auth()->id()
            ]);

            $validated = $request->validate([
                'employee_id' => 'required|exists:employees,id',
                'date' => [
                    'required',
                    'date',
                    function ($attribute, $value, $fail) use ($request) {
                        // Check for overlapping timesheets
                        if (Timesheet::hasOverlap($request->employee_id, $value)) {
                            $fail('A timesheet already exists for this employee on this date.');
                        }
                    },
                ],
                'hours_worked' => [
                    'required',
                    'numeric',
                    'min:0',
                    'max:24',
                    function ($attribute, $value, $fail) use ($request) {
                        // Check weekly hours limit
                        if (Timesheet::hasExceededWeeklyLimit($request->employee_id, $request->date, $value)) {
                            $fail('This would exceed the weekly hours limit (60 hours).');
                        }
                    },
                ],
                'overtime_hours' => [
                    'nullable',
                    'numeric',
                    'min:0',
                    'max:24',
                    function ($attribute, $value, $fail) use ($request) {
                        // Check monthly overtime limit
                        if (Timesheet::hasExceededMonthlyOvertimeLimit($request->employee_id, $request->date, $value)) {
                            $fail('This would exceed the monthly overtime limit (40 hours).');
                        }
                    },
                ],
                'project_id' => 'nullable|exists:projects,id',
                'rental_id' => 'nullable|exists:rentals,id',
                'description' => 'nullable|string|max:1000',
                'tasks_completed' => 'nullable|string|max:1000',
                'start_time' => 'nullable|date_format:H:i',
                'end_time' => 'nullable|date_format:H:i',
            ]);

            // Map tasks_completed to tasks field for the model
            if (isset($validated['tasks_completed'])) {
                $validated['tasks'] = $validated['tasks_completed'];
                unset($validated['tasks_completed']);
            }

            // Set default values
            $validated['status'] = Timesheet::STATUS_DRAFT;
            $validated['start_time'] = $validated['start_time'] ?? '08:00';
            $validated['end_time'] = $validated['end_time'] ?? null;

            // Begin transaction
            DB::beginTransaction();

            try {
                $timesheet = Timesheet::create($validated);

                // Process geofencing if location data is provided
                if ($timesheet->start_latitude && $timesheet->start_longitude) {
                    $geofenceResult = $this->geofencingService->processTimesheetLocation($timesheet);

                    Log::info('Timesheet geofencing processed', [
                        'timesheet_id' => $timesheet->id,
                        'geofence_status' => $geofenceResult['status'],
                        'employee_id' => $timesheet->employee_id
                    ]);
                }

                // Log successful creation
                Log::info('Timesheet created successfully', [
                    'timesheet_id' => $timesheet->id,
                    'employee_id' => $timesheet->employee_id,
                    'date' => $timesheet->date,
                    'status' => $timesheet->status
                ]);

                DB::commit();

                // Check if request is from Inertia
                if ($request->header('X-Inertia')) {
                    return redirect()->route('timesheets.index')
                        ->with('success', 'Timesheet created successfully.');
                }

                // Check if request expects JSON response (AJAX)
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Timesheet created successfully.',
                        'timesheet' => $timesheet
                    ]);
                }

                return redirect()->route('timesheets.show', $timesheet)
                    ->with('success', 'Timesheet created successfully.');
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error creating timesheet', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'validated_data' => $validated
                ]);

                if ($request->header('X-Inertia')) {
                     return redirect()->back()
                         ->with('error', 'Error creating timesheet: ' . $e->getMessage())
                         ->withInput();
                 }

                 if ($request->expectsJson()) {
                     return response()->json([
                         'success' => false,
                         'message' => 'Error creating timesheet: ' . $e->getMessage(),
                         'error' => $e->getMessage()
                     ], 500);
                 }

                throw $e;
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error creating timesheet', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);

            if ($request->header('X-Inertia')) {
                 return redirect()->back()
                     ->withErrors($e->validator)
                     ->withInput();
             }

             if ($request->expectsJson()) {
                 return response()->json([
                     'success' => false,
                     'message' => 'Validation failed.',
                     'errors' => $e->errors()
                 ], 422);
             }

            return redirect()->back()
                ->withErrors($e->validator)
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Unexpected error creating timesheet', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            if ($request->header('X-Inertia')) {
                 return redirect()->back()
                     ->with('error', 'An unexpected error occurred while creating the timesheet.')
                     ->withInput();
             }

             if ($request->expectsJson()) {
                 return response()->json([
                     'success' => false,
                     'message' => 'An unexpected error occurred while creating the timesheet.',
                     'error' => $e->getMessage()
                 ], 500);
             }

            return redirect()->back()
                ->with('error', 'An unexpected error occurred while creating the timesheet.')
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Timesheet $timesheet)
    {
        $timesheet->load(['employee' => function ($query) {
            $query->with(['recentTimesheets' => function ($query) {
                $query->orderBy('date', 'desc')->limit(5);
            }]);
        }, 'project']);

        return Inertia::render('Timesheets/Show', [
            'timesheet' => $timesheet,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Timesheet $timesheet)
    {
        $employees = Employee::orderBy('first_name')->get(['id', 'first_name', 'last_name']);
        $projects = Project::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Timesheets/Edit', [
            'timesheet' => $timesheet,
            'employees' => $employees,
            'projects' => $projects,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Timesheet $timesheet)
    {
        if (!$timesheet->canBeEdited()) {
            return redirect()->back()
                ->with('error', 'This timesheet cannot be edited.');
        }

        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date' => [
                'required',
                'date',
                function ($attribute, $value, $fail) use ($request, $timesheet) {
                    // Check for overlapping timesheets;
                    // excluding current timesheet
                    if (Timesheet::hasOverlap($request->employee_id, $value, $timesheet->id)) {
                        $fail('A timesheet already exists for this employee on this date.');
                    }
                },
            ],
            'hours_worked' => [
                'required',
                'numeric',
                'min:0',
                'max:24',
                function ($attribute, $value, $fail) use ($request, $timesheet) {
                    // Check weekly hours limit;
                    // accounting for the change in hours
                    $originalHours = $timesheet->hours_worked;
                    $netChange = $value - $originalHours;

                    if ($netChange > 0 && Timesheet::hasExceededWeeklyLimit(
                        $request->employee_id,
                        $request->date,
                        $netChange
                    )) {
                        $fail('This would exceed the weekly hours limit (60 hours).');
                    }
                },
            ],
            'overtime_hours' => [
                'nullable',
                'numeric',
                'min:0',
                'max:24',
                function ($attribute, $value, $fail) use ($request, $timesheet) {
                    // Check monthly overtime limit;
                    // accounting for the change in overtime
                    $originalOvertime = $timesheet->overtime_hours ?? 0;
                    $netChange = ($value ?? 0) - $originalOvertime;

                    if ($netChange > 0 && Timesheet::hasExceededMonthlyOvertimeLimit(
                        $request->employee_id,
                        $request->date,
                        $netChange
                    )) {
                        $fail('This would exceed the monthly overtime limit (40 hours).');
                    }
                },
            ],
            'project_id' => 'nullable|exists:projects,id',
            'description' => 'nullable|string|max:1000',
            'tasks_completed' => 'nullable|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            $oldLatitude = $timesheet->start_latitude;
            $oldLongitude = $timesheet->start_longitude;

            $timesheet->update($validated);

            // Process geofencing if location data has changed
            $locationChanged = ($oldLatitude !== $timesheet->start_latitude) ||
                             ($oldLongitude !== $timesheet->start_longitude);

            if ($locationChanged && $timesheet->start_latitude && $timesheet->start_longitude) {
                $geofenceResult = $this->geofencingService->processTimesheetLocation($timesheet);

                Log::info('Timesheet geofencing reprocessed after update', [
                    'timesheet_id' => $timesheet->id,
                    'geofence_status' => $geofenceResult['status'],
                    'employee_id' => $timesheet->employee_id
                ]);
            }

            DB::commit();

            return redirect()->route('timesheets.show', $timesheet)
                ->with('success', 'Timesheet updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error updating timesheet', [
                'timesheet_id' => $timesheet->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'An error occurred while updating the timesheet.')
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Timesheet $timesheet)
    {
        try {
            $timesheet->delete();
            return redirect()->route('timesheets.index')
                ->with('success', 'Timesheet deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Error deleting timesheet', [
                'timesheet_id' => $timesheet->id,
                'error' => $e->getMessage()
            ]);
            return redirect()->back()
                ->with('error', 'An error occurred while deleting the timesheet.');
        }
    }

    /**
     * Submit a timesheet for approval.
     */
    public function submit(Timesheet $timesheet)
    {
        if (!$timesheet->canBeSubmitted()) {
            return redirect()->back()
                ->with('error', 'This timesheet cannot be submitted.');
        }

        if ($timesheet->submit()) {
            return redirect()->route('timesheets.show', $timesheet)
                ->with('success', 'Timesheet submitted for approval.');
        } else {
            return redirect()->back()
                ->with('error', 'An error occurred while submitting the timesheet.');
        }
    }

    /**
     * Monthly timesheet report.
     */
    public function monthlyReport(Request $request)
    {
        $monthYear = $request->input('month', now()->format('Y-m'));
        $employeeId = $request->input('employee_id');

        $month = Carbon::parse($monthYear);
        $startDate = $month->copy()->startOfMonth();
        $endDate = $month->copy()->endOfMonth();

        $query = Timesheet::with(['employee', 'project'])
            ->whereBetween('date', [$startDate, $endDate]);

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        } elseif (!auth()->user()->hasRole(['admin', 'hr'])) {
            // If user is not admin/hr, only show their own timesheets
            $query->where('employee_id', auth()->user()->employee->id);
        }

        $timesheets = $query->orderBy('date')->get();

        // Group by employee
        $employeeTimesheets = $timesheets->groupBy('employee_id');

        $summaryData = [];
        foreach ($employeeTimesheets as $empId => $empTimesheets) {
            $employee = $empTimesheets->first()->employee;

            $summaryData[] = [
                'employee' => [
                    'id' => $employee->id,
                    'name' => $employee->first_name . ' ' . $employee->last_name,
                ],
                'total_days' => $empTimesheets->count(),
                'total_hours' => $empTimesheets->sum('hours_worked'),
                'total_overtime' => $empTimesheets->sum('overtime_hours'),
                'projects' => $empTimesheets->groupBy('project_id')->map(function ($items, $projectId) {
                    $project = $items->first()->project;
                    return [
                        'id' => $projectId,
                        'name' => $project ? $project->name : 'No Project',
                        'hours' => $items->sum('hours_worked'),
                        'overtime' => $items->sum('overtime_hours'),
                    ];
                })->values()->all(),
            ];
        }

        // Get all employees for filter
        $employees = Employee::orderBy('first_name')->get(['id', 'first_name', 'last_name']);

        return Inertia::render('Reports/Monthly', [
            'summary' => $summaryData,
            'employees' => $employees,
            'filters' => [
                'month' => $monthYear,
                'employee_id' => $employeeId,
            ],
        ]);
    }

    /**
     * Monthly timesheet view.
     */
    public function monthly()
    {
        $user = Auth::user();
        $employeeId = $user->employee->id ?? null;

        if (!$employeeId) {
            return Inertia::render('Reports/NoEmployeeRecord');
        }

        // Get current month dates
        $today = Carbon::today();
        $startOfMonth = $today->copy()->startOfMonth();
        $endOfMonth = $today->copy()->endOfMonth();
        $daysInMonth = $today->daysInMonth;

        // Get all timesheet entries for this month
        $timesheets = Timesheet::where('employee_id', $employeeId)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->get()
            ->keyBy(function ($timesheet) {
                return $timesheet->date->format('Y-m-d');
            });

        // Build calendar data
        $calendarData = [];
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = Carbon::create($today->year, $today->month, $day);
            $dateString = $date->format('Y-m-d');

            $calendarData[] = [
                'date' => $dateString,
                'day' => $day,
                'dayOfWeek' => $date->dayOfWeek,
                'isWeekend' => $date->isWeekend(),
                'isToday' => $date->isToday(),
                'timesheet' => $timesheets->get($dateString),
                'status' => $timesheets->has($dateString)
                    ? $timesheets->get($dateString)->status
                    : null,
            ];
        }

        // Get summary data
        $totalRegularHours = $timesheets->sum('hours_worked');
        $totalOvertimeHours = $timesheets->sum('overtime_hours');
        $totalHours = $totalRegularHours + $totalOvertimeHours;
        $totalDays = $timesheets->count();

        // Get projects worked this month
        $projects = $timesheets->groupBy('project_id')->map(function ($items, $projectId) {
            $project = $items->first()->project;
            return [
                'id' => $projectId,
                'name' => $project ? $project->name : 'No Project',
                'hours' => $items->sum('hours_worked'),
                'overtime' => $items->sum('overtime_hours'),
                'days' => $items->count(),
            ];
        })->values()->all();

        return Inertia::render('Timesheets/Monthly', [
            'calendar' => $calendarData,
            'summary' => [
                'regularHours' => $totalRegularHours,
                'overtimeHours' => $totalOvertimeHours,
                'totalHours' => $totalHours,
                'totalDays' => $totalDays,
                'projects' => $projects,
                'month' => $today->format('F Y'),
            ],
        ]);
    }

    /**
     * Timesheet summary for the employee dashboard.
     */
    public function summary()
    {
        $user = Auth::user();
        $employeeId = $user->employee->id ?? null;

        if (!$employeeId) {
            return [
                'this_week' => [],
                'last_week' => [],
                'has_timesheets' => false,
            ];
        }

        // Get dates for this week and last week
        $today = Carbon::today();
        $thisWeekStart = $today->copy()->startOfWeek();
        $thisWeekEnd = $today->copy()->endOfWeek();
        $lastWeekStart = $thisWeekStart->copy()->subWeek();
        $lastWeekEnd = $thisWeekEnd->copy()->subWeek();

        // Get timesheets for this week
        $thisWeekTimesheets = Timesheet::where('employee_id', $employeeId)
            ->whereBetween('date', [$thisWeekStart, $thisWeekEnd])
            ->orderBy('date')
            ->get();

        // Get timesheets for last week
        $lastWeekTimesheets = Timesheet::where('employee_id', $employeeId)
            ->whereBetween('date', [$lastWeekStart, $lastWeekEnd])
            ->orderBy('date')
            ->get();

        return [
            'this_week' => [
                'timesheets' => $thisWeekTimesheets,
                'total_hours' => $thisWeekTimesheets->sum('hours_worked'),
                'total_overtime' => $thisWeekTimesheets->sum('overtime_hours'),
                'days_logged' => $thisWeekTimesheets->count(),
            ],
            'last_week' => [
                'timesheets' => $lastWeekTimesheets,
                'total_hours' => $lastWeekTimesheets->sum('hours_worked'),
                'total_overtime' => $lastWeekTimesheets->sum('overtime_hours'),
                'days_logged' => $lastWeekTimesheets->count(),
            ],
            'has_timesheets' => $thisWeekTimesheets->count() > 0 || $lastWeekTimesheets->count() > 0,
        ];
    }

    /**
     * Store multiple timesheets in bulk.
     */
    public function storeBulk(Request $request)
    {
        try {
            Log::info('Bulk timesheet creation request received', [
                'request_data' => $request->all(),
                'user_id' => auth()->id()
            ]);

            $validated = $request->validate([
                'employee_id' => 'required|exists:employees,id',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'hours_worked' => 'required|numeric|min:0|max:24',
                'overtime_hours' => 'nullable|numeric|min:0|max:24',
                'project_id' => 'nullable|exists:projects,id',
                'rental_id' => 'nullable|exists:rentals,id',
                'description' => 'nullable|string|max:1000',
                'tasks_completed' => 'nullable|string|max:1000',
                'daily_overtime_hours' => 'nullable|array',
            ]);

            $startDate = Carbon::parse($validated['start_date']);
            $endDate = Carbon::parse($validated['end_date']);
            $dailyOvertimeHours = $validated['daily_overtime_hours'] ?? [];

            // Check if date range is reasonable (max 31 days)
            if ($startDate->diffInDays($endDate) > 31) {
                return redirect()->back()
                    ->withErrors(['end_date' => 'Date range cannot exceed 31 days.'])
                    ->withInput();
            }

            DB::beginTransaction();

            try {
                $createdTimesheets = [];
                $currentDate = $startDate->copy();

                while ($currentDate->lte($endDate)) {
                    $dateString = $currentDate->format('Y-m-d');

                    // Check for existing timesheet on this date
                    if (Timesheet::hasOverlap($validated['employee_id'], $dateString)) {
                        DB::rollBack();
                        return redirect()->back()
                            ->withErrors(['date' => "A timesheet already exists for {$currentDate->format('M d, Y')}."])
                            ->withInput();
                    }

                    // Get overtime hours for this specific date
                    $overtimeHours = $dailyOvertimeHours[$dateString] ?? $validated['overtime_hours'] ?? 0;

                    // Check weekly hours limit
                    if (Timesheet::hasExceededWeeklyLimit($validated['employee_id'], $dateString, $validated['hours_worked'])) {
                        DB::rollBack();
                        return redirect()->back()
                            ->withErrors(['hours_worked' => "Weekly hours limit would be exceeded for {$currentDate->format('M d, Y')}."])
                            ->withInput();
                    }

                    // Check monthly overtime limit
                    if ($overtimeHours > 0 && Timesheet::hasExceededMonthlyOvertimeLimit($validated['employee_id'], $dateString, $overtimeHours)) {
                        DB::rollBack();
                        return redirect()->back()
                            ->withErrors(['overtime_hours' => "Monthly overtime limit would be exceeded for {$currentDate->format('M d, Y')}."])
                            ->withInput();
                    }

                    $timesheet = Timesheet::create([
                        'employee_id' => $validated['employee_id'],
                        'date' => $dateString,
                        'hours_worked' => $validated['hours_worked'],
                        'overtime_hours' => $overtimeHours,
                        'project_id' => $validated['project_id'],
                        'rental_id' => $validated['rental_id'],
                        'description' => $validated['description'],
                        'tasks' => $validated['tasks_completed'],
                        'status' => Timesheet::STATUS_DRAFT,
                        'start_time' => '09:00',
                        'end_time' => null,
                    ]);

                    $createdTimesheets[] = $timesheet;
                    $currentDate->addDay();
                }

                DB::commit();

                Log::info('Bulk timesheets created successfully', [
                    'count' => count($createdTimesheets),
                    'employee_id' => $validated['employee_id'],
                    'date_range' => $validated['start_date'] . ' to ' . $validated['end_date']
                ]);

                return redirect()->route('timesheets.monthly')
                    ->with('success', 'Bulk timesheets created successfully. ' . count($createdTimesheets) . ' timesheets were created.');

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error creating bulk timesheets', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'validated_data' => $validated
                ]);
                throw $e;
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error creating bulk timesheets', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return redirect()->back()
                ->withErrors($e->validator)
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Unexpected error creating bulk timesheets', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return redirect()->back()
                ->with('error', 'An unexpected error occurred while creating the bulk timesheets.')
                ->withInput();
        }
    }

    /**
     * Check for duplicate timesheet entry.
     */
    public function checkDuplicate(Request $request)
    {
        $employeeId = $request->input('employee_id');
        $date = $request->input('date');
        $timesheetId = $request->input('timesheet_id');

        if (!$employeeId || !$date) {
            return response()->json(['exists' => false]);
        }

        $exists = Timesheet::hasOverlap($employeeId, $date, $timesheetId);

        return response()->json(['exists' => $exists]);
    }

    /**
     * API: Get timesheets for an employee in a date range
     */
    public function apiEmployeeTimesheets(Request $request, $employeeId)
    {
        $employee = Employee::findOrFail($employeeId);
        $start = $request->query('start_date');
        $end = $request->query('end_date');

        $timesheets = Timesheet::where('employee_id', $employeeId)
            ->whereBetween('date', [$start, $end])
            ->get();

        return response()->json(['timesheets' => $timesheets]);
    }

    /**
     * API: Get total hours summary for an employee in a date range
     */
    public function apiEmployeeTimesheetTotalHours(Request $request, $employeeId)
    {
        $employee = Employee::findOrFail($employeeId);
        $start = $request->query('start_date');
        $end = $request->query('end_date');

        $summary = Timesheet::where('employee_id', $employeeId)
            ->whereBetween('date', [$start, $end])
            ->selectRaw('COALESCE(SUM(hours_worked),0) as regular_hours, COALESCE(SUM(overtime_hours),0) as overtime_hours, COALESCE(SUM(hours_worked + overtime_hours),0) as total_hours')
            ->first();

        return response()->json($summary);
    }
}




