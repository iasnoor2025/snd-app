<?php

namespace Modules\EmployeeManagement\Actions;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Illuminate\Support\Facades\Log;

class UpdateEmployeeAction
{
    public function execute(Employee $employee, array $data): Employee
    {
        try {
            $employee->update($data);
            Log::info('Employee updated successfully', ['employee_id' => $employee->id]);
            return $employee;
        } catch (\Exception $e) {
            Log::error('Error updating employee', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $data
            ]);
            throw $e;
        }
    }
}
