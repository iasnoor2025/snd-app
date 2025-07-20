<?php

namespace Modules\EmployeeManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmployeeApiController extends Controller
{
    /**
     * Get a list of employees for dropdowns
     *
     * @return \Illuminate\Http\JsonResponse;
     */
    public function index()
    {
        $employees = Employee::where('status', 'active')
            ->select('id', 'first_name', 'last_name', 'position', 'hourly_rate')
            ->orderBy('first_name')
            ->get()
            ->map(function ($employee) {
                // Add the full_name attribute for easier display in the frontend
                $employee->full_name = $employee->first_name . ' ' . $employee->last_name;
                // Ensure hourly_rate is a number
                $employee->hourly_rate = is_null($employee->hourly_rate) ? null : (float)$employee->hourly_rate;
                return $employee;
            });

        return response()->json($employees);
    }

    /**
     * Store a newly created employee in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse;
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'phone' => 'required|string|max:20',
                'nationality' => 'required|string|max:100',
                'file_number' => 'required|string|regex:/^EMP-\d{4}$/|unique:employees,file_number',
                'position_id' => 'required|exists:positions,id',
                'hourly_rate' => 'nullable|numeric|min:0',
                'basic_salary' => 'nullable|numeric|min:0',
                'overtime_rate_multiplier' => 'nullable|numeric|min:0',
                'overtime_fixed_rate' => 'nullable|numeric|min:0',
                'contract_hours_per_day' => 'nullable|numeric|min:1|max:24',
                'contract_days_per_month' => 'nullable|numeric|min:1|max:31',
                'iqama_number' => 'nullable|string|min:10|max:10|regex:/^\d+$/',
                'iqama_expiry' => 'nullable|date',
                'iqama_cost' => 'nullable|numeric|min:0',
                'passport_number' => 'nullable|string|max:255',
                'passport_expiry' => 'nullable|date',
                'driving_license.number' => 'nullable|string|max:255',
                'driving_license.expiry_date' => 'nullable|date',
                'driving_license.cost' => 'nullable|numeric|min:0',
                'operator_license.number' => 'nullable|string|max:255',
                'operator_license.expiry_date' => 'nullable|date',
                'operator_license.cost' => 'nullable|numeric|min:0',
                'tuv_certification.number' => 'nullable|string|max:255',
                'tuv_certification.expiry_date' => 'nullable|date',
                'tuv_certification.cost' => 'nullable|numeric|min:0',
                'spsp_license.number' => 'nullable|string|max:255',
                'spsp_license.expiry_date' => 'nullable|date',
                'spsp_license.cost' => 'nullable|numeric|min:0',
                'custom_certifications' => 'nullable|array',
                'custom_certifications.*.name' => 'nullable|string|max:255',
                'custom_certifications.*.issuing_organization' => 'nullable|string|max:255',
                'custom_certifications.*.issue_date' => 'nullable|date',
                'custom_certifications.*.expiry_date' => 'nullable|date',
                'custom_certifications.*.credential_id' => 'nullable|string|max:255',
                'custom_certifications.*.credential_url' => 'nullable|url',
                'custom_certifications.*.cost' => 'nullable|numeric|min:0',
                'notes' => 'nullable|string',
                'hire_date' => 'nullable|date',
                'status' => 'nullable|in:active,inactive,on_leave',
                'food_allowance' => 'nullable|numeric|min:0',
                'housing_allowance' => 'nullable|numeric|min:0',
                'transport_allowance' => 'nullable|numeric|min:0',
                'absent_deduction_rate' => 'nullable|numeric|min:0|max:100',
                'role' => 'nullable|in:admin,manager,foreman,workshop,employee',
                'supervisor' => 'nullable|string|max:255',
                'address' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:255',
                'emergency_contact_name' => 'nullable|string|max:255',
                'emergency_contact_phone' => 'nullable|string|max:20',
                'date_of_birth' => 'required|date'
            ]);

            // Create user account
            $user = \Modules\Core\Domain\Models\User::create([
                'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                'email' => $validated['email'],
                'password' => \Illuminate\Support\Facades\Hash::make('password'), // Default password
                'role' => $validated['role'] ?? 'employee'
            ]);

            // Generate employee ID (EMP-YYYY-XXXX)
            $year = date('Y');
            $lastEmployee = Employee::whereYear('created_at', $year)->latest()->first();
            $sequence = $lastEmployee ? intval(substr($lastEmployee->employee_id, -4)) + 1 : 1;
            $employeeId = 'EMP-' . $year . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);

            // Create employee record
            $employee = Employee::create([
                'user_id' => $user->id,
                'employee_id' => $employeeId,
                'file_number' => $validated['file_number'],
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'phone' => $validated['phone'],
                'nationality' => $validated['nationality'],
                'position_id' => $validated['position_id'],
                'hourly_rate' => $validated['hourly_rate'] ?? 0,
                'basic_salary' => $validated['basic_salary'] ?? 0,
                'food_allowance' => $validated['food_allowance'] ?? 0,
                'housing_allowance' => $validated['housing_allowance'] ?? 0,
                'transport_allowance' => $validated['transport_allowance'] ?? 0,
                'absent_deduction_rate' => $validated['absent_deduction_rate'] ?? 0,
                'overtime_rate_multiplier' => $validated['overtime_rate_multiplier'] ?? 1.5,
                'bank_name' => $validated['bank_name'] ?? '',
                'bank_account_number' => $validated['bank_account_number'] ?? '',
                'bank_iban' => $validated['bank_iban'] ?? '',
                'contract_hours_per_day' => $validated['contract_hours_per_day'] ?? 8,
                'contract_days_per_month' => $validated['contract_days_per_month'] ?? 30,
                'hire_date' => $validated['hire_date'] ? date('Y-m-d', strtotime($validated['hire_date'])) : null,
                'status' => $validated['status'] ?? 'active',
                'emergency_contact_name' => $validated['emergency_contact_name'] ?? '',
                'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? '',
                'notes' => $validated['notes'] ?? '',
                'address' => $validated['address'] ?? '',
                'city' => $validated['city'] ?? '',
                'date_of_birth' => $validated['date_of_birth'],
                // Legal Documents
                'passport_number' => $validated['passport_number'] ?? '',
                'passport_expiry' => $validated['passport_expiry'] ?? null,
                'iqama_number' => $validated['iqama_number'] ?? '',
                'iqama_expiry' => $validated['iqama_expiry'] ?? null,
                'iqama_cost' => $validated['iqama_cost'] ?? 0,
                'driving_license_number' => $validated['driving_license']['number'] ?? '',
                'driving_license_expiry' => $validated['driving_license']['expiry_date'] ?? null,
                'driving_license_cost' => $validated['driving_license']['cost'] ?? 0,
                'operator_license_number' => $validated['operator_license']['number'] ?? '',
                'operator_license_expiry' => $validated['operator_license']['expiry_date'] ?? null,
                'operator_license_cost' => $validated['operator_license']['cost'] ?? 0,
                'tuv_certification_number' => $validated['tuv_certification']['number'] ?? '',
                'tuv_certification_expiry' => $validated['tuv_certification']['expiry_date'] ?? null,
                'tuv_certification_cost' => $validated['tuv_certification']['cost'] ?? 0,
                'spsp_license_number' => $validated['spsp_license']['number'] ?? '',
                'spsp_license_expiry' => $validated['spsp_license']['expiry_date'] ?? null,
                'spsp_license_cost' => $validated['spsp_license']['cost'] ?? 0
            ]);

            // Handle file uploads
            if (method_exists($employee, 'addMediaFromRequest')) {
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
                            Log::error("Error uploading {$documentName} file", [
                                'error' => $e->getMessage(),
                                'employee_id' => $employee->id
                            ]);
                        }
                    }
                }
            }

            // Return response based on request type
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Employee created successfully',
                    'employee' => $employee
                ], 201);
            }

            return redirect()->route('employees.index')
                ->with('success', 'Employee created successfully.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $e->errors()
                ], 422);
            }

            return back()->withErrors($e->errors())->withInput();
;
        } catch (\Exception $e) {
            Log::error('Error creating employee', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'An error occurred while creating the employee',
                    'error' => $e->getMessage()
                ], 500);
            }

            return back()->withErrors([
                'error' => 'An error occurred while creating the employee: ' . $e->getMessage()
            ])->withInput();
        }
    }
}


