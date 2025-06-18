<?php

namespace Modules\EmployeeManagement\Services;

use Modules\Core\Services\BaseService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Modules\EmployeeManagement\Domain\Models\Department;
use Modules\EmployeeManagement\Domain\Models\Employee;

class DepartmentService extends BaseService
{
    /**
     * Create a new service instance.
     */
    public function __construct()
    {
        // No repository needed for this service as we're using the model directly
        parent::__construct(null);
    }

    /**
     * Get all departments with optional filtering
     *
     * @param array $filter
     * @return Collection
     */
    public function getAllDepartments(array $filter = []): Collection
    {
        $query = Department::query();

        if (isset($filter['status']) && $filter['status'] !== 'all') {
            $query->where('is_active', $filter['status'] === 'active');
        }

        if (isset($filter['search']) && !empty($filter['search'])) {
            $search = $filter['search'];
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('name')->get();
    }

    /**
     * Get only active departments
     *
     * @return Collection
     */
    public function getActiveDepartments(): Collection
    {
        return Department::where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    /**
     * Get organization chart structure
     *
     * @return array
     */
    public function getOrganizationChart(): array
    {
        $departments = Department::with(['employees'])->get();

        // Build organization chart structure
        $orgChart = [];

        foreach ($departments as $department) {
            $orgChart[] = [
                'id' => $department->id,
                'name' => $department->name,
                'code' => $department->code,
                'manager' => $department->manager_id ? [
                    'id' => $department->manager_id,
                    'name' => optional($department->manager)->full_name
                ] : null,
                'parent_id' => $department->parent_id,
                'children' => []
            ];
        }

        // Organize into hierarchy
        $result = [];
        $map = [];

        foreach ($orgChart as &$item) {
            $map[$item['id']] = &$item;
        }

        foreach ($orgChart as &$item) {
            if ($item['parent_id']) {
                if (isset($map[$item['parent_id']])) {
                    $map[$item['parent_id']]['children'][] = &$item;
                }
            } else {
                $result[] = &$item;
            }
        }

        return $result;
    }

    /**
     * Get a specific department by ID
     *
     * @param int $id
     * @return Department
     */
    public function getDepartment(int $id): Department
    {
        return Department::findOrFail($id);
    }

    /**
     * Create a new department
     *
     * @param array $data
     * @return Department
     */
    public function createDepartment(array $data): Department
    {
        try {
            DB::beginTransaction();

            $department = new Department();
            $department->fill($data);
            $department->save();

            DB::commit();
            return $department;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating department: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update an existing department
     *
     * @param int $id
     * @param array $data
     * @return Department
     */
    public function updateDepartment(int $id, array $data): Department
    {
        try {
            DB::beginTransaction();

            $department = $this->getDepartment($id);
            $department->fill($data);
            $department->save();

            DB::commit();
            return $department;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating department: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete a department
     *
     * @param int $id
     * @return bool
     */
    public function deleteDepartment(int $id): bool
    {
        try {
            DB::beginTransaction();

            $department = $this->getDepartment($id);

            // Check if department has employees
            $hasEmployees = $department->employees()->count() > 0;
            if ($hasEmployees) {
                throw new \Exception('Cannot delete department with assigned employees');
            }

            $department->delete();

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting department: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get employees in a department
     *
     * @param int $id
     * @return Collection
     */
    public function getDepartmentEmployees(int $id): Collection
    {
        $department = $this->getDepartment($id);
        return $department->employees()->get();
    }
}
