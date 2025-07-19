<?php

namespace Modules\PayrollManagement\Services;

use Modules\PayrollManagement\Domain\Models\Payroll;
use Barryvdh\DomPDF\Facade\Pdf;

class PayslipService
{
    public function generatePayslip(Payroll $payroll): string
    {
        // Load the employee relationship if not already loaded
        if (!$payroll->relationLoaded('employee')) {
            $payroll->load('employee');
        }

        $pdf = Pdf::loadView('PayrollManagement::payslip', [
            'payroll' => $payroll,
            'employee' => $payroll->employee,
        ]);
        return $pdf->output();
    }
}
