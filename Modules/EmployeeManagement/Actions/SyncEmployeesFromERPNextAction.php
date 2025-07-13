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
            \Modules\EmployeeManagement\Domain\Models\Employee::updateOrCreate(
                ['erpnext_id' => $data['erpnext_id']],
                $data
            );
            $count++;
        }
        \Log::info("ERPNext Employee Sync: {$count} employees processed.");
        return $count;
    }
}
