<?php

namespace Modules\EmployeeManagement\Http\Controllers;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Illuminate\Http\Request;
use Modules\EmployeeManagement\Http\Requests\UpdateEmployeeRequest;
use Inertia\Inertia;
use Carbon\Carbon;
use Modules\EmployeeManagement\Services\EmployeeService;
use Modules\Core\Services\DocumentService;
use Modules\EmployeeManagement\Domain\Models\Position;
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
        $query = Employee::query()
            ->with(['position', 'department'])
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
            ->when($request->position && $request->position !== 'all' && is_numeric($request->position), function ($query) use ($request) {
                $query->where('position_id', (int) $request->position);
            })
            ->orderBy('first_name')
            ->orderBy('last_name');

        $employees = $query->paginate($request->per_page ?? 15)
            ->withQueryString();

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
                'data' => $employees->items(),
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
            'filters' => $request->only(['search', 'status', 'department', 'position']),
            'departments' => Department::orderBy('name')->get(['id', 'name']),
            'positions' => Position::orderBy('name')->get(['id', 'name']),
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
            'positions' => Position::orderBy('name')->get(['id', 'name']),
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

        $data = $showEmployeeAction->execute($employee, $request->input('month'));

        return Inertia::render('Employees/Show', $data);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Employee $employee)
    {
        $this->authorize('update', $employee);

        // Prepare the employee data with only standard relations loaded
        $employeeData = $employee->load(['position', 'department']);

        // Add documents and certificates collections manually
        $employeeData->setAttribute('media', $employee->media);

        return Inertia::render('Employees/Create', [
            'employee' => $employeeData,
            'departments' => Department::orderBy('name')->get(['id', 'name']),
            'positions' => Position::orderBy('name')->get(['id', 'name']),
            'users' => User::orderBy('name')->get(['id', 'name']),
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
}




