<?php

namespace Modules\EmployeeManagement\Http\Controllers\Api;

use Illuminate\Routing\Controller;
use Modules\EmployeeManagement\Domain\Models\Employee;

class WidgetController extends Controller
{
    /**
     * Get all employees for dashboard widget.
     */
    public function all()
    {
        $employees = Employee::select('id', 'first_name', 'middle_name', 'last_name', 'email', 'position_id', 'department_id', 'file_number', 'status')
            ->with(['position:id,name', 'department:id,name'])
            ->get();

        // Add a computed full_name for each employee
        $employees->transform(function ($employee) {
            $employee->full_name = trim(
                $employee->first_name . ' ' .
                ($employee->middle_name ? $employee->middle_name . ' ' : '') .
                $employee->last_name
            );
            return $employee;
        });

        return response()->json([
            'data' => $employees,
            'count' => $employees->count(),
        ]);
    }
}
