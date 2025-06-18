<?php

namespace Modules\EmployeeManagement\Actions;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Illuminate\Support\Facades\Log;

class DeleteEmployeeAction
{
    public function execute(Employee $employee): bool
    {
        try {
            $employee->delete();
            Log::info('Employee deleted successfully', ['employee_id' => $employee->id]);
            return true;
        } catch (\Exception $e) {
            Log::error('Error deleting employee', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
}
