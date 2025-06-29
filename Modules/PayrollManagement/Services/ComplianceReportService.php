<?php

namespace Modules\PayrollManagement\Services;

use Modules\PayrollManagement\Domain\Models\Payroll;
use Modules\PayrollManagement\Domain\Models\PayrollItem;
use Illuminate\Support\Facades\DB;

class ComplianceReportService
{
    /**
     * Generate a compliance/statutory report for payroll
     * @param array $filters
     * @return array
     */
    public function generateReport(array $filters = []): array
    {
        $query = Payroll::query();
        if (isset($filters['month'])) {
            $query->whereMonth('created_at', $filters['month']);
        }
        if (isset($filters['year'])) {
            $query->whereYear('created_at', $filters['year']);
        }
        if (isset($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }
        $payrolls = $query->with('items')->get();

        // Example: GOSI, WPS, tax, insurance compliance
        $totalPayroll = $payrolls->sum('final_amount');
        $totalTax = $payrolls->flatMap->items->where('type', 'taxes')->sum('amount');
        $totalInsurance = $payrolls->flatMap->items->where('type', 'insurance')->sum('amount');
        $totalGOSI = $payrolls->flatMap->items->where('type', 'gosi')->sum('amount');
        $totalWPS = $payrolls->flatMap->items->where('type', 'wps')->sum('amount');

        return [
            'total_payroll' => $totalPayroll,
            'total_tax' => $totalTax,
            'total_insurance' => $totalInsurance,
            'total_gosi' => $totalGOSI,
            'total_wps' => $totalWPS,
            'payroll_count' => $payrolls->count(),
        ];
    }
}
