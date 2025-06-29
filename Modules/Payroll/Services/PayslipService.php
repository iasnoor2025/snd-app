<?php

namespace Modules\Payroll\Services;

use Modules\Payroll\Domain\Models\Payroll;
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
