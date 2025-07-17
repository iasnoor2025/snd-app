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
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\RentalManagement\Domain\Models\Rental;
use Illuminate\Support\Facades\Artisan;

class TimesheetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        \Log::debug('Timesheet index request', [
            'all' => $request->all(),
            'query' => $request->getQueryString(),
            'status' => $request->status,
            'status_filter_applied' => $request->status && $request->status !== 'all',
            'user_id' => $user->id,
            'user_roles' => $user->roles->pluck('name')->toArray(),
            'has_admin_hr_role' => $user->hasRole(['admin', 'hr']),
            'user_employee_id' => $user->employee ? $user->employee->id : null,
        ]);
        $query = Timesheet::with(['employee:id,first_name,last_name', 'project', 'rental.rentalItems.equipment'])
            ->when($request->month, function ($query, $month) {
                return $query->whereMonth('date', Carbon::parse($month)->month)
                    ->whereYear('date', Carbon::parse($month)->year);
            })
            ->when($request->employee_id, function ($query, $employeeId) {
                return $query->where('employee_id', $employeeId);
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('employee', function ($q2) use ($search) {
                        $q2->where('first_name', 'like', "%$search%")
                            ->orWhere('last_name', 'like', "%$search%")
                            ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ["%$search%"]);
                    })
                    ->orWhereHas('project', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%$search%");
                    })
                    ->orWhere('description', 'like', "%$search%")
                    ->orWhere('tasks', 'like', "%$search%")
                    ;
                });
            })
            ->when($request->status && $request->status !== 'all', function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->when($request->date_from, function ($query, $dateFrom) {
                return $query->where('date', '>=', $dateFrom);
            })
            ->when($request->date_to, function ($query, $dateTo) {
                return $query->where('date', '<=', $dateTo);
            });

        // If user is not admin/hr, only show their own timesheets
        $shouldFilterByEmployee = !$user->hasRole(['admin', 'hr']);
        \Log::debug('Employee filtering logic', [
            'should_filter_by_employee' => $shouldFilterByEmployee,
            'user_employee_exists' => $user->employee !== null,
        ]);

        if ($shouldFilterByEmployee) {
            if ($user->employee) {
                $query->where('employee_id', $user->employee->id);
                \Log::debug('Applied employee filter', ['employee_id' => $user->employee->id]);
            } else {
                \Log::warning('User has no employee record but should be filtered by employee');
                // Return empty result if user has no employee record
                $query->where('employee_id', -1);
            }
        }

        // Debug the SQL query
        \Log::debug('Final query SQL', [
            'sql' => $query->toSql(),
            'bindings' => $query->getBindings(),
        ]);

        $timesheets = $query->latest()->paginate($request->per_page ?: 15);

        // Map rental to include equipment.name for each timesheet
        $timesheets->getCollection()->transform(function ($timesheet) {
            if ($timesheet->rental) {
                $equipmentName = null;
                if ($timesheet->rental->rentalItems && $timesheet->rental->rentalItems->isNotEmpty() && $timesheet->rental->rentalItems->first()->equipment) {
                    $equipmentName = $timesheet->rental->rentalItems->first()->equipment->name;
                }
                $timesheet->rental->equipment = [ 'name' => $equipmentName ];
            }
            // Ensure location fields are present for manual assignments
            $timesheet->start_address = $timesheet->start_address ?? null;
            $timesheet->end_address = $timesheet->end_address ?? null;
            $timesheet->location = $timesheet->location ?? null;
            return $timesheet;
        });

        // Get actual status distribution for debugging
        $statusDistribution = Timesheet::select('status', DB::raw('count(*) as count'))
            ->when(!$user->hasRole(['admin', 'hr']), function ($query) use ($user) {
                $query->where('employee_id', $user->employee->id);
            })
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        \Log::debug('Timesheet query results', [
            'total_count' => $timesheets->total(),
            'current_page_count' => $timesheets->count(),
            'per_page' => $timesheets->perPage(),
            'current_page' => $timesheets->currentPage(),
            'status_distribution' => $statusDistribution,
        ]);

        return Inertia::render('Timesheets/Index', [
            'timesheets' => $timesheets,
            'filters' => array_merge(
                $request->only(['month', 'employee_id', 'search', 'status', 'date_from', 'date_to', 'per_page']),
                ['status' => $request->status ?: 'all']
            )
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

                // Log successful creation
                Log::info('Timesheet created successfully', [
                    'timesheet_id' => $timesheet->id,
                    'employee_id' => $timesheet->employee_id,
                    'date' => $timesheet->date?->format('Y-m-d'),
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
        $timesheet->load(['employee.user', 'project', 'rental']);
        return Inertia::render('Timesheets/Show', [
            'timesheet' => $timesheet,
            'employee' => $timesheet->employee,
            'project' => $timesheet->project,
            'rental' => $timesheet->rental,
            'user' => $timesheet->employee?->user,
            'created_at' => $timesheet->created_at,
            'updated_at' => $timesheet->updated_at,
            'deleted_at' => $timesheet->deleted_at,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Timesheet $timesheet)
    {
        $employees = Employee::orderBy('first_name')->get(['id', 'first_name', 'last_name']);
        $projects = Project::orderBy('name')->get(['id', 'name']);

        // Get all rentals for the dropdown
        $rentals = Rental::with('rentalItems.equipment')
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

        $timesheet->load(['employee.user', 'project', 'rental']);
        return Inertia::render('Timesheets/Edit', [
            'timesheet' => $timesheet,
            'employee' => $timesheet->employee,
            'project' => $timesheet->project,
            'rental' => $timesheet->rental,
            'user' => $timesheet->employee?->user,
            'created_at' => $timesheet->created_at,
            'updated_at' => $timesheet->updated_at,
            'deleted_at' => $timesheet->deleted_at,
            'employees' => $employees,
            'projects' => $projects,
            'rentals' => $rentals,
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
            'status' => 'required|string|in:draft,submitted,foreman_approved,incharge_approved,checking_approved,manager_approved,rejected',
        ]);

        // Map tasks_completed to tasks field for the model
        if (isset($validated['tasks_completed'])) {
            $validated['tasks'] = $validated['tasks_completed'];
            unset($validated['tasks_completed']);
        }

        try {
            DB::beginTransaction();

            $oldLatitude = $timesheet->start_latitude;
            $oldLongitude = $timesheet->start_longitude;

            $timesheet->update($validated);

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
                    'file_number' => $employee->file_number,
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

        // Use requested month if present, otherwise default to current month
        $monthParam = request('month');
        $month = $monthParam ? \Carbon\Carbon::parse($monthParam . '-01') : \Carbon\Carbon::today();
        $startOfMonth = $month->copy()->startOfMonth();
        $endOfMonth = $month->copy()->endOfMonth();

        // If admin or HR, show all employees' monthly summary
        if ($user->hasRole(['admin', 'hr'])) {
            // Get all timesheet entries for this month
            $timesheets = Timesheet::with(['employee', 'project'])
                ->whereBetween('date', [$startOfMonth, $endOfMonth])
                ->get();

            // Group by employee
            $employeeTimesheets = $timesheets->groupBy('employee_id');

            $summaryData = [];
            foreach ($employeeTimesheets as $empId => $empTimesheets) {
                $employee = $empTimesheets->first()->employee;
                $projects = $empTimesheets->groupBy(function ($item) {
                    $projectName = $item->project ? $item->project->name : null;
                    $equipmentName = $item->rental && $item->rental->rentalItems && $item->rental->rentalItems->isNotEmpty() && $item->rental->rentalItems->first()->equipment ? $item->rental->rentalItems->first()->equipment->name : null;
                    if ($projectName && $equipmentName) {
                        return $projectName . ' / ' . $equipmentName;
                    } elseif ($projectName) {
                        return $projectName;
                    } elseif ($equipmentName) {
                        return $equipmentName;
                    } else {
                        return 'No Project / No Equipment';
                    }
                })->map(function ($items, $assignmentName) {
                    return [
                        'name' => $assignmentName,
                        'hours' => $items->sum('hours_worked'),
                        'overtime' => $items->sum('overtime_hours'),
                    ];
                })->values()->all();
                $summaryData[] = [
                    'employee' => [
                        'id' => $employee->id ?? null,
                        'name' => $employee ? ($employee->first_name . ' ' . $employee->last_name) : 'Unknown',
                        'file_number' => $employee->file_number ?? null,
                    ],
                    'total_days' => $empTimesheets->count(),
                    'total_hours' => $empTimesheets->sum('hours_worked'),
                    'total_overtime' => $empTimesheets->sum('overtime_hours'),
                    'projects' => $projects,
                ];
            }

            // Get all employees for filter
            $employees = \Modules\EmployeeManagement\Domain\Models\Employee::orderBy('first_name')->get(['id', 'first_name', 'last_name']);

            return Inertia::render('Reports/Monthly', [
                'summary' => $summaryData,
                'employees' => $employees,
                'filters' => [
                    'month' => $month->format('Y-m'),
                ],
            ]);
        }

        // For non-admins, require employee record
        if (!$employeeId) {
            return Inertia::render('Reports/NoEmployeeRecord');
        }

        // Get all timesheet entries for this month
        $timesheets = Timesheet::where('employee_id', $employeeId)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->get()
            ->keyBy(function ($timesheet) {
                return $timesheet->date->format('Y-m-d');
            });

        // Create calendar data for the month
        $calendar = [];
        // Fill all days in the month with default values
        $daysInMonth = (int)date('t', strtotime($startDate));
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $dateStr = sprintf('%04d-%02d-%02d', $month->year, str_pad($month->month, 2, '0', STR_PAD_LEFT), str_pad($d, 2, '0', STR_PAD_LEFT));
            $dayOfWeek = date('w', strtotime($dateStr));
            $calendar[$dateStr] = [
                'date' => $dateStr,
                'day_of_week' => $dayOfWeek,
                'day_name' => date('l', strtotime($dateStr)),
                'regular_hours' => 0.0,
                'overtime_hours' => 0.0,
            ];
        }
        // Overwrite with actual timesheet data
        $grouped = $timesheets->groupBy(function($t) { return date('Y-m-d', strtotime($t->date)); });
        foreach ($grouped as $date => $items) {
            $dayOfWeek = date('w', strtotime($date));
            $calendar[$date] = [
                'date' => $date,
                'day_of_week' => $dayOfWeek,
                'day_name' => date('l', strtotime($date)),
                'regular_hours' => $items->sum('hours_worked'),
                'overtime_hours' => $items->sum('overtime_hours'),
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
            'calendar' => $calendar,
            'summary' => [
                'regularHours' => $totalRegularHours,
                'overtimeHours' => $totalOvertimeHours,
                'totalHours' => $totalHours,
                'totalDays' => $totalDays,
                'projects' => $projects,
                'month' => $month->format('F Y'),
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

        // Use requested month if present, otherwise default to current month
        $monthParam = request('month');
        $month = $monthParam ? \Carbon\Carbon::parse($monthParam . '-01') : \Carbon\Carbon::today();
        $startOfMonth = $month->copy()->startOfMonth();
        $endOfMonth = $month->copy()->endOfMonth();

        // If admin or HR, show all employees' monthly summary
        if ($user->hasRole(['admin', 'hr'])) {
            $timesheets = Timesheet::with(['employee', 'project'])
                ->whereBetween('date', [$startOfMonth, $endOfMonth])
                ->get();

            $total_hours = $timesheets->sum('hours_worked');
            $total_overtime = $timesheets->sum('overtime_hours');
            $total_timesheets = $timesheets->count();

            $employee_stats = $timesheets->groupBy('employee_id')->map(function ($items, $employeeId) {
                $employee = $items->first()->employee;
                return [
                    'employee_id' => $employeeId,
                    'employee' => $employee,
                    'total_hours' => $items->sum('hours_worked'),
                    'total_overtime' => $items->sum('overtime_hours'),
                    'total_timesheets' => $items->count(),
                ];
            })->values()->all();

            $project_stats = $timesheets->groupBy('project_id')->map(function ($items, $projectId) use ($total_hours) {
                $project = $items->first()->project;
                $hours = $items->sum('hours_worked');
                $percentage = $total_hours > 0 ? round(($hours / $total_hours) * 100, 1) : 0;
                return [
                    'project_id' => $projectId,
                    'project' => $project,
                    'total_hours' => $hours,
                    'percentage' => $percentage,
                ];
            })->values()->all();

            $status_stats = $timesheets->groupBy('status')->map(function ($items, $status) use ($total_timesheets) {
                $count = $items->count();
                $percentage = $total_timesheets > 0 ? round(($count / $total_timesheets) * 100, 1) : 0;
                return [
                    'status' => $status,
                    'count' => $count,
                    'percentage' => $percentage,
                ];
            })->values()->all();

            // Debug logging
            \Log::debug('Admin/HR Summary Data', [
                'total_hours' => $total_hours,
                'total_overtime' => $total_overtime,
                'total_timesheets' => $total_timesheets,
                'employee_stats_count' => count($employee_stats),
                'employee_stats' => $employee_stats,
                'project_stats_count' => count($project_stats),
                'status_stats_count' => count($status_stats),
            ]);

            return Inertia::render('Timesheets/Summary', [
                'summary' => [
                    'month' => $month->format('F'),
                    'year' => $month->year,
                    'total_hours' => $total_hours,
                    'total_overtime' => $total_overtime,
                    'total_timesheets' => $total_timesheets,
                    'employee_stats' => $employee_stats,
                    'project_stats' => $project_stats,
                    'status_stats' => $status_stats,
                ],
                'employees' => \Modules\EmployeeManagement\Domain\Models\Employee::orderBy('first_name')->get(['id', 'first_name', 'last_name']),
                'projects' => \Modules\ProjectManagement\Domain\Models\Project::orderBy('name')->get(['id', 'name']),
            ]);
        }

        // For non-admins, require employee record
        if (!$employeeId) {
            return Inertia::render('Reports/NoEmployeeRecord');
        }

        // Get all timesheet entries for this month for the employee
        $timesheets = Timesheet::where('employee_id', $employeeId)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->get();

        $total_hours = $timesheets->sum('hours_worked');
        $total_overtime = $timesheets->sum('overtime_hours');
        $total_timesheets = $timesheets->count();

        $employee = $user->employee;
        $employee_stats = [[
            'employee_id' => $employee->id,
            'employee' => $employee,
            'total_hours' => $total_hours,
            'total_overtime' => $total_overtime,
            'total_timesheets' => $total_timesheets,
        ]];

        $project_stats = $timesheets->groupBy('project_id')->map(function ($items, $projectId) use ($total_hours) {
            $project = $items->first()->project;
            $hours = $items->sum('hours_worked');
            $percentage = $total_hours > 0 ? round(($hours / $total_hours) * 100, 1) : 0;
            return [
                'project_id' => $projectId,
                'project' => $project,
                'total_hours' => $hours,
                'percentage' => $percentage,
            ];
        })->values()->all();

        $status_stats = $timesheets->groupBy('status')->map(function ($items, $status) use ($total_timesheets) {
            $count = $items->count();
            $percentage = $total_timesheets > 0 ? round(($count / $total_timesheets) * 100, 1) : 0;
            return [
                'status' => $status,
                'count' => $count,
                'percentage' => $percentage,
            ];
        })->values()->all();

        // Debug logging
        \Log::debug('Non-Admin Summary Data', [
            'employee_id' => $employeeId,
            'total_hours' => $total_hours,
            'total_overtime' => $total_overtime,
            'total_timesheets' => $total_timesheets,
            'employee_stats_count' => count($employee_stats),
            'employee_stats' => $employee_stats,
            'project_stats_count' => count($project_stats),
            'status_stats_count' => count($status_stats),
        ]);

        return Inertia::render('Timesheets/Summary', [
            'summary' => [
                'month' => $month->format('F'),
                'year' => $month->year,
                'total_hours' => $total_hours,
                'total_overtime' => $total_overtime,
                'total_timesheets' => $total_timesheets,
                'employee_stats' => $employee_stats,
                'project_stats' => $project_stats,
                'status_stats' => $status_stats,
            ],
            'employees' => [$employee],
            'projects' => \Modules\ProjectManagement\Domain\Models\Project::orderBy('name')->get(['id', 'name']),
        ]);
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
                        'status' => Timesheet::STATUS_SUBMITTED,
                        'start_time' => '08:00',
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

    /**
     * Bulk delete draft timesheets (admin only).
     */
    public function bulkDelete(Request $request)
    {
        $user = auth()->user();
        \Log::debug('Bulk delete request', [
            'user_id' => $user ? $user->id : null,
            'user_roles' => $user ? $user->getRoleNames() : null,
            'user_permissions' => $user ? $user->getAllPermissions()->pluck('name') : null,
            'request_ids' => $request->input('ids'),
        ]);
        if (!$user || (!$user->hasRole('admin') && !$user->can('timesheets.delete'))) {
            \Log::warning('Bulk delete unauthorized', [
                'user_id' => $user ? $user->id : null,
                'user_roles' => $user ? $user->getRoleNames() : null,
                'user_permissions' => $user ? $user->getAllPermissions()->pluck('name') : null,
            ]);
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $ids = $request->input('ids', []);
        if (!is_array($ids) || empty($ids)) {
            \Log::warning('Bulk delete: No timesheet IDs provided', [
                'user_id' => $user ? $user->id : null,
                'request_ids' => $ids,
            ]);
            return response()->json(['error' => 'No timesheet IDs provided'], 400);
        }
        $deleted = 0;
        foreach ($ids as $id) {
            $timesheet = \Modules\TimesheetManagement\Domain\Models\Timesheet::find($id);
            if ($timesheet) {
                $timesheet->delete();
                $deleted++;
            }
        }
        \Log::info('Bulk delete completed', [
            'user_id' => $user->id,
            'deleted_count' => $deleted,
            'ids' => $ids,
        ]);
        return response()->json(['success' => true, 'deleted' => $deleted]);
    }

    /**
     * Bulk approve timesheets (admin only).
     */
    public function bulkApprove(Request $request)
    {
        $user = auth()->user();
        if (!$user || !$user->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $ids = $request->input('timesheet_ids', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json(['error' => 'No timesheet IDs provided'], 400);
        }
        $approved = 0;
        foreach ($ids as $id) {
            $timesheet = \Modules\TimesheetManagement\Domain\Models\Timesheet::find($id);
            if ($timesheet && $timesheet->status === \Modules\TimesheetManagement\Domain\Models\Timesheet::STATUS_SUBMITTED) {
                $timesheet->status = \Modules\TimesheetManagement\Domain\Models\Timesheet::STATUS_MANAGER_APPROVED;
                $timesheet->save();
                $approved++;
            }
        }
        return response()->json(['success' => true, 'approved' => $approved]);
    }

    /**
     * Approve a single timesheet.
     */
    public function approve(Request $request, $id)
    {
        $user = auth()->user();
        $timesheet = \Modules\TimesheetManagement\Domain\Models\Timesheet::find($id);
        if (!$user || !$timesheet) {
            return response()->json(['error' => 'Unauthorized or timesheet not found'], 403);
        }

        // Check if user has general approval permission - if so, allow direct final approval
        if ($user->can('timesheets.approve')) {
            if ($timesheet->status === $timesheet::STATUS_SUBMITTED) {
                // Direct approval to final stage for users with general approval permission
                $timesheet->status = $timesheet::STATUS_MANAGER_APPROVED;
                $timesheet->manager_approval_by = $user->id;
                $timesheet->manager_approval_at = now();
                $timesheet->save();
                return response()->json(['success' => true, 'message' => 'Timesheet approved successfully.']);
            }
            return response()->json(['error' => 'Only submitted timesheets can be approved.'], 400);
        }

        // Multi-stage approval workflow for specific roles
        // Foreman approval
        if ($timesheet->status === $timesheet::STATUS_SUBMITTED) {
            if ($user->hasRole(['foreman', 'admin', 'hr'])) {
                if ($timesheet->approveByForeman($user->id)) {
                    return response()->json(['success' => true, 'message' => 'Timesheet approved by foreman.']);
                }
                return response()->json(['error' => 'Approval failed.'], 400);
            }
            return response()->json(['error' => 'Only foreman, admin, or hr can approve at this stage.'], 403);
        }
        // Incharge approval
        if ($timesheet->status === $timesheet::STATUS_FOREMAN_APPROVED) {
            if ($user->hasRole(['timesheet_incharge', 'admin', 'hr'])) {
                if ($timesheet->approveByIncharge($user->id)) {
                    return response()->json(['success' => true, 'message' => 'Timesheet approved by incharge.']);
                }
                return response()->json(['error' => 'Approval failed.'], 400);
            }
            return response()->json(['error' => 'Only incharge, admin, or hr can approve at this stage.'], 403);
        }
        // Checking approval
        if ($timesheet->status === $timesheet::STATUS_INCHARGE_APPROVED) {
            if ($user->hasRole(['timesheet_checking', 'admin', 'hr'])) {
                if ($timesheet->approveByChecking($user->id)) {
                    return response()->json(['success' => true, 'message' => 'Timesheet approved by checking incharge.']);
                }
                return response()->json(['error' => 'Approval failed.'], 400);
            }
            return response()->json(['error' => 'Only checking incharge, admin, or hr can approve at this stage.'], 403);
        }
        // Manager approval
        if ($timesheet->status === $timesheet::STATUS_CHECKING_APPROVED) {
            if ($user->hasRole(['manager', 'admin', 'hr'])) {
                if ($timesheet->approveByManager($user->id)) {
                    return response()->json(['success' => true, 'message' => 'Timesheet approved by manager.']);
                }
                return response()->json(['error' => 'Approval failed.'], 400);
            }
            return response()->json(['error' => 'Only manager, admin, or hr can approve at this stage.'], 403);
        }
        return response()->json(['error' => 'No approval possible at this stage.'], 400);
    }

    /**
     * Approve a timesheet (web route version).
     */
    public function approveWeb(Request $request, Timesheet $timesheet)
    {
        $user = auth()->user();
        if (!$user) {
            return redirect()->back()->withErrors(['error' => 'Unauthorized']);
        }

        // Check if user has general approval permission - if so, allow direct final approval
        if ($user->can('timesheets.approve')) {
            if ($timesheet->status === $timesheet::STATUS_SUBMITTED) {
                // Direct approval to final stage for users with general approval permission
                $timesheet->status = $timesheet::STATUS_MANAGER_APPROVED;
                $timesheet->manager_approval_by = $user->id;
                $timesheet->manager_approval_at = now();
                $timesheet->save();
                return redirect()->back()->with('success', 'Timesheet approved successfully.');
            }
            return redirect()->back()->withErrors(['error' => 'Only submitted timesheets can be approved.']);
        }

        return redirect()->back()->withErrors(['error' => 'You do not have permission to approve timesheets.']);
    }

    /**
     * Reject a timesheet (web route version).
     */
    public function rejectWeb(Request $request, Timesheet $timesheet)
    {
        $user = auth()->user();
        if (!$user) {
            return redirect()->back()->withErrors(['error' => 'Unauthorized']);
        }

        if ($user->can('timesheets.approve')) {
            if ($timesheet->status === $timesheet::STATUS_SUBMITTED) {
                $timesheet->status = $timesheet::STATUS_REJECTED;
                $timesheet->rejected_by = $user->id;
                $timesheet->rejected_at = now();
                $timesheet->rejection_reason = $request->input('reason', 'No reason provided');
                $timesheet->save();
                return redirect()->back()->with('success', 'Timesheet rejected successfully.');
            }
            return redirect()->back()->withErrors(['error' => 'Only submitted timesheets can be rejected.']);
        }

        return redirect()->back()->withErrors(['error' => 'You do not have permission to reject timesheets.']);
    }

    /**
     * Bulk approve timesheets (web route version).
     */
    public function bulkApproveWeb(Request $request)
    {
        $user = auth()->user();
        if (!$user || !$user->can('timesheets.approve')) {
            return redirect()->back()->withErrors(['error' => 'Unauthorized']);
        }

        $ids = $request->input('timesheet_ids', []);
        if (!is_array($ids) || empty($ids)) {
            return redirect()->back()->withErrors(['error' => 'No timesheet IDs provided']);
        }

        $approved = 0;
        foreach ($ids as $id) {
            $timesheet = \Modules\TimesheetManagement\Domain\Models\Timesheet::find($id);
            if ($timesheet && $timesheet->status === \Modules\TimesheetManagement\Domain\Models\Timesheet::STATUS_SUBMITTED) {
                $timesheet->status = \Modules\TimesheetManagement\Domain\Models\Timesheet::STATUS_MANAGER_APPROVED;
                $timesheet->manager_approval_by = $user->id;
                $timesheet->manager_approval_at = now();
                $timesheet->save();
                $approved++;
            }
        }

        return redirect()->back()->with('success', "{$approved} timesheets approved successfully");
    }

    /**
     * Bulk submit draft/rejected timesheets (web route version).
     */
    public function bulkSubmitWeb(Request $request)
    {
        $user = auth()->user();
        if (!$user || !$user->hasRole(['admin', 'hr', 'foreman', 'timesheet_incharge', 'manager'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $ids = $request->input('timesheet_ids', []);
        if (!is_array($ids) || empty($ids)) {
            return response()->json(['error' => 'No timesheet IDs provided'], 400);
        }
        $submitted = 0;
        foreach ($ids as $id) {
            $timesheet = \Modules\TimesheetManagement\Domain\Models\Timesheet::find($id);
            if ($timesheet && in_array($timesheet->status, ['draft', 'rejected'])) {
                $timesheet->status = 'submitted';
                $timesheet->submitted_at = now();
                $timesheet->save();
                $submitted++;
            }
        }
        return response()->json(['success' => true, 'submitted' => $submitted]);
    }

    /**
     * Store multiple split assignment timesheets in bulk.
     */
    public function storeBulkSplit(Request $request)
    {
        $validated = $request->validate([
            'assignments' => 'required|array|min:1',
            'assignments.*.employee_id' => 'required|exists:employees,id',
            'assignments.*.date_from' => 'required|date',
            'assignments.*.date_to' => 'required|date|after_or_equal:assignments.*.date_from',
            'assignments.*.project_id' => 'nullable|exists:projects,id',
            'assignments.*.rental_id' => 'nullable|exists:rentals,id',
            'assignments.*.hours_worked' => 'required|numeric|min:0',
            'assignments.*.overtime_hours' => 'nullable|numeric|min:0',
            'assignments.*.description' => 'nullable|string',
            'assignments.*.tasks' => 'nullable|string',
        ]);

        $created = [];
        DB::beginTransaction();
        try {
            foreach ($validated['assignments'] as $block) {
                $dates = $this->getDateRange($block['date_from'], $block['date_to']);
                foreach ($dates as $date) {
                    $created[] = Timesheet::create([
                        'employee_id' => $block['employee_id'],
                        'project_id' => $block['project_id'] ?? null,
                        'rental_id' => $block['rental_id'] ?? null,
                        'date' => $date,
                        'hours_worked' => $block['hours_worked'],
                        'overtime_hours' => $block['overtime_hours'] ?? 0,
                        'description' => $block['description'] ?? null,
                        'tasks' => $block['tasks'] ?? null,
                        'status' => 'submitted',
                        'start_time' => $block['start_time'] ?? '08:00',
                        'end_time' => $block['end_time'] ?? null,
                    ]);
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk split timesheet creation failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create timesheets', 'error' => $e->getMessage()], 500);
        }
        // If request expects JSON (API), return JSON, else redirect
        if ($request->wantsJson()) {
            return response()->json(['message' => 'Timesheets created successfully', 'count' => count($created)]);
        }
        return redirect()->route('timesheets.index')->with('success', __('TimesheetManagement::timesheet.bulk_split_success'));
    }

    /**
     * Helper to get all dates between two dates (inclusive).
     */
    protected function getDateRange($from, $to)
    {
        $dates = [];
        $current = Carbon::parse($from);
        $end = Carbon::parse($to);
        while ($current->lte($end)) {
            $dates[] = $current->format('Y-m-d');
            $current->addDay();
        }
        return $dates;
    }

    /**
     * Generate and display the payslip for an employee for a given month.
     */
    public function generatePaySlip($employee, $month)
    {
        // Parse employee
        $employee = \Modules\EmployeeManagement\Domain\Models\Employee::findOrFail($employee);
        // Parse month
        [$year, $monthNum] = explode('-', $month);
        $startDate = "$year-$monthNum-01";
        $endDate = date('Y-m-t', strtotime($startDate));

        // Get timesheets for the month (all statuses)
        $timesheets = \Modules\TimesheetManagement\Domain\Models\Timesheet::where('employee_id', $employee->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->get();

        // Calculate totals
        $totalRegularHours = $timesheets->sum('hours_worked');
        $totalOvertimeHours = $timesheets->sum('overtime_hours');
        $totalHours = $totalRegularHours + $totalOvertimeHours;
        $daysWorked = $timesheets->count();

        // Create calendar data for the month
        // Fill all days in the month with default values first
        $calendar = [];
        $daysInMonth = (int)date('t', strtotime($startDate));
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $dateStr = sprintf('%04d-%02d-%02d', $year, str_pad($monthNum, 2, '0', STR_PAD_LEFT), str_pad($d, 2, '0', STR_PAD_LEFT));
            $dayOfWeek = date('w', strtotime($dateStr));
            $calendar[$dateStr] = [
                'date' => $dateStr,
                'day_of_week' => $dayOfWeek,
                'day_name' => date('l', strtotime($dateStr)),
                'regular_hours' => 0.0,
                'overtime_hours' => 0.0,
            ];
        }
        // Overwrite with actual timesheet data
        foreach ($timesheets as $timesheet) {
            $date = date('Y-m-d', strtotime($timesheet->date));
            $calendar[$date]['regular_hours'] = $timesheet->hours_worked;
            $calendar[$date]['overtime_hours'] = $timesheet->overtime_hours;
        }

        // Calculate absent days (not Friday, no hours)
        $absentDays = 0;
        $daysInMonth = (int)date('t', strtotime($startDate));
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $dateStr = sprintf('%04d-%02d-%02d', $year, str_pad($monthNum, 2, '0', STR_PAD_LEFT), str_pad($d, 2, '0', STR_PAD_LEFT));
            $day = $calendar[$dateStr];
            if ($day['regular_hours'] == 0 && $day['overtime_hours'] == 0) {
                $absentDays++;
            }
        }
        $totalWorkingDays = $daysInMonth;
        // Calculate absent deduction
        $absentDeduction = 0;
        if ($totalWorkingDays > 0 && $absentDays > 0) {
            $absentDeduction = ($employee->basic_salary / $totalWorkingDays) * $absentDays;
        }
        // Calculate salary details (basic example, adjust as needed)
        $basicSalary = $employee->basic_salary ?? 0;
        $totalAllowances = ($employee->food_allowance ?? 0) + ($employee->housing_allowance ?? 0) + ($employee->transport_allowance ?? 0);
        $overtimePay = $employee->calculateOvertimePay($totalOvertimeHours);
        $advancePayment = $employee->total_advance_balance ?? 0;
        $netSalary = $basicSalary + $totalAllowances + $overtimePay - $absentDeduction - $advancePayment;

        // Add month name
        $monthName = date('F Y', strtotime($startDate));
        // Find assigned location/project/rental for the month
        $assignedLocation = null;
        $assignedProject = null;
        $assignedRental = null;
        foreach ($timesheets as $ts) {
            if (!$assignedLocation && $ts->location) $assignedLocation = $ts->location;
            if (!$assignedProject && $ts->project && $ts->project->name) $assignedProject = $ts->project->name;
            if (!$assignedRental && $ts->rental && $ts->rental->equipment && $ts->rental->equipment->name) $assignedRental = $ts->rental->equipment->name;
            if ($assignedLocation || $assignedProject || $assignedRental) break;
        }
        $displayLocation = $assignedLocation ?? $assignedProject ?? $assignedRental ?? '-';

        // Fetch assignment for this employee for the selected month
        $assignment = \Modules\EmployeeManagement\Domain\Models\EmployeeAssignment::where('employee_id', $employee->id)
            ->where(function($q) use ($startDate, $endDate) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', $startDate);
            })
            ->where('start_date', '<=', $endDate)
            ->orderByDesc('start_date')
            ->first();
        $assignmentType = $assignment->type ?? null;
        $assignmentName = $assignment->name ?? null;
        $assignmentLocation = $assignment->location ?? null;

        return Inertia::render('Timesheets/PaySlip', [
            'employee' => [
                'id' => $employee->id,
                'first_name' => $employee->first_name,
                'last_name' => $employee->last_name,
                'employee_id' => $employee->employee_id,
                'designation' => $employee->designation->name ?? null,
                'hourly_rate' => $employee->hourly_rate,
                'basic_salary' => $employee->basic_salary,
                'food_allowance' => $employee->food_allowance,
                'housing_allowance' => $employee->housing_allowance,
                'transport_allowance' => $employee->transport_allowance,
                'advance_payment' => $employee->total_advance_balance,
            ],
            'month' => str_pad($monthNum, 2, '0', STR_PAD_LEFT),
            'month_name' => $monthName,
            'year' => $year,
            'location' => $displayLocation,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_regular_hours' => $totalRegularHours,
            'total_overtime_hours' => $totalOvertimeHours,
            'total_hours' => $totalHours,
            'days_worked' => $daysWorked,
            'absent_days' => $absentDays,
            'calendar' => $calendar,
            'salary_details' => [
                'basic_salary' => $basicSalary,
                'total_allowances' => $totalAllowances,
                'absent_deduction' => $absentDeduction,
                'overtime_pay' => $overtimePay,
                'advance_payment' => $advancePayment,
                'net_salary' => $netSalary,
            ],
            'assignment_type' => $assignmentType,
            'assignment_name' => $assignmentName,
            'assignment_location' => $assignmentLocation,
        ]);
    }

    /**
     * Create missing timesheets for employees with assignments (same logic as auto-generate but only missing days)
     */
    public function createMissingTimesheets(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $user->hasRole(['admin', 'hr']);

        // Get employee assignments (same as auto-generate)
        $query = \Modules\EmployeeManagement\Domain\Models\EmployeeAssignment::query()->whereNull('deleted_at');

        if (!$isAdmin) {
            if (!$user->employee) {
                return response()->json(['error' => 'No employee record found'], 400);
            }
            $query->where('employee_id', $user->employee->id);
        }

        $assignments = $query->get();
        $created = 0;
        $today = Carbon::today();

        foreach ($assignments as $assignment) {
            $employeeId = $assignment->employee_id;

            if (!$assignment->start_date) {
                continue;
            }

            $start = Carbon::parse($assignment->start_date);
            // Use assignment's end_date if set, otherwise today (never after today)
            $end = $assignment->end_date ? Carbon::parse($assignment->end_date) : $today;
            if ($end->greaterThan($today)) {
                $end = $today;
            }

            // If start is after end, skip
            if ($start->greaterThan($end)) {
                continue;
            }

            $period = new \DatePeriod(
                new \DateTime($start->toDateString()),
                new \DateInterval('P1D'),
                (new \DateTime($end->toDateString()))->modify('+1 day')
            );

            foreach ($period as $date) {
                $dateStr = $date->format('Y-m-d');

                if (Carbon::parse($dateStr)->greaterThan($today)) {
                    continue;
                }

                // Check for existing timesheet (same logic as auto-generate)
                $projectId = $assignment->type === 'project' ? $assignment->project_id : null;
                $rentalId = $assignment->type === 'rental' ? $assignment->rental_id : null;

                $overlap = Timesheet::where('employee_id', $employeeId)
                    ->whereDate('date', $dateStr);

                if ($projectId !== null) {
                    $overlap->where('project_id', $projectId);
                }
                if ($rentalId !== null) {
                    $overlap->where('rental_id', $rentalId);
                }

                if ($overlap->exists()) {
                    continue; // Skip if timesheet already exists
                }

                // Create missing timesheet with 0 hours (draft status)
                $data = [
                    'employee_id' => $employeeId,
                    'date' => $dateStr,
                    'status' => Timesheet::STATUS_DRAFT,
                    'hours_worked' => 0,
                    'overtime_hours' => 0,
                    'start_time' => '08:00',
                    'end_time' => null,
                ];

                // Add project or rental assignment
                if ($assignment->type === 'project' && $assignment->project_id) {
                    $data['project_id'] = $assignment->project_id;
                }
                if ($assignment->type === 'rental' && $assignment->rental_id) {
                    $data['rental_id'] = $assignment->rental_id;
                }

                Timesheet::create($data);
                $created++;
            }
        }

        return response()->json(['success' => true, 'created' => $created, 'message' => "Created {$created} missing timesheets for assigned employees"]);
    }

    /**
     * Bulk update timesheets (web route version, for Edit page Bulk Mode).
     */
    public function updateBulk(Request $request)
    {
        $user = auth()->user();
        if (!$user || !$user->can('timesheets.edit')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $updates = $request->input('updates', []);
        if (!is_array($updates) || empty($updates)) {
            return response()->json(['error' => 'No updates provided'], 400);
        }
        $updated = 0;
        $errors = [];
        foreach ($updates as $update) {
            $id = $update['id'] ?? null;
            $date = $update['date'] ?? null;
            if (!$id || !$date) continue;
            $timesheet = \Modules\TimesheetManagement\Domain\Models\Timesheet::where('employee_id', $update['employee_id'])->where('date', $date)->first();
            if (!$timesheet) {
                $errors[$date] = 'Timesheet not found for date ' . $date;
                continue;
            }
            // Validate fields (reuse update validation)
            $validator = \Validator::make($update, [
                'hours_worked' => 'required|numeric|min:0|max:24',
                'overtime_hours' => 'nullable|numeric|min:0|max:24',
                'project_id' => 'nullable|exists:projects,id',
                'rental_id' => 'nullable|exists:rentals,id',
                'description' => 'nullable|string|max:1000',
            ]);
            if ($validator->fails()) {
                $errors["hours_worked_{$date}"] = $validator->errors()->first('hours_worked');
                $errors["overtime_hours_{$date}"] = $validator->errors()->first('overtime_hours');
                continue;
            }
            $timesheet->hours_worked = $update['hours_worked'];
            $timesheet->overtime_hours = $update['overtime_hours'] ?? 0;
            $timesheet->project_id = $update['project_id'] ?? null;
            $timesheet->rental_id = $update['rental_id'] ?? null;
            $timesheet->description = $update['description'] ?? null;
            $timesheet->save();
            $updated++;
        }
        if (!empty($errors)) {
            return response()->json(['success' => false, 'error' => 'Some timesheets failed to update', 'errors' => $errors, 'updated' => $updated]);
        }
        return response()->json(['success' => true, 'updated' => $updated]);
    }

    /**
     * Trigger the auto-generation of timesheets via API.
     */
    public function autoGenerate(Request $request)
    {
        try {
            Artisan::call('timesheets:auto-generate');
            return response()->json(['success' => true, 'message' => 'Auto-generated timesheets successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to auto-generate timesheets: ' . $e->getMessage()], 500);
        }
    }
}




