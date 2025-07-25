<?php

namespace Modules\EmployeeManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EmployeeManagement\Domain\Models\EmployeeAssignment;
use App\Http\Controllers\Controller;

class EmployeeAssignmentController extends Controller
{
    /**
     * Store a newly created manual assignment for an employee.
     */
    public function store(Request $request, Employee $employee = null)
    {
        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found or inactive. Please check the employee ID.'
            ], 404);
        }

        // Validate required fields
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            //'type' => 'required|string|max:50', // force type below
            //'status' => 'required|string|max:50', // force status below
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'assigned_by' => 'nullable|integer|exists:users,id',
            'project_id' => 'nullable|integer|exists:projects,id',
            'rental_id' => 'nullable|integer|exists:rentals,id',
        ]);

        $validated['type'] = 'manual';
        $validated['status'] = 'active';
        $validated['assigned_by'] = Auth::id();

        $assignment = new EmployeeAssignment($validated);
        $assignment->employee_id = $employee->id;
        // Always ensure current assignment has end_date = null and status = 'active'
        $assignment->end_date = null;
        $assignment->status = 'active';
        $assignment->save();

        return response()->json([
            'success' => true,
            'message' => 'Assignment created successfully.',
            'assignment' => $assignment,
        ], 201);
    }

    /**
     * Update an existing assignment for an employee.
     */
    public function update(Request $request, Employee $employee, EmployeeAssignment $assignment)
    {
        if (!$employee || !$assignment || $assignment->employee_id !== $employee->id) {
            return response()->json([
                'success' => false,
                'message' => 'Assignment or employee not found.'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $assignment->fill($validated);
        // Always ensure current assignment has end_date = null and status = 'active'
        $assignment->end_date = null;
        $assignment->status = 'active';
        $assignment->save();

        return response()->json([
            'success' => true,
            'message' => 'Assignment updated successfully.',
            'assignment' => $assignment,
        ]);
    }
}
