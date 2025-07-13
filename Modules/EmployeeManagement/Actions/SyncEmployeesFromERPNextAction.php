<?php

namespace Modules\EmployeeManagement\Actions;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EmployeeManagement\Services\ERPNextClient;
use Illuminate\Support\Facades\Log;

class SyncEmployeesFromERPNextAction
{
    public function execute(): int
    {
        $client = app(ERPNextClient::class);
        $erpEmployees = $client->fetchAllEmployees();
        $count = 0;
        // Log the first raw ERPNext employee record for mapping correction
        if (!empty($erpEmployees)) {
            \Log::info('ERPNext FIRST employee raw data', $erpEmployees[0]);
        }
        foreach ($erpEmployees as $erpEmployee) {
            $data = $client->mapToLocal($erpEmployee);
            if (empty($data['erpnext_id'])) {
                continue;
            }
            $employee = \Modules\EmployeeManagement\Domain\Models\Employee::updateOrCreate(
                ['erpnext_id' => $data['erpnext_id']],
                $data
            );
            // Recalculate and save hourly_rate
            $days = $employee->contract_days_per_month ?: 30;
            $hours = $employee->contract_hours_per_day ?: 8;
            $salary = $employee->basic_salary ?: 0;
            $hourly = ($days > 0 && $hours > 0) ? round($salary / ($days * $hours), 2) : 0;
            $employee->hourly_rate = $hourly;
            $employee->save();
            $count++;
        }
        \Log::info("ERPNext Employee Sync: {$count} employees processed.");

        // Permanent fix: batch update all employees with basic_salary > 0 and hourly_rate null or 0
        $employeesToFix = \Modules\EmployeeManagement\Domain\Models\Employee::where('basic_salary', '>', 0)
            ->where(function($q) {
                $q->whereNull('hourly_rate')->orWhere('hourly_rate', 0);
            })->get();
        foreach ($employeesToFix as $employee) {
            $days = $employee->contract_days_per_month ?: 30;
            $hours = $employee->contract_hours_per_day ?: 8;
            $salary = $employee->basic_salary ?: 0;
            $employee->hourly_rate = ($days > 0 && $hours > 0) ? round($salary / ($days * $hours), 2) : 0;
            $employee->save();
        }

        return $count;
    }
}
