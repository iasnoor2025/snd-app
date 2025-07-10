<?php

namespace Modules\EmployeeManagement\Services;

use Modules\Core\Services\BaseService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EmployeeManagement\Repositories\EmployeeRepositoryInterface;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class EmployeeService extends BaseService
{
    private EmployeeRepositoryInterface $employeeRepository;

    public function __construct(EmployeeRepositoryInterface $employeeRepository)
    {
        $this->employeeRepository = $employeeRepository;
    }

    public function createEmployee(array $data): Employee
    {
        try {
            \Log::info('EmployeeService::createEmployee - Start', ['data' => $data]);
            DB::beginTransaction();

            // Generate file number if not provided
            if (!isset($data['file_number']) || empty($data['file_number'])) {
                $data['file_number'] = $this->employeeRepository->generateNextFileNumber();
            }

            // Try to create employee using repository
            $employee = $this->employeeRepository->create($data);
            \Log::info('EmployeeService::createEmployee - After repository create', ['employee' => $employee]);

            // If repository create doesn't produce a valid employee with ID, try direct model creation
            if (!$employee || !$employee->exists || !$employee->id) {
                \Log::warning('EmployeeService::createEmployee - Repository create failed, trying direct model creation');

                // Direct model creation
                $employee = new Employee();
                foreach ($data as $key => $value) {
                    if (in_array($key, $employee->getFillable())) {
                        $employee->{$key} = $value;
                    }
                }
                $saveResult = $employee->save();

                \Log::info('EmployeeService::createEmployee - Direct model save result', [
                    'success' => $saveResult,
                    'employee_id' => $employee->id,
                    'employee_exists' => $employee->exists
                ]);

                if (!$saveResult || !$employee->id) {
                    \Log::error('EmployeeService::createEmployee - Direct model save failed', [
                        'data' => $data,
                        'model_errors' => $employee->getErrors() ?? 'No errors available'
                    ]);
                    throw new \Exception('Failed to save employee using direct model creation');
                }
            }

            // Create associated user if needed
            if (isset($data['create_user']) && $data['create_user']) {
                $user = $this->createUserForEmployee($employee, $data);
                $employee->user_id = $user->id;
                $employee->save();
                \Log::info('EmployeeService::createEmployee - User created and linked', ['user_id' => $user->id]);
            }

            // Attempt a refresh to verify the employee was actually saved
            try {
                $refreshed = Employee::find($employee->id);
                \Log::info('EmployeeService::createEmployee - Verify employee exists in DB', [
                    'found' => $refreshed ? true : false,
                    'id' => $employee->id
                ]);

                if (!$refreshed) {
                    throw new \Exception('Employee created but cannot be found in database after creation');
                }
            } catch (\Exception $e) {
                \Log::error('EmployeeService::createEmployee - Verification failed', [
                    'error' => $e->getMessage()
                ]);
                throw $e;
            }

            DB::commit();
            \Log::info('EmployeeService::createEmployee - Success', ['employee_id' => $employee->id]);
            return $employee;
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('EmployeeService::createEmployee - Exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    public function updateEmployee(int $id, array $data): Employee
    {
        try {
            DB::beginTransaction();

            $employee = $this->employeeRepository->update($id, $data);

            // Update associated user if needed
            if (isset($data['update_user']) && $data['update_user'] && $employee->user_id) {
                $this->updateUserForEmployee($employee, $data);
            }

            DB::commit();
            return $employee;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update employee: ' . $e->getMessage());
            throw $e;
        }
    }

    public function deleteEmployee(int $id): bool
    {
        try {
            DB::beginTransaction();

            $employee = $this->employeeRepository->find($id);

            // Delete associated user if needed
            if ($employee->user_id) {
                $this->deleteUserForEmployee($employee);
            }

            $result = $this->employeeRepository->delete($id);

            DB::commit();
            return $result;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete employee: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getEmployeeWithDetails(int $id): Employee
    {
        return $this->employeeRepository->findWith([
            'user',
            'position',
            'salaryHistory',
            'timesheets',
            'advancePayments',
            'leaveRequests',
            'performanceReviews'
        ], $id);
    }

    public function getActiveEmployees(): array
    {
        return $this->employeeRepository->findActive();
    }

    public function getEmployeesByPosition(int $positionId): array
    {
        return $this->employeeRepository->findByPosition($positionId);
    }

    public function getEmployeesWithCurrentSalary(): array
    {
        return $this->employeeRepository->getWithCurrentSalary();
    }

    public function getEmployeesWithRecentTimesheets(int $limit = 5): array
    {
        return $this->employeeRepository->getWithRecentTimesheets($limit);
    }

    public function getEmployeesWithPendingAdvances(): array
    {
        return $this->employeeRepository->getWithPendingAdvances();
    }

    public function getEmployeeDocuments(int $id): array
    {
        try {
            $employee = $this->employeeRepository->find($id);

            return $employee->getMedia('documents')->map(function ($media) {;
                return [
                    'id' => $media->id,
                    'name' => $media->name,
                    'file_name' => $media->file_name,
                    'mime_type' => $media->mime_type,
                    'size' => $media->size,
                    'url' => $media->getUrl(),
                    'custom_properties' => $media->custom_properties,
                    'created_at' => $media->created_at->toDateTimeString(),
                ];
            })->toArray();
        } catch (\Exception $e) {
            Log::error('Failed to get employee documents: ' . $e->getMessage());
            throw $e;
        }
    }

    public function uploadEmployeeDocument(int $id, UploadedFile $file, array $properties = []): array
    {
        try {
            DB::beginTransaction();

            $employee = $this->employeeRepository->find($id);

            // Set default custom properties
            $customProperties = array_merge([
                'document_type' => 'general',
                'status' => 'pending',
                'is_verified' => false,
                'uploaded_by' => auth()->id(),
                'uploaded_at' => now()->toDateTimeString(),
            ], $properties);

            // Add the document to the employee's media collection
            $media = $employee->addMedia($file)
                ->withCustomProperties($customProperties)
                ->toMediaCollection('documents');

            DB::commit();

            return [
                'id' => $media->id,
                'name' => $media->name,
                'file_name' => $media->file_name,
                'mime_type' => $media->mime_type,
                'size' => $media->size,
                'url' => $media->getUrl(),
                'custom_properties' => $media->custom_properties,
                'created_at' => $media->created_at->toDateTimeString(),
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to upload employee document: ' . $e->getMessage());
            throw $e;
        }
    }

    public function deleteEmployeeDocument(int $id, int $mediaId): bool
    {
        try {
            DB::beginTransaction();

            $employee = $this->employeeRepository->find($id);
            $media = $employee->getMedia('documents')->find($mediaId);

            if (!$media) {
                throw new \Exception('Document not found');
            }

            $result = $media->delete();

            DB::commit();
            return $result;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete employee document: ' . $e->getMessage());
            throw $e;
        }
    }

    private function createUserForEmployee(Employee $employee, array $data): \Modules\Core\Domain\Models\User
    {
        return \Modules\Core\Domain\Models\User::create([
            'name' => $employee->first_name . ' ' . $employee->last_name,
            'email' => $employee->email,
            'password' => bcrypt($data['password'] ?? 'password'),
            'role' => $data['role'] ?? 'employee'
        ]);
    }

    private function updateUserForEmployee(Employee $employee, array $data): void
    {
        $user = \Modules\Core\Domain\Models\User::find($employee->user_id);
        if ($user) {
            $user->update([
                'name' => $employee->first_name . ' ' . $employee->last_name,
                'email' => $employee->email,
                'role' => $data['role'] ?? $user->role
            ]);

            if (isset($data['password'])) {
                $user->update(['password' => bcrypt($data['password'])]);
            }
        }
    }

    private function deleteUserForEmployee(Employee $employee): void
    {
        $user = \Modules\Core\Domain\Models\User::find($employee->user_id);
        if ($user) {
            $user->delete();
        }
    }

    /**
     * Clear any employee-related caches that might contain position data.
     * For now, this is a no-op (placeholder).
     */
    public function clearEmployeeCaches(): void
    {
        \Log::info('clearEmployeeCaches called (no-op)');
    }

    public function getEmployeeSummary(): array
    {
        $total = $this->employeeRepository->count();
        $active = $this->employeeRepository->findByStatus('active');
        $inactive = $this->employeeRepository->findByStatus('inactive');
        $topEmployees = $this->employeeRepository->getTopEmployees(3);
        return [
            'total' => $total,
            'active' => count($active),
            'inactive' => count($inactive),
            'topEmployees' => array_map(function ($emp) {
                return [
                    'id' => $emp->id,
                    'name' => $emp->name,
                    'status' => ucfirst($emp->status),
                ];
            }, $topEmployees),
        ];
    }

    /**
     * Return all employees (for /employees/all endpoint)
     */
    public function getAllEmployees(): array
    {
        return $this->employeeRepository->all();
    }
}


