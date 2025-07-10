<?php

namespace Modules\EmployeeManagement\Actions;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\Core\Domain\Models\User;
use App\Jobs\ProcessEmployeeDocuments;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Modules\Core\Services\DocumentService;

class CreateEmployeeAction
{
    protected $documentService;

    public function __construct(DocumentService $documentService)
    {
        $this->documentService = $documentService;
    }

    public function execute(array $data)
    {
        try {
            Log::info('Employee create request received', [
                'has_files' => isset($data['passport_file']) ||
                    isset($data['iqama_file']) ||
                    isset($data['driving_license_file']) ||
                    isset($data['operator_license_file']) ||
                    isset($data['tuv_certification_file']) ||
                    isset($data['spsp_license_file']),
                'file_keys' => array_keys($data),
                'request_params' => $data,
            ]);

            // First check for unique constraints
            $emailExists = User::where('email', $data['email'])->exists();
            $fileNumberExists = Employee::where('file_number', $data['file_number'])->exists();

            if ($emailExists || $fileNumberExists) {
                $errors = [];
                if ($emailExists) {
                    $errors['email'] = 'This email is already registered.';
                }
                if ($fileNumberExists) {
                    $errors['file_number'] = 'This employee file number is already in use.';
                }
                Log::error('Unique constraint violation', [
                    'errors' => $errors,
                    'email' => $data['email'],
                    'file_number' => $data['file_number']
                ]);
                throw new \Exception('Unique constraint violation', 409);
            }

            // Generate employee ID (EMP-YYYY-XXXX)
            $year = date('Y');
            $sequence = Employee::whereYear('created_at', $year)->max('employee_id');
            $sequence = $sequence ? (int)substr($sequence, -4) + 1 : 1;
            $employeeId = 'EMP-' . $year . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);

            // Set driving license number equal to iqama number
            $data['driving_license_number'] = $data['iqama_number'] ?? '';

            // Start database transaction with a longer timeout
            \DB::statement('SET statement_timeout = 300000'); // 300 seconds in milliseconds
            try {
                $employee = \DB::transaction(function () use ($data, $employeeId) {
                    Log::info('Starting employee creation transaction', [
                        'employee_id' => $employeeId,
                        'data_keys' => array_keys($data)
                    ]);

                    // Create user account
                    $user = User::create([
                        'name' => $data['first_name'] . ' ' . $data['last_name'],
                        'email' => $data['email'],
                        'password' => Hash::make(Str::random(10)),
                    ]);

                    Log::info('User created successfully', ['user_id' => $user->id]);

                    // Assign role using Spatie's role system
                    $role = $data['role'] ?? 'employee';
                    $user->assignRole($role);

                    Log::info('Role assigned successfully', ['role' => $role]);

                    // Create employee record
                    $employee = Employee::create([
                        'user_id' => $user->id,
                        'employee_id' => $employeeId,
                        'file_number' => $data['file_number'],
                        'first_name' => $data['first_name'],
                        'last_name' => $data['last_name'],
                        'phone' => $data['phone'],
                        'nationality' => $data['nationality'],
                        'position_id' => $data['position_id'],
                        'hourly_rate' => $data['hourly_rate'] ?? 0,
                        'basic_salary' => $data['basic_salary'] ?? 0,
                        'food_allowance' => $data['food_allowance'] ?? 0,
                        'housing_allowance' => $data['housing_allowance'] ?? 0,
                        'transport_allowance' => $data['transport_allowance'] ?? 0,
                        'absent_deduction_rate' => $data['absent_deduction_rate'] ?? 0,
                        'overtime_rate_multiplier' => $data['overtime_rate_multiplier'] ?? 1.5,
                        'bank_name' => $data['bank_name'] ?? '',
                        'bank_account_number' => $data['bank_account_number'] ?? '',
                        'bank_iban' => $data['bank_iban'] ?? '',
                        'contract_hours_per_day' => $data['contract_hours_per_day'] ?? 8,
                        'contract_days_per_month' => $data['contract_days_per_month'] ?? 22,
                        'hire_date' => $data['hire_date'] ? date('Y-m-d', strtotime($data['hire_date'])) : null,
                        'status' => $data['status'] ?? 'active',
                        'emergency_contact_name' => $data['emergency_contact_name'] ?? '',
                        'emergency_contact_phone' => $data['emergency_contact_phone'] ?? '',
                        'notes' => $data['notes'] ?? '',
                        'address' => $data['address'] ?? '',
                        'city' => $data['city'] ?? '',
                        'date_of_birth' => $data['date_of_birth'] ? date('Y-m-d', strtotime($data['date_of_birth'])) : null,
                        // Legal Documents
                        'passport_number' => $data['passport_number'] ?? '',
                        'passport_expiry' => $data['passport_expiry'] ?? null,
                        'iqama_number' => $data['iqama_number'] ?? '',
                        'iqama_expiry' => $data['iqama_expiry'] ?? null,
                        'iqama_cost' => $data['iqama_cost'] ?? 0,
                        'driving_license_number' => $data['driving_license_number'] ?? '',
                        'driving_license_expiry' => $data['driving_license_expiry'] ?? null,
                        'driving_license_cost' => $data['driving_license_cost'] ?? 0,
                        'operator_license_number' => $data['operator_license_number'] ?? '',
                        'operator_license_expiry' => $data['operator_license_expiry'] ?? null,
                        'operator_license_cost' => $data['operator_license_cost'] ?? 0,
                        'tuv_certification_number' => $data['tuv_certification_number'] ?? '',
                        'tuv_certification_expiry' => $data['tuv_certification_expiry'] ?? null,
                        'tuv_certification_cost' => $data['tuv_certification_cost'] ?? 0,
                        'spsp_license_number' => $data['spsp_license_number'] ?? '',
                        'spsp_license_expiry' => $data['spsp_license_expiry'] ?? null,
                        'spsp_license_cost' => $data['spsp_license_cost'] ?? 0
                    ]);

                    Log::info('Employee created successfully', ['employee_id' => $employee->id]);

                    return $employee;
                });

                // Queue file uploads for background processing
                if (method_exists($employee, 'addMedia')) {
                    Log::info('Queueing file uploads for processing', [
                        'employee_id' => $employee->id,
                        'has_files' => isset($data['passport_file']) ||
                            isset($data['iqama_file']) ||
                            isset($data['driving_license_file']) ||
                            isset($data['operator_license_file']) ||
                            isset($data['tuv_certification_file']) ||
                            isset($data['spsp_license_file'])
                    ]);
                    ProcessEmployeeDocuments::dispatch($employee, $data)->onQueue('documents');
                }

                return $employee;
            } catch (\Exception $e) {
                Log::error('Database transaction failed', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'data' => $data
                ]);
                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('Error creating employee', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $data
            ]);
            throw $e;
        }
    }
}




