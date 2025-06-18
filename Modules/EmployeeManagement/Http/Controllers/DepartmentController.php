<?php

namespace Modules\EmployeeManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\EmployeeManagement\Services\DepartmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class DepartmentController extends Controller
{
    protected $departmentService;

    public function __construct(DepartmentService $departmentService)
    {
        $this->departmentService = $departmentService;
    }

    /**
     * Get all departments with optional filtering
     */
    public function index(Request $request)
    {
        $filter = [];

        if ($request->has('is_active')) {
            $filter['is_active'] = $request->boolean('is_active');
        }

        if ($request->has('parent_id')) {
            $filter['parent_id'] = $request->input('parent_id');
        }

        if ($request->has('search')) {
            $filter['search'] = $request->input('search');
        }

        $departments = $this->departmentService->getAllDepartments($filter);

        return response()->json([
            'status' => 'success',
            'data' => $departments
        ]);
    }

    /**
     * Get active departments
     */
    public function getActiveDepartments()
    {
        $departments = $this->departmentService->getActiveDepartments();

        return response()->json([
            'status' => 'success',
            'data' => $departments
        ]);
    }

    /**
     * Get organization chart
     */
    public function getOrganizationChart()
    {
        $orgChart = $this->departmentService->getOrganizationChart();

        return response()->json([
            'status' => 'success',
            'data' => $orgChart
        ]);
    }

    /**
     * Get department by ID
     */
    public function show(int $id)
    {
        $department = $this->departmentService->getDepartment($id);

        if (!$department) {
            return response()->json([
                'status' => 'error',
                'message' => 'Department not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $department
        ]);
    }

    /**
     * Create a new department
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'code' => 'nullable|string|max:50|unique:departments,code',
                'description' => 'nullable|string',
                'manager_id' => 'nullable|exists:employees,id',
                'parent_id' => 'nullable|exists:departments,id',
                'is_active' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $department = $this->departmentService->createDepartment($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Department created successfully',
                'data' => $department
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a department
     */
    public function update(Request $request, int $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'code' => 'nullable|string|max:50|unique:departments,code,' . $id,
                'description' => 'nullable|string',
                'manager_id' => 'nullable|exists:employees,id',
                'parent_id' => 'nullable|exists:departments,id',
                'is_active' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if department exists
            $department = $this->departmentService->getDepartment($id);
            if (!$department) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Department not found'
                ], 404);
            }

            $updatedDepartment = $this->departmentService->updateDepartment($id, $request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Department updated successfully',
                'data' => $updatedDepartment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a department
     */
    public function destroy(int $id)
    {
        try {
            // Check if department exists
            $department = $this->departmentService->getDepartment($id);
            if (!$department) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Department not found'
                ], 404);
            }

            $this->departmentService->deleteDepartment($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Department deleted successfully'
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get employees in a department
     */
    public function getDepartmentEmployees(int $id)
    {
        try {
            // Check if department exists
            $department = $this->departmentService->getDepartment($id);
            if (!$department) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Department not found'
                ], 404);
            }

            $employees = $this->departmentService->getDepartmentEmployees($id);

            return response()->json([
                'status' => 'success',
                'data' => $employees
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get department employees',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}


