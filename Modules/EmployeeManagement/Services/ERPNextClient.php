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
}
