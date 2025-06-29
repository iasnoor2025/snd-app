<?php

namespace Modules\PayrollManagement\Services;

class BankIntegrationService
{
    /**
     * Export payrolls to a bank file (CSV) for bulk salary transfer
     */
    public function exportPayrollBankFile(array $payrolls, string $format = 'csv'): string
    {
        // For demonstration, generate a CSV string with required fields
        $header = ['Employee Name', 'Bank Account', 'Amount', 'Currency', 'Reference'];
        $rows = [$header];
        foreach ($payrolls as $payroll) {
            $rows[] = [
                $payroll['employee_name'] ?? $payroll->employee->name,
                $payroll['bank_account'] ?? $payroll->employee->bank_account,
                $payroll['final_amount'] ?? $payroll->final_amount,
                $payroll['currency'] ?? $payroll->currency,
                $payroll['id'] ?? $payroll->id,
            ];
        }
        $csv = '';
        foreach ($rows as $row) {
            $csv .= implode(',', array_map(function($v) { return '"' . str_replace('"', '""', $v) . '"'; }, $row)) . "\n";
        }
        return $csv;
    }
}
