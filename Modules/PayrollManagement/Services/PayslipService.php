<?php

namespace Modules\PayrollManagement\Services;

use Modules\PayrollManagement\Domain\Models\Payroll;
use Barryvdh\DomPDF\Facade\Pdf;

class PayslipService
{
    public function generatePayslip(Payroll $payroll): string
    {
        $pdf = Pdf::loadView('payroll::payslip', [
            'payroll' => $payroll,
            'employee' => $payroll->employee,
        ]);
        return $pdf->output();
    }
}
