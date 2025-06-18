<?php
namespace Modules\EmployeeManagement\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\Core\Domain\Models\User;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Modules\EmployeeManagement\Domain\Models\Position;
use Illuminate\Support\Facades\DB;

class EmployeeCreateController extends Controller
{
    /**
     * Show the form for creating a new employee.
     */
    public function create()
    {
        $users = \Modules\Core\Domain\Models\User::all();
        $positions = Position::where('is_active', true)
            ->select('id', 'name', 'description', 'is_active')
            ->orderBy('name')
            ->get();

        return Inertia::render('Employees/Create', [
            'users' => $users,
            'positions' => $positions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            \Log::info('Employee create request received', [
                'request_data' => $request->all(),
                'has_files' => $request->hasFile('passport_file') ||
                    $request->hasFile('iqama_file') ||
                    $request->hasFile('driving_license_file') ||
                    $request->hasFile('operator_license_file') ||
                    $request->hasFile('tuv_certification_file') ||
                    $request->hasFile('spsp_license_file'),
                'file_keys' => array_keys($request->allFiles()),
                'method' => $request->method(),
                'content_type' => $request->header('Content-Type'),
            ]);

            // Validate request
            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'file_number' => 'required|string|max:50|unique:employees',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:255',
                'nationality' => 'required|string|max:100',
                'position_id' => 'required|exists:positions,id',
                'hourly_rate' => 'required|numeric|min:0',
                'basic_salary' => 'required|numeric|min:0',
                'food_allowance' => 'nullable|numeric|min:0',
                'housing_allowance' => 'nullable|numeric|min:0',
                'transport_allowance' => 'nullable|numeric|min:0',
                'absent_deduction_rate' => 'nullable|numeric|min:0',
                'advance_payment' => 'nullable|numeric|min:0',
                'overtime_rate_multiplier' => 'nullable|numeric|min:0',
                'bank_name' => 'nullable|string|max:255',
                'bank_account_number' => 'nullable|string|max:255',
                'bank_iban' => 'nullable|string|max:255',
                'contract_hours_per_day' => 'nullable|integer|min:1',
                'contract_days_per_month' => 'nullable|integer|min:1',
                'hire_date' => 'required|date',
                'status' => 'required|in:active,inactive,on_leave',
                'emergency_contact_name' => 'nullable|string|max:255',
                'emergency_contact_phone' => 'nullable|string|max:20',
                'notes' => 'nullable|string',
                'role' => 'required|in:admin,manager,foreman,workshop,employee',
                // Legal Documents
                'passport_number' => 'nullable|string|max:50',
                'passport_expiry' => 'nullable|date',
                'iqama_number' => ['nullable', 'string', 'max:10', 'regex:/^\d+$/'],
                'iqama_expiry' => 'nullable|date',
                'iqama_cost' => 'nullable|numeric|min:0',
                'driving_license_number' => 'nullable|string|max:50',
                'driving_license_expiry' => 'nullable|date',
                'driving_license_cost' => 'nullable|numeric|min:0',
                'operator_license_number' => 'nullable|string|max:50',
                'operator_license_expiry' => 'nullable|date',
                'operator_license_cost' => 'nullable|numeric|min:0',
                'tuv_certification_number' => 'nullable|string|max:50',
                'tuv_certification_expiry' => 'nullable|date',
                'tuv_certification_cost' => 'nullable|numeric|min:0',
                'spsp_license_number' => 'nullable|string|max:50',
                'spsp_license_expiry' => 'nullable|date',
                'spsp_license_cost' => 'nullable|numeric|min:0',
                // File validations
                'passport_file' => 'nullable|file|max:10240',
                'iqama_file' => 'nullable|file|max:10240',
                'driving_license_file' => 'nullable|file|max:10240',
                'operator_license_file' => 'nullable|file|max:10240',
                'tuv_certification_file' => 'nullable|file|max:10240',
                'spsp_license_file' => 'nullable|file|max:10240',
                'custom_certifications' => 'nullable|string',
            ]);

            \Log::info('Request validated successfully', ['validated_data' => $validated]);

            // Create user account
            $user = User::create([
                'name' => $request->first_name . ' ' . $request->last_name,
                'email' => $request->email,
                'password' => Hash::make(Str::random(10)),
                'role' => $request->role,
            ]);

            \Log::info('User created successfully', ['user_id' => $user->id]);

            // Generate unique employee_id
            $employeeId = 'EMP-' . date('Y') . '-' . str_pad(Employee::count() + 1, 4, '0', STR_PAD_LEFT);

            // Set driving license number equal to iqama number
            $request->merge(['driving_license_number' => $request->iqama_number]);

            // Create employee record
            try {
                // Wrap in an explicit transaction
                $employee = DB::transaction(function() use ($user, $employeeId, $request) {
                    // Add email to employee data - this is critical!
            $employeeData = [
                'user_id' => $user->id,
                'employee_id' => $employeeId,
                'file_number' => $request->file_number,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                        'email' => $request->email, // Email is required
                'phone' => $request->phone,
                'address' => $request->address ?? '',
                'city' => $request->city ?? '',
                'nationality' => $request->nationality,
                'position_id' => $request->position_id,
                'hourly_rate' => $request->hourly_rate,
                'basic_salary' => $request->basic_salary,
                'food_allowance' => $request->food_allowance ?? 0,
                'housing_allowance' => $request->housing_allowance ?? 0,
                'transport_allowance' => $request->transport_allowance ?? 0,
                'absent_deduction_rate' => $request->absent_deduction_rate ?? 0,
                'advance_payment' => $request->advance_payment ?? 0,
                'overtime_rate_multiplier' => $request->overtime_rate_multiplier ?? 1.5,
                'bank_name' => $request->bank_name ?? '',
                'bank_account_number' => $request->bank_account_number ?? '',
                'bank_iban' => $request->bank_iban ?? '',
                'contract_hours_per_day' => $request->contract_hours_per_day ?? 8,
                'contract_days_per_month' => $request->contract_days_per_month ?? 22,
                'hire_date' => $request->hire_date ? date('Y-m-d', strtotime($request->hire_date)) : date('Y-m-d'),
                'status' => $request->status,
                'emergency_contact_name' => $request->emergency_contact_name ?? '',
                'emergency_contact_phone' => $request->emergency_contact_phone ?? '',
                'notes' => $request->notes ?? '',
                // Legal Documents
                'passport_number' => $request->passport_number ?? '',
                'passport_expiry' => $request->passport_expiry ? date('Y-m-d', strtotime($request->passport_expiry)) : null,
                'iqama_number' => $request->iqama_number ?? '',
                'iqama_expiry' => $request->iqama_expiry ? date('Y-m-d', strtotime($request->iqama_expiry)) : null,
                'iqama_cost' => $request->iqama_cost ?? 0,
                'driving_license_number' => $request->iqama_number ?? '', // Set equal to iqama number
                'driving_license_expiry' => $request->driving_license_expiry ? date('Y-m-d', strtotime($request->driving_license_expiry)) : null,
                'driving_license_cost' => $request->driving_license_cost ?? 0,
                'operator_license_number' => $request->operator_license_number ?? '',
                'operator_license_expiry' => $request->operator_license_expiry ? date('Y-m-d', strtotime($request->operator_license_expiry)) : null,
                'operator_license_cost' => $request->operator_license_cost ?? 0,
                'tuv_certification_number' => $request->tuv_certification_number ?? '',
                'tuv_certification_expiry' => $request->tuv_certification_expiry ? date('Y-m-d', strtotime($request->tuv_certification_expiry)) : null,
                'tuv_certification_cost' => $request->tuv_certification_cost ?? 0,
                'spsp_license_number' => $request->spsp_license_number ?? '',
                'spsp_license_expiry' => $request->spsp_license_expiry ? date('Y-m-d', strtotime($request->spsp_license_expiry)) : null,
                'spsp_license_cost' => $request->spsp_license_cost ?? 0,
                        'date_of_birth' => $request->date_of_birth ? date('Y-m-d', strtotime($request->date_of_birth)) : null,
                        'created_at' => now(),
                        'updated_at' => now(),
            ];

                    \Log::info('Creating employee with transaction - data prepared', ['employeeData' => $employeeData]);

                    // Force direct insert with query builder and NO ELOQUENT
                    try {
                        // Get the database schema for the employees table to check required columns
                        $tableColumns = \DB::getSchemaBuilder()->getColumnListing('employees');
                        \Log::info('Employee table columns', ['columns' => $tableColumns]);

                        // Remove any potential null values that would violate NOT NULL constraints
                        $employeeData = array_filter($employeeData, function ($value) {
                            return $value !== null;
                        });

                        // Ensure all required columns have values
                        $requiredColumns = ['user_id', 'first_name', 'last_name', 'email', 'file_number',
                                           'nationality', 'position_id', 'date_of_birth'];

                        foreach ($requiredColumns as $column) {
                            if (empty($employeeData[$column])) {
                                \Log::error("Required column '{$column}' is missing or empty");
                                throw new \Exception("Required column '{$column}' is missing or empty");
                            }
                        }

                        // Insert using raw query to bypass Eloquent completely
                        $id = \DB::table('employees')->insertGetId($employeeData);
                        \Log::info('Employee inserted with direct DB query', ['id' => $id]);

                        // Then retrieve the created employee to verify it exists
                        $rawEmployee = \DB::table('employees')->where('id', $id)->first();

                        if (!$rawEmployee) {
                            \Log::error('Created employee not found after insert', ['id' => $id]);
                            throw new \Exception('Employee was inserted but could not be retrieved');
                        }

                        \Log::info('Raw employee data retrieved', [
                            'id' => $id,
                            'employee' => $rawEmployee
                        ]);

                        // Convert to model instance
                        $createdEmployee = \Modules\EmployeeManagement\Domain\Models\Employee::find($id);
                        \Log::info('Employee model retrieved from database', [
                            'id' => $id,
                            'found' => $createdEmployee ? true : false
                        ]);

                        if (!$createdEmployee) {
                            // Something is wrong with the model retrieval - try to manually create
                            $createdEmployee = new \Modules\EmployeeManagement\Domain\Models\Employee();
                            $createdEmployee->setRawAttributes((array)$rawEmployee);
                            $createdEmployee->exists = true;

                            \Log::info('Created employee model manually', [
                                'id' => $id
                            ]);
                        }

                        return $createdEmployee;
                    } catch (\PDOException $e) {
                        \Log::error('Database error during insert', [
                            'error' => $e->getMessage(),
                            'code' => $e->getCode(),
                            'trace' => $e->getTraceAsString()
                        ]);

                        if ($e->getCode() == 23000) {
                            // Duplicate key
                            throw new \Exception('An employee with this file number or email already exists.');
                        } else if ($e->getCode() == 23502) {
                            // Not null constraint
                            throw new \Exception('Required fields are missing: ' . $e->getMessage());
                        } else {
                            throw $e;
                        }
                    } catch (\Exception $e) {
                        \Log::error('Direct DB insert failed', [
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                        throw $e;
                    }
                }, 5); // 5 retries
            } catch (\Exception $e) {
                \Log::error('Error in employee creation', [
                    'error' => $e->getMessage(),
                    'line' => $e->getLine(),
                    'file' => $e->getFile()
                ]);
                throw $e;
            }

            \Log::info('Employee created successfully', ['employee_id' => $employee->id]);

            return response()->json([
                'success' => true,
                'message' => 'Employee created successfully',
                'employee' => $employee,
                'redirect' => route('employees.index'),
            ], 201)->header('X-Inertia-Location', route('employees.index'));
        } catch (\Exception $e) {
            \Log::error('Error creating employee', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            // Check if it's a database error
            if (str_contains($e->getMessage(), '23502')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Required fields are missing. Please check all required fields and try again.',
                    'errors' => ['error' => 'Required fields are missing']
                ], 422);
            }

            // For other errors
            return response()->json([
                'success' => false,
                'message' => 'Failed to create employee: ' . $e->getMessage(),
                'errors' => ['error' => $e->getMessage()]
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Employee $employee)
    {
        $employee->load('user');

        $users = \Modules\Core\Domain\Models\User::all();
        $positions = Position::where('is_active', true)->pluck('name')->toArray();

        return Inertia::render('Employees/Edit', [
            'employee' => $employee,
            'users' => $users,
            'positions' => $positions,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Employee $employee)
    {
        try {
            \Log::info('Employee update request received', [
                'employee_id' => $employee->id,
                'request_params' => $request->except(['passport_file', 'iqama_file', 'driving_license_file', 'operator_license_file', 'tuv_certification_file', 'spsp_license_file']),
                'has_data_field' => $request->has('data'),
            ]);

            // Check if we're receiving data as JSON in the "data" field (FormData approach)
            $formData = $request->all();
            if ($request->has('data')) {
                $jsonData = json_decode($request->data, true);
                if (is_array($jsonData)) {
                    // Merge JSON data with other request items (files will still be accessed directly)
                    $formData = array_merge($formData, $jsonData);
                    // Create a new request with the merged data
                    $request = new Request($formData);
                }
            }

            $rules = [
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => [
                    'required',
                    'string',
                    'email',
                    'max:255',
                    Rule::unique('users')->ignore($employee->user_id),
                ],
                'file_number' => 'nullable|string|max:50',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:255',
                'nationality' => 'required|string|max:100',
                'position_id' => 'required|exists:positions,id',
                'hourly_rate' => 'required|numeric|min:0',
                'basic_salary' => 'required|numeric|min:0',
                'food_allowance' => 'nullable|numeric|min:0',
                'housing_allowance' => 'nullable|numeric|min:0',
                'transport_allowance' => 'nullable|numeric|min:0',
                'absent_deduction_rate' => 'nullable|numeric|min:0',
                'advance_payment' => 'nullable|numeric|min:0',
                'overtime_rate_multiplier' => 'nullable|numeric|min:0',
                'bank_name' => 'nullable|string|max:255',
                'bank_account_number' => 'nullable|string|max:255',
                'bank_iban' => 'nullable|string|max:255',
                'contract_hours_per_day' => 'nullable|integer|min:1',
                'contract_days_per_month' => 'nullable|integer|min:1',
                'hire_date' => 'required|date',
                'status' => 'required|in:active,inactive,on_leave',
                'emergency_contact_name' => 'nullable|string|max:255',
                'emergency_contact_phone' => 'nullable|string|max:20',
                'notes' => 'nullable|string',
                'role' => 'required|in:admin,manager,foreman,workshop,employee',
                // Legal Documents
                'passport_number' => 'nullable|string|max:50',
                'passport_expiry' => 'nullable|date',
                'iqama_number' => ['nullable', 'string', 'max:10', 'regex:/^\d+$/'],
                'iqama_expiry' => 'nullable|date',
                'iqama_cost' => 'nullable|numeric|min:0',
                'driving_license_number' => 'nullable|string|max:50',
                'driving_license_expiry' => 'nullable|date',
                'driving_license_cost' => 'nullable|numeric|min:0',
                'operator_license_number' => 'nullable|string|max:50',
                'operator_license_expiry' => 'nullable|date',
                'operator_license_cost' => 'nullable|numeric|min:0',
                'tuv_certification_number' => 'nullable|string|max:50',
                'tuv_certification_expiry' => 'nullable|date',
                'tuv_certification_cost' => 'nullable|numeric|min:0',
                'spsp_license_number' => 'nullable|string|max:50',
                'spsp_license_expiry' => 'nullable|date',
                'spsp_license_cost' => 'nullable|numeric|min:0',
            ];

            \Log::info('Validating request with data', [
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
            ]);

            $validated = $request->validate($rules);

            // Update user account
            $employee->user->update([
                'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                'email' => $validated['email'],
                'role' => $validated['role']
            ]);

            // Update employee record
            $employee->update([
                'file_number' => $validated['file_number'],
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'phone' => $validated['phone'],
                'address' => $validated['address'] ?? '',
                'city' => $validated['city'] ?? '',
                'nationality' => $validated['nationality'],
                'position_id' => $validated['position_id'],
                'hourly_rate' => $validated['hourly_rate'],
                'basic_salary' => $validated['basic_salary'],
                'food_allowance' => $validated['food_allowance'] ?? 0,
                'housing_allowance' => $validated['housing_allowance'] ?? 0,
                'transport_allowance' => $validated['transport_allowance'] ?? 0,
                'absent_deduction_rate' => $validated['absent_deduction_rate'] ?? 0,
                'advance_payment' => $validated['advance_payment'] ?? 0,
                'overtime_rate_multiplier' => $validated['overtime_rate_multiplier'] ?? 1.5,
                'bank_name' => $validated['bank_name'] ?? '',
                'bank_account_number' => $validated['bank_account_number'] ?? '',
                'bank_iban' => $validated['bank_iban'] ?? '',
                'contract_hours_per_day' => $validated['contract_hours_per_day'] ?? 8,
                'contract_days_per_month' => $validated['contract_days_per_month'] ?? 30,
                'hire_date' => $validated['hire_date'] ? date('Y-m-d', strtotime($validated['hire_date'])) : null,
                'status' => $validated['status'],
                'emergency_contact_name' => $validated['emergency_contact_name'] ?? '',
                'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? '',
                'notes' => $validated['notes'] ?? '',
                // Legal Documents
                'passport_number' => $validated['passport_number'] ?? '',
                'passport_expiry' => $validated['passport_expiry'] ? date('Y-m-d', strtotime($validated['passport_expiry'])) : null,
                'iqama_number' => $validated['iqama_number'] ?? '',
                'iqama_expiry' => $validated['iqama_expiry'] ? date('Y-m-d', strtotime($validated['iqama_expiry'])) : null,
                'iqama_cost' => $validated['iqama_cost'] ?? 0,
                'driving_license_number' => $validated['driving_license_number'] ?? '',
                'driving_license_expiry' => $validated['driving_license_expiry'] ? date('Y-m-d', strtotime($validated['driving_license_expiry'])) : null,
                'operator_license_number' => $validated['operator_license_number'] ?? '',
                'operator_license_expiry' => $validated['operator_license_expiry'] ? date('Y-m-d', strtotime($validated['operator_license_expiry'])) : null,
                'tuv_certification_number' => $validated['tuv_certification_number'] ?? '',
                'tuv_certification_expiry' => $validated['tuv_certification_expiry'] ? date('Y-m-d', strtotime($validated['tuv_certification_expiry'])) : null,
                'spsp_license_number' => $validated['spsp_license_number'] ?? '',
                'spsp_license_expiry' => $validated['spsp_license_expiry'] ? date('Y-m-d', strtotime($validated['spsp_license_expiry'])) : null
            ]);

            // Handle file uploads if the employee model has Media-related methods
            if (method_exists($employee, 'addMediaFromRequest')) {
                // Handle document uploads
                $documentTypes = [
                    'passport_file' => 'Passport',
                    'iqama_file' => 'Iqama',
                    'driving_license_file' => 'Driving License',
                    'operator_license_file' => 'Operator License',
                    'tuv_certification_file' => 'TUV Certification',
                    'spsp_license_file' => 'SPSP License',
                ];

                foreach ($documentTypes as $fileKey => $documentName) {
                    if ($request->hasFile($fileKey)) {
                        try {
                            $employee->addMediaFromRequest($fileKey)
                                ->usingName($documentName)
                                ->usingFileName(time() . '_' . $documentName . '.' . $request->file($fileKey)->getClientOriginalExtension())
                                ->toMediaCollection('employee_documents');
                        } catch (\Exception $e) {
                            \Log::error("Error uploading {$documentName} file", [
                                'error' => $e->getMessage(),
                                'employee_id' => $employee->id
                            ]);
                        }
                    }
                }

                // Handle custom certifications
                if ($request->has('custom_certifications') && !empty($request->custom_certifications)) {
                    $customCerts = json_decode($request->custom_certifications, true);
                    if (is_array($customCerts)) {
                        foreach ($customCerts as $index => $cert) {
                            $fileKey = 'custom_cert_file_' . $index;
                            if ($request->hasFile($fileKey)) {
                                try {
                                    $certName = $cert['name'] ?? 'Custom Certificate';
                                    $employee->addMediaFromRequest($fileKey)
                                        ->usingName($certName)
                                        ->usingFileName(time() . '_' . $certName . '.' . $request->file($fileKey)->getClientOriginalExtension())
                                        ->toMediaCollection('employee_custom_certificates');
                                } catch (\Exception $e) {
                                    \Log::error("Error uploading custom certificate file", [
                                        'error' => $e->getMessage(),
                                        'employee_id' => $employee->id,
                                        'cert' => $cert
                                    ]);
                                }
                            }
                        }
                    }
                }
            }

            return redirect()->route('employees.index')
                ->with('success', 'Employee updated successfully.');
        } catch (\Exception $e) {
            \Log::error('Error updating employee', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors(['error' => 'Failed to update employee: ' . $e->getMessage()]);
        }
    }
}


