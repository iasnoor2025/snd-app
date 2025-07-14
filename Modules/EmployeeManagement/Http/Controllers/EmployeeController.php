<?php

namespace Modules\EmployeeManagement\Http\Controllers;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Illuminate\Http\Request;
use Modules\EmployeeManagement\Http\Requests\UpdateEmployeeRequest;
use Inertia\Inertia;
use Carbon\Carbon;
use Modules\EmployeeManagement\Services\EmployeeService;
use Modules\Core\Services\DocumentService;
use Modules\EmployeeManagement\Domain\Models\Designation;
use Modules\EmployeeManagement\Domain\Models\Department;
use Modules\EmployeeManagement\Actions\CreateEmployeeAction;
use Modules\EmployeeManagement\Actions\UpdateEmployeeAction;
use Modules\EmployeeManagement\Actions\DeleteEmployeeAction;
use Modules\EmployeeManagement\Actions\ShowEmployeeAction;
use Illuminate\Support\Facades\Log;
use Modules\Core\Domain\Models\User;

class EmployeeController extends Controller
{
    protected $employeeService;
    protected $documentService;
    protected $createEmployeeAction;
    protected $updateEmployeeAction;
    protected $deleteEmployeeAction;

    public function __construct(
        EmployeeService $employeeService,
        DocumentService $documentService,
        CreateEmployeeAction $createEmployeeAction,
        UpdateEmployeeAction $updateEmployeeAction,
        DeleteEmployeeAction $deleteEmployeeAction
    ) {
        $this->employeeService = $employeeService;
        $this->documentService = $documentService;
        $this->createEmployeeAction = $createEmployeeAction;
        $this->updateEmployeeAction = $updateEmployeeAction;
        $this->deleteEmployeeAction = $deleteEmployeeAction;

        $this->middleware('permission:employees.view')->only(['index', 'show']);
        $this->middleware('permission:employees.create')->only(['create', 'store']);
        $this->middleware('permission:employees.edit')->only(['edit', 'update']);
        $this->middleware('permission:employees.delete')->only('destroy');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Debug log for status filter
        \Log::info('EmployeeController@index status filter', [
            'status_param' => $request->status,
        ]);
        $query = Employee::query()
            ->with(['designation', 'department'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('employee_id', 'like', "%{$search}%")
                        ->orWhere('file_number', 'like', "%{$search}%");
                });
            })
            ->when($request->status && $request->status !== 'all', function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->when($request->department && $request->department !== 'all' && is_numeric($request->department), function ($query) use ($request) {
                $query->where('department_id', (int) $request->department);
            })
            ->when($request->designation && $request->designation !== 'all' && is_numeric($request->designation), function ($query) use ($request) {
                $query->where('designation_id', (int) $request->designation);
            })
            ->orderByRaw("LPAD(REGEXP_REPLACE(file_number, '\\D', '', 'g'), 10, '0') ASC");

        // Debug log for filtered employee count
        \Log::info('EmployeeController@index filtered employee count', [
            'count' => $query->count(),
            'status_param' => $request->status,
        ]);

        $employees = $query->paginate($request->per_page ?? 15)
            ->withQueryString();

        // Add current_balance to each employee (force model for accessor)
        $employeesWithBalance = collect($employees->items())->map(function ($employee) {
            if (is_array($employee)) {
                $model = Employee::find($employee['id']);
                $employee['current_balance'] = $model ? $model->total_advance_balance : 0;
                return $employee;
            } elseif ($employee instanceof Employee) {
                $employee->current_balance = $employee->total_advance_balance;
                return $employee;
            } else {
                return $employee;
            }
        });

        // Debug logging for pagination
        // Log::info('Employee pagination debug', [
        //     'total_count' => $query->count(),
        //     'per_page' => $request->per_page ?? 15,
        //     'current_page' => $employees->currentPage(),
        //     'last_page' => $employees->lastPage(),
        //     'total' => $employees->total(),
        //     'data_count' => $employees->count(),
        //     'request_params' => $request->all(),
        // ]);

        return Inertia::render('Employees/Index', [
            'employees' => [
                'data' => $employeesWithBalance->values()->all(),
                'meta' => [
                    'current_page' => $employees->currentPage(),
                    'from' => $employees->firstItem(),
                    'last_page' => $employees->lastPage(),
                    'per_page' => $employees->perPage(),
                    'to' => $employees->lastItem(),
                    'total' => $employees->total(),
                ],
                'links' => [
                    'first' => $employees->url(1),
                    'last' => $employees->url($employees->lastPage()),
                    'prev' => $employees->previousPageUrl(),
                    'next' => $employees->nextPageUrl(),
                ]
            ],
            'filters' => $request->only(['search', 'status', 'department', 'designation']),
            'departments' => Department::orderBy('name')->get(['id', 'name']),
            'designations' => Designation::orderBy('name')->get(['id', 'name']),
            'auth' => [
                'user' => auth()->user() ? [
                    'id' => auth()->id(),
                    'name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                    'roles' => auth()->user()->getRoleNames(),
                    'permissions' => auth()->user()->getAllPermissions()->pluck('name'),
                ] : null,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Employees/Create', [
            'departments' => Department::orderBy('name')->get(['id', 'name']),
            'designations' => Designation::orderBy('name')->get(['id', 'name']),
            'users' => \Modules\Core\Domain\Models\User::orderBy('name')->get(['id', 'name'])
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $employee = $this->createEmployeeAction->execute($request->all());

            return redirect()->route('employees.index')->with('success', 'Employee created successfully.');
        } catch (\Exception $e) {
            Log::error('Error creating employee', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->withInput()->with('error', 'Failed to create employee: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Employee $employee, Request $request, ShowEmployeeAction $showEmployeeAction)
    {
        $this->authorize('view', $employee);

        $employee->refresh(); // Always reload from DB to get latest assignments

        $data = $showEmployeeAction->execute($employee, $request->input('month'));

        return Inertia::render('Employees/Show', $data);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Employee $employee)
    {
        $this->authorize('update', $employee);

        // Eager load all necessary relations
        $employeeData = $employee->load(['designation', 'department', 'user']);

        // Map related IDs and flatten nested fields for frontend compatibility
        $employeeArray = $employeeData->toArray();
        $employeeArray['department_id'] = $employeeData->department ? $employeeData->department->id : null;
        $employeeArray['designation_id'] = $employeeData->designation ? $employeeData->designation->id : null;
        $employeeArray['user_id'] = $employeeData->user ? $employeeData->user->id : null;
        $employeeArray['email'] = $employeeData->user ? $employeeData->user->email : $employeeData->email;
        $employeeArray['nationality'] = $employeeData->nationality ?? '';
        $employeeArray['date_of_birth'] = $employeeData->date_of_birth ? (is_object($employeeData->date_of_birth) ? $employeeData->date_of_birth->format('Y-m-d') : $employeeData->date_of_birth) : '';
        $employeeArray['hire_date'] = $employeeData->hire_date ? (is_object($employeeData->hire_date) ? $employeeData->hire_date->format('Y-m-d') : $employeeData->hire_date) : '';

        // Supervisor: handle legacy name or user_id
        $supervisorId = '';
        $supervisorName = '';
        if (is_numeric($employeeData->supervisor) && $employeeData->supervisor > 0) {
            $supervisorId = (string)$employeeData->supervisor;
            $supervisorUser = \Modules\Core\Domain\Models\User::find($supervisorId);
            $supervisorName = $supervisorUser ? $supervisorUser->name : '';
        } elseif (!empty($employeeData->supervisor)) {
            $supervisorUser = \Modules\Core\Domain\Models\User::where('name', $employeeData->supervisor)->first();
            if ($supervisorUser) {
                $supervisorId = (string)$supervisorUser->id;
                $supervisorName = $supervisorUser->name;
            } else {
                $supervisorName = $employeeData->supervisor;
            }
        }
        $employeeArray['supervisor'] = $supervisorId;
        $employeeArray['supervisor_name'] = $supervisorName;

        // Position: send both id and object (with name)
        $employeeArray['designation_id'] = $employeeData->designation ? (string)$employeeData->designation->id : ($employeeData->designation_id ? (string)$employeeData->designation_id : '');
        $employeeArray['designation'] = $employeeData->designation ? [
            'id' => $employeeData->designation->id,
            'name' => is_array($employeeData->designation->name) ? $employeeData->designation->name : (string)$employeeData->designation->name,
        ] : null;

        // Map license/certification fields as objects for frontend
        $employeeArray['driving_license'] = [
            'number' => $employeeData->driving_license_number ?? '',
            'expiry_date' => $employeeData->driving_license_expiry ? $employeeData->driving_license_expiry->format('Y-m-d') : '',
            'cost' => $employeeData->driving_license_cost ?? 0,
        ];
        $employeeArray['operator_license'] = [
            'number' => $employeeData->operator_license_number ?? '',
            'expiry_date' => $employeeData->operator_license_expiry ? $employeeData->operator_license_expiry->format('Y-m-d') : '',
            'cost' => $employeeData->operator_license_cost ?? 0,
        ];
        $employeeArray['tuv_certification'] = [
            'number' => $employeeData->tuv_certification_number ?? '',
            'expiry_date' => $employeeData->tuv_certification_expiry ? $employeeData->tuv_certification_expiry->format('Y-m-d') : '',
            'cost' => $employeeData->tuv_certification_cost ?? 0,
        ];
        $employeeArray['spsp_license'] = [
            'number' => $employeeData->spsp_license_number ?? '',
            'expiry_date' => $employeeData->spsp_license_expiry ? $employeeData->spsp_license_expiry->format('Y-m-d') : '',
            'cost' => $employeeData->spsp_license_cost ?? 0,
        ];

        // Ensure all nulls are converted to empty strings or 0 for frontend
        foreach ($employeeArray as $key => $value) {
            if ($value === null) {
                $employeeArray[$key] = is_numeric($value) ? 0 : '';
            }
        }

        // Get all users for the dropdown
        $users = User::orderBy('name')->get(['id', 'name']);
        // Ensure supervisor user is included
        if ($supervisorId && !$users->pluck('id')->contains($supervisorId)) {
            if (!empty($supervisorName)) {
                $users->push((object)['id' => $supervisorId, 'name' => $supervisorName]);
            }
        }
        $users = $users->values()->all();

        return Inertia::render('Employees/Create', [
            'employee' => $employeeArray,
            'departments' => Department::orderBy('name')->get(['id', 'name']),
            'designations' => Designation::orderBy('name')->get(['id', 'name']),
            'users' => $users,
            'isEditing' => true
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEmployeeRequest $request, Employee $employee)
    {
        $this->authorize('update', $employee);

        try {
            Log::info('Employee update request received', [
                'employee_id' => $employee->id,
                'request_data' => $request->all(),
                'is_ajax' => $request->ajax(),
                'wants_json' => $request->wantsJson(),
            ]);

            $updatedEmployee = $this->updateEmployeeAction->execute($employee, $request->all());

            // Handle AJAX/JSON requests (from Inertia)
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Employee updated successfully',
                    'employee' => $updatedEmployee,
                ], 200);
            }

            // Handle regular form submissions
            return redirect()->route('employees.index')->with('success', 'Employee updated successfully.');
        } catch (\Exception $e) {
            Log::error('Error updating employee', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
            ]);

            // Handle AJAX/JSON requests
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update employee: ' . $e->getMessage(),
                    'errors' => ['error' => $e->getMessage()]
                ], 422);
            }

            // Handle regular form submissions
            return redirect()->back()->withInput()->with('error', 'Failed to update employee: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $employee)
    {
        $this->authorize('delete', $employee);

        try {
            $this->deleteEmployeeAction->execute($employee);

            return redirect()->route('employees.index')->with('success', 'Employee deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Error deleting employee', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->with('error', 'Failed to delete employee: ' . $e->getMessage());
        }
    }

    /**
     * Generate payslip for the employee.
     */
    public function generatePaySlip(Employee $employee, Request $request)
    {
        $this->authorize('view', $employee);

        try {
            $result = $this->employeeService->generatePaySlip($employee, $request->all());
            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Error generating payslip', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * Upload a document for an employee
     */
    public function uploadDocument(Request $request, Employee $employee)
    {
        $this->authorize('update', $employee);

        Log::info('Document upload started', ['employee_id' => $employee->id]);

        $request->validate([
            'document' => 'required|file|max:10240', // 10MB max
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:passport,iqama,driving_license,operator_license,tuv_certification,spsp_license,other',
            'expiry_date' => 'nullable|date',
        ]);

        try {
            if (!$request->hasFile('document')) {
                Log::error('No document file in request', ['employee_id' => $employee->id]);
                return response()->json(['success' => false, 'message' => 'No document file found'], 400);
            }

            $media = $this->documentService->uploadEmployeeDocument(
                $employee,
                $request->file('document'),
                $request->name,
                $request->type,
                $request->expiry_date
            );

            return response()->json([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'document' => [
                    'id' => $media->id,
                    'name' => $media->name,
                    'file_name' => $media->file_name,
                    'mime_type' => $media->mime_type,
                    'size' => $media->size,
                    'url' => $media->getUrl(),
                    'custom_properties' => $media->custom_properties,
                    'created_at' => $media->created_at?->format('Y-m-d H:i:s')->format('Y-m-d H:i:s'),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error uploading document', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error uploading document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update employee access restrictions
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Modules\EmployeeManagement\Domain\Models\Employee  $employee
     * @return \Illuminate\Http\Response;
     */
    public function updateAccessRestrictions(Request $request, Employee $employee)
    {
        $this->authorize('update', $employee);

        $validated = $request->validate([
            'restriction_type' => 'required|in:none,date_range,until_date',
            'access_start_date' => 'nullable|required_if:restriction_type,date_range|date',
            'access_end_date' => 'nullable|required_if:restriction_type,date_range|date|after_or_equal:access_start_date',
            'access_restricted_until' => 'nullable|required_if:restriction_type,until_date|date',
            'access_restriction_reason' => 'nullable|string|max:255',
        ]);

        // Update employee access restrictions based on restriction type
        if ($validated['restriction_type'] === 'none') {
            $employee->update([
                'access_start_date' => null,
                'access_end_date' => null,
                'access_restricted_until' => null,
                'access_restriction_reason' => null,
            ]);
        } elseif ($validated['restriction_type'] === 'date_range') {
            $employee->update([
                'access_start_date' => $validated['access_start_date'],
                'access_end_date' => $validated['access_end_date'],
                'access_restricted_until' => null,
                'access_restriction_reason' => $validated['access_restriction_reason'] ?? null
            ]);
        } elseif ($validated['restriction_type'] === 'until_date') {
            $employee->update([
                'access_start_date' => null,
                'access_end_date' => null,
                'access_restricted_until' => $validated['access_restricted_until'],
                'access_restriction_reason' => $validated['access_restriction_reason'] ?? null
            ]);
        }

        // Clear the access cache for this employee's user
        if ($employee->user_id) {
            \Illuminate\Support\Facades\Cache::forget('employee_access_' . $employee->user_id);
        }

        return redirect()->back()->with('success', 'Employee access restrictions updated successfully.');
    }

    /**
     * Directly assign a manual assignment to an employee (no API, for admin use)
     */
    public function assignManualAssignment(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'status' => 'required|string|max:50',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'assigned_by' => 'nullable|integer|exists:users,id',
            'project_id' => 'nullable|integer|exists:projects,id',
            'rental_id' => 'nullable|integer|exists:rentals,id',
        ]);

        $assignment = new \Modules\EmployeeManagement\Domain\Models\EmployeeAssignment($validated);
        $assignment->employee_id = $employee->id;
        // Always ensure current assignment has end_date = null and status = 'active'
        $assignment->end_date = null;
        $assignment->status = 'active';
        $assignment->save();

        return redirect()->back()->with('success', 'Manual assignment created successfully.');
    }

    /**
     * Show the form for editing an assignment for an employee.
     */
    public function editAssignment(Employee $employee, $assignmentId)
    {
        $assignment = $employee->assignments()->findOrFail($assignmentId);
        // For now, just return a stub Inertia page with assignment and employee
        return inertia('Employees/EditAssignment', [
            'employee' => $employee,
            'assignment' => $assignment,
        ]);
    }

    /**
     * Delete an assignment for an employee.
     */
    public function destroyAssignment(Employee $employee, $assignmentId)
    {
        $assignment = $employee->assignments()->findOrFail($assignmentId);
        $assignment->delete();
        return redirect()->back()->with('success', 'Assignment deleted successfully.');
    }

    /**
     * Update an existing assignment for an employee (web route).
     */
    public function updateAssignment(Request $request, $employeeId, $assignmentId)
    {
        $employee = \Modules\EmployeeManagement\Domain\Models\Employee::findOrFail($employeeId);
        $assignment = $employee->assignments()->where('id', $assignmentId)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $assignment->update($validated);
        // Always ensure current assignment has end_date = null and status = 'active'
        $assignment->end_date = null;
        $assignment->status = 'active';
        $assignment->save();

        // If Inertia or API, return JSON; otherwise, redirect back
        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'assignment' => $assignment->fresh()]);
        }
        return redirect()->back()->with('success', 'Assignment updated successfully.');
    }

    /**
     * Sync all employees to ERPNext (admin only)
     */
    public function syncToERPNext(Request $request)
    {
        if (!auth()->user() || auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        try {
            $count = $this->employeeService->syncAllToERPNext();
            return response()->json(['success' => true, 'message' => "Synced $count employees to ERPNext."]);
        } catch (\Exception $e) {
            \Log::error('Error syncing employees to ERPNext', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to sync employees: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Sync all employees from ERPNext (admin only)
     */
    public function syncFromERPNext(Request $request)
    {
        \Log::info('syncFromERPNext called', [
            'user_id' => auth()->id(),
            'user_roles' => auth()->user() ? auth()->user()->roles : null
        ]);
        if (!auth()->user() || !auth()->user()->roles || !in_array('admin', auth()->user()->roles->pluck('name')->toArray())) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        try {
            \Modules\EmployeeManagement\Jobs\SyncEmployeesFromERPNextJob::dispatch();
            return response()->json(['success' => true, 'message' => 'Employee sync from ERPNext has started and will run in the background.']);
        } catch (\Exception $e) {
            \Log::error('Error dispatching ERPNext employee sync job', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to start sync from ERPNext: ' . $e->getMessage()], 500);
        }
    }
}




