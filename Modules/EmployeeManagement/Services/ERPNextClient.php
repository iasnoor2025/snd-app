<?php

namespace Modules\EmployeeManagement\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use Modules\EmployeeManagement\Domain\Models\Position;
use Modules\EmployeeManagement\Domain\Models\Department;

class ERPNextClient
{
    protected $client;
    protected $baseUrl;
    protected $apiKey;
    protected $apiSecret;

    public function __construct()
    {
        $this->baseUrl = config('services.erpnext.url');
        $this->apiKey = config('services.erpnext.api_key');
        $this->apiSecret = config('services.erpnext.api_secret');
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout'  => 20, // seconds
            'headers' => [
                'Authorization' => 'token ' . $this->apiKey . ':' . $this->apiSecret,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
        ]);
    }

    public function fetchAllEmployees(): array
    {
        $response = $this->client->get('/api/resource/Employee?limit_page_length=1000');
        $data = json_decode($response->getBody()->getContents(), true);
        $employees = [];
        if (!empty($data['data'])) {
            foreach ($data['data'] as $item) {
                if (!empty($item['name'])) {
                    $detailResponse = $this->client->get('/api/resource/Employee/' . $item['name']);
                    $detailData = json_decode($detailResponse->getBody()->getContents(), true);
                    if (!empty($detailData['data'])) {
                        $employees[] = $detailData['data'];
                    }
                }
            }
        }
        return $employees;
    }

    public function fetchEmployeeByName(string $name): ?array
    {
        $filters = urlencode(json_encode([["name", "=", $name]]));
        $url = "/api/resource/Employee?filters=$filters";
        $response = $this->client->get($url);
        $data = json_decode($response->getBody()->getContents(), true);
        return $data['data'][0] ?? null;
    }

    public function mapToLocal(array $erpEmployee): array
    {
        $erpnextId = $erpEmployee['name'] ?? null;
        $employeeId = $erpEmployee['employee_number'] ?? $erpnextId;
        // Name logic: use ERPNext fields directly, set to empty string if missing
        $firstName = $erpEmployee['first_name'] ?? '';
        $middleName = $erpEmployee['middle_name'] ?? '';
        $lastName = $erpEmployee['last_name'] ?? '';
        $employeeArabicName = $erpEmployee['custom_الاسم_الكامل'] ?? null;
        $employeeName = $erpEmployee['employee_name'] ?? null;
        $basicSalary = $erpEmployee['ctc'] ?? $erpEmployee['basic_salary'] ?? 0;
        $cellNumber = $erpEmployee['cell_number'] ?? null;
        $companyEmail = $erpEmployee['company_email'] ?? null;
        $personalEmail = $erpEmployee['personal_email'] ?? null;
        $email = $companyEmail ?: $personalEmail;
        $fileNumber = $erpEmployee['employee_number'] ?? $employeeId ?? $erpnextId;
        $departmentName = $erpEmployee['department'] ?? null;
        $designationName = $erpEmployee['designation'] ?? null;
        $dateOfBirth = $erpEmployee['date_of_birth'] ?? null;
        $gender = $erpEmployee['gender'] ?? null;
        $maritalStatus = $erpEmployee['marital_status'] ?? null;
        $iqama = $erpEmployee['custom_iqama'] ?? null;
        $iqamaExpiry = $erpEmployee['iqama_expiry_date_en'] ?? null;
        $status = $erpEmployee['status'] ?? 'Active';
        $dateOfJoining = $erpEmployee['date_of_joining'] ?? null;
        $contractEndDate = $erpEmployee['contract_end_date'] ?? null;
        $company = $erpEmployee['company'] ?? null;
        $branch = $erpEmployee['branch'] ?? null;
        $userId = is_numeric($erpEmployee['user_id'] ?? null) ? $erpEmployee['user_id'] : null;
        $bio = $erpEmployee['bio'] ?? null;
        // Map position_id and department_id using local models if needed
        $positionId = null;
        $departmentId = null;
        if ($designationName) {
            $position = \Modules\EmployeeManagement\Domain\Models\Position::where('name', $designationName)->first();
            if ($position) {
                $positionId = $position->id;
            }
        }
        if ($departmentName) {
            $department = \Modules\EmployeeManagement\Domain\Models\Department::where('name', $departmentName)->first();
            if ($department) {
                $departmentId = $department->id;
            }
        }
        return [
            'erpnext_id' => $erpnextId,
            'employee_id' => $employeeId,
            'file_number' => $fileNumber,
            'first_name' => $firstName,
            'middle_name' => $middleName,
            'last_name' => $lastName,
            'employee_name' => $employeeName,
            'basic_salary' => $basicSalary,
            'phone' => $cellNumber,
            'email' => $email,
            'company_email' => $companyEmail,
            'department_id' => $departmentId,
            'position_id' => $positionId,
            'date_of_birth' => $dateOfBirth,
            'gender' => $gender,
            'marital_status' => $maritalStatus,
            'iqama' => $iqama,
            'iqama_expiry' => $iqamaExpiry,
            'status' => $status,
            'date_of_joining' => $dateOfJoining,
            'contract_end_date' => $contractEndDate,
            'company' => $company,
            'branch' => $branch,
            'user_id' => $userId,
            'employee_arabic_name' => $employeeArabicName,
            'bio' => $bio,
        ];
    }

    public function updateEmployee($employee)
    {
        // If erpnext_id is missing, create the employee in ERPNext first
        if (empty($employee->erpnext_id)) {
            $data = [
                'first_name' => $employee->first_name,
                'middle_name' => $employee->middle_name,
                'last_name' => $employee->last_name,
                'employee_name' => $employee->first_name . ' ' . $employee->middle_name . ' ' . $employee->last_name,
                'employee_number' => $employee->file_number,
                'ctc' => $employee->basic_salary,
                'cell_number' => $employee->phone,
                'company_email' => $employee->company_email,
                'personal_email' => $employee->email,
                'department' => optional($employee->department)->name,
                'designation' => optional($employee->position)->name,
                'date_of_birth' => $employee->date_of_birth,
                'gender' => $employee->gender,
                'marital_status' => $employee->marital_status,
                'custom_iqama' => $employee->iqama,
                'iqama_expiry_date_en' => $employee->iqama_expiry,
                'status' => $employee->status,
                'date_of_joining' => $employee->date_of_joining,
                'contract_end_date' => $employee->contract_end_date,
                'company' => $employee->company,
                'branch' => $employee->branch,
                'custom_الاسم_الكامل' => $employee->employee_arabic_name,
                'bio' => $employee->bio,
            ];
            try {
                $response = $this->client->post("/api/resource/Employee", [
                    'json' => $data,
                ]);
                $result = json_decode($response->getBody()->getContents(), true);
                if (!empty($result['data']['name'])) {
                    $employee->erpnext_id = $result['data']['name'];
                    $employee->save();
                    Log::info('ERPNext employee created and erpnext_id set', ['erpnext_id' => $employee->erpnext_id, 'employee_id' => $employee->id]);
                } else {
                    Log::error('Failed to create ERPNext employee: no name returned', ['employee_id' => $employee->id]);
                    return false;
                }
            } catch (\Exception $e) {
                Log::error('Failed to create ERPNext employee', [
                    'employee_id' => $employee->id,
                    'error' => $e->getMessage(),
                ]);
                return false;
            }
        }
        // Now update as before
        // Map local status to ERPNext expected values
        $statusMap = [
            'active' => 'Active',
            'inactive' => 'Inactive',
            'on_leave' => 'Suspended',
            'terminated' => 'Left',
            'exit' => 'Left',
        ];
        $localStatus = strtolower($employee->status);
        $erpStatus = $statusMap[$localStatus] ?? 'Active';
        $allowedStatuses = ['Active', 'Inactive', 'Suspended', 'Left'];
        if (!in_array($erpStatus, $allowedStatuses)) {
            $erpStatus = 'Active';
        }
        Log::info('ERPNext sync: mapped status', [
            'employee_id' => $employee->id,
            'local_status' => $employee->status,
            'mapped_status' => $erpStatus
        ]);
        $data = [
            'first_name' => $employee->first_name,
            'middle_name' => $employee->middle_name,
            'last_name' => $employee->last_name,
            'employee_name' => trim($employee->first_name . ' ' . $employee->middle_name . ' ' . $employee->last_name),
            'employee_number' => $employee->file_number,
            'ctc' => $employee->basic_salary,
            'cell_number' => $employee->phone,
            'company_email' => $employee->company_email,
            'personal_email' => $employee->email,
            'department' => optional($employee->department)->name,
            'designation' => optional($employee->position)->name,
            'date_of_birth' => $employee->date_of_birth,
            'gender' => $employee->gender,
            'marital_status' => $employee->marital_status,
            'custom_iqama' => $employee->iqama,
            'iqama_expiry_date_en' => $employee->iqama_expiry,
            'status' => $erpStatus,
            'date_of_joining' => $employee->date_of_joining,
            'contract_end_date' => $employee->contract_end_date,
            'company' => $employee->company,
            'branch' => $employee->branch,
            'custom_الاسم_الكامل' => $employee->employee_arabic_name,
            'bio' => $employee->bio,
            // Additional fields
            'address' => $employee->address,
            'city' => $employee->city,
            'food_allowance' => $employee->food_allowance,
            'housing_allowance' => $employee->housing_allowance,
            'transport_allowance' => $employee->transport_allowance,
            'absent_deduction_rate' => $employee->absent_deduction_rate,
            'overtime_rate_multiplier' => $employee->overtime_rate_multiplier,
            'overtime_fixed_rate' => $employee->overtime_fixed_rate,
            'bank_name' => $employee->bank_name,
            'bank_account_number' => $employee->bank_account_number,
            'bank_iban' => $employee->bank_iban,
            'contract_hours_per_day' => $employee->contract_hours_per_day,
            'contract_days_per_month' => $employee->contract_days_per_month,
            'emergency_contact_name' => $employee->emergency_contact_name,
            'emergency_contact_phone' => $employee->emergency_contact_phone,
            'notes' => $employee->notes,
            // Legal Documents
            'passport_number' => $employee->passport_number,
            'passport_expiry' => $employee->passport_expiry,
            'iqama_number' => $employee->iqama_number,
            // Licenses and certifications
            'driving_license_number' => $employee->driving_license_number,
            'driving_license_expiry' => $employee->driving_license_expiry,
            'driving_license_cost' => $employee->driving_license_cost,
            'operator_license_number' => $employee->operator_license_number,
            'operator_license_expiry' => $employee->operator_license_expiry,
            'operator_license_cost' => $employee->operator_license_cost,
            'tuv_certification_number' => $employee->tuv_certification_number,
            'tuv_certification_expiry' => $employee->tuv_certification_expiry,
            'tuv_certification_cost' => $employee->tuv_certification_cost,
            'spsp_license_number' => $employee->spsp_license_number,
            'spsp_license_expiry' => $employee->spsp_license_expiry,
            'spsp_license_cost' => $employee->spsp_license_cost,
        ];
        try {
            $this->client->put("/api/resource/Employee/{$employee->erpnext_id}", [
                'json' => $data,
            ]);
            Log::info('ERPNext employee updated', ['erpnext_id' => $employee->erpnext_id, 'employee_id' => $employee->id]);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to update ERPNext employee', [
                'erpnext_id' => $employee->erpnext_id,
                'employee_id' => $employee->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
