<?php

namespace Modules\EmployeeManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\EmployeeManagement\Http\Requests\CreateEmployeeRequest;
use Modules\EmployeeManagement\Http\Requests\UpdateEmployeeRequest;
use Modules\EmployeeManagement\Services\EmployeeService;

class EmployeeController extends Controller
{
    public function __construct(
        protected EmployeeService $employeeService
    ) {}

    public function index(): JsonResponse
    {
        $employees = $this->employeeService->getActiveEmployees();
        return response()->json($employees);
    }

    public function store(CreateEmployeeRequest $request): JsonResponse
    {
        try {
            \Log::info('Api/EmployeeController@store - Request received', ['data' => $request->validated()]);

            // Add the email to create_user data
            $data = $request->validated();
            if (!isset($data['create_user'])) {
                $data['create_user'] = true;
            }

            $employee = $this->employeeService->createEmployee($data);

            \Log::info('Api/EmployeeController@store - Employee created', [
                'employee' => $employee ? $employee->toArray() : 'null'
            ]);

            // Check if employee was created successfully
            if (!$employee || !$employee->id) {
                throw new \Exception('Employee creation failed');
            }

            return response()->json([
                'success' => true,
                'message' => 'Employee created successfully',
                'employee' => $employee,
                'redirect' => route('employees.index')
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Api/EmployeeController@store - Exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create employee: ' . $e->getMessage(),
                'errors' => ['error' => $e->getMessage()]
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        $employee = $this->employeeService->getEmployeeWithDetails($id);
        return response()->json($employee);
    }

    public function update(UpdateEmployeeRequest $request, int $id): JsonResponse
    {
        $employee = $this->employeeService->updateEmployee($id, $request->validated());
        return response()->json($employee);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->employeeService->deleteEmployee($id);
        return response()->json(null, 204);
    }

    public function getByPosition(int $positionId): JsonResponse
    {
        $employees = $this->employeeService->getEmployeesByPosition($positionId);
        return response()->json($employees);
    }

    public function getWithCurrentSalary(): JsonResponse
    {
        $employees = $this->employeeService->getEmployeesWithCurrentSalary();
        return response()->json($employees);
    }

    public function getWithRecentTimesheets(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 5);
        $employees = $this->employeeService->getEmployeesWithRecentTimesheets($limit);
        return response()->json($employees);
    }

    public function getWithPendingAdvances(): JsonResponse
    {
        $employees = $this->employeeService->getEmployeesWithPendingAdvances();
        return response()->json($employees);
    }

    public function search(Request $request): JsonResponse
    {
        $query = $request->get('query');
        $employees = $this->employeeService->searchEmployees($query);
        return response()->json($employees);
    }

    public function getNextFileNumber(): JsonResponse
    {
        $fileNumber = $this->employeeService->generateNextFileNumber();
        // Extract the last number from the generated file number
        $matches = [];
        $lastFileNumber = 0;
        if (preg_match('/^EMP-(\d{4})$/', $fileNumber, $matches)) {
            $lastFileNumber = (int)$matches[1] - 1;
        }
        return response()->json([
            'file_number' => $fileNumber,
            'lastFileNumber' => $lastFileNumber
        ]);
    }

    public function getSalaryHistory(int $id): JsonResponse
    {
        $history = $this->employeeService->getEmployeeSalaryHistory($id);
        return response()->json($history);
    }

    public function getAdvanceHistory(int $id): JsonResponse
    {
        $history = $this->employeeService->getEmployeeAdvanceHistory($id);
        return response()->json($history);
    }

    public function getTimesheetHistory(int $id): JsonResponse
    {
        $history = $this->employeeService->getEmployeeTimesheetHistory($id);
        return response()->json($history);
    }

    public function getLeaveHistory(int $id): JsonResponse
    {
        $history = $this->employeeService->getEmployeeLeaveHistory($id);
        return response()->json($history);
    }

    public function getPerformanceReviews(int $id): JsonResponse
    {
        $reviews = $this->employeeService->getEmployeePerformanceReviews($id);
        return response()->json($reviews);
    }

    public function getDocuments(int $id): JsonResponse
    {
        $documents = $this->employeeService->getEmployeeDocuments($id);
        return response()->json($documents);
    }

    public function uploadDocument(Request $request, int $id): JsonResponse
    {
        $properties = [
            'document_type' => $request->input('document_type', 'general'),
            'document_number' => $request->input('document_number'),
            'issue_date' => $request->input('issue_date'),
            'expiry_date' => $request->input('expiry_date'),
            'issuing_authority' => $request->input('issuing_authority'),
            'description' => $request->input('description'),
        ];

        $document = $this->employeeService->uploadEmployeeDocument(
            $id,
            $request->file('document'),
            $properties
        );

        return response()->json($document, 201);
    }

    public function deleteDocument(int $id, int $mediaId): JsonResponse
    {
        $this->employeeService->deleteEmployeeDocument($id, $mediaId);
        return response()->json(null, 204);
    }
}

