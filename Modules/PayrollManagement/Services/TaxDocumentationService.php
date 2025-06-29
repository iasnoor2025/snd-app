<?php

namespace Modules\PayrollManagement\Services;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\PayrollManagement\Domain\Models\Payroll;
use Modules\PayrollManagement\Domain\Models\TaxDocument;
use Modules\PayrollManagement\Domain\Models\PayrollItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use Modules\PayrollManagement\Exports\TaxDocumentsExport;

class TaxDocumentationService
{
    /**
     * Generate tax document for an employee for a specific year
     */
    public function generateTaxDocument(Employee $employee, int $taxYear): TaxDocument
    {
        // Check if document already exists
        $existingDocument = TaxDocument::where('employee_id', $employee->id)
            ->where('tax_year', $taxYear)
            ->first();

        if ($existingDocument && !$existingDocument->canRegenerate()) {
            throw new \Exception('Tax document already exists and cannot be regenerated.');
        }

        // Get all payrolls for the tax year
        $payrolls = $this->getPayrollsForTaxYear($employee, $taxYear);

        if ($payrolls->isEmpty()) {
            throw new \Exception('No payroll records found for the specified tax year.');
        }

        // Calculate tax document data
        $taxData = $this->calculateTaxData($payrolls);
        $monthlyBreakdown = $this->calculateMonthlyBreakdown($payrolls);

        // Create or update tax document
        $documentData = [
            'employee_id' => $employee->id,
            'tax_year' => $taxYear,
            'document_number' => TaxDocument::generateDocumentNumber($employee->id, $taxYear),
            'gross_income' => $taxData['gross_income'],
            'tax_withheld' => $taxData['tax_withheld'],
            'net_income' => $taxData['net_income'],
            'total_deductions' => $taxData['total_deductions'],
            'overtime_income' => $taxData['overtime_income'],
            'bonus_income' => $taxData['bonus_income'],
            'other_income' => $taxData['other_income'],
            'insurance_deductions' => $taxData['insurance_deductions'],
            'advance_deductions' => $taxData['advance_deductions'],
            'other_deductions' => $taxData['other_deductions'],
            'effective_tax_rate' => $taxData['effective_tax_rate'],
            'generated_at' => now(),
            'status' => 'generated',
            'metadata' => [
                'monthly_breakdown' => $monthlyBreakdown,
                'payroll_count' => $payrolls->count(),
                'generation_date' => now()->toISOString(),
            ],
        ];

        if ($existingDocument) {
            $existingDocument->update($documentData);
            $taxDocument = $existingDocument;
        } else {
            $taxDocument = TaxDocument::create($documentData);
        }

        // Associate payrolls with tax document
        $taxDocument->payrolls()->sync($payrolls->pluck('id'));

        return $taxDocument;
    }

    /**
     * Get payrolls for a specific tax year
     */
    private function getPayrollsForTaxYear(Employee $employee, int $taxYear)
    {
        return Payroll::where('employee_id', $employee->id)
            ->whereYear('created_at', $taxYear)
            ->where('status', '!=', 'cancelled')
            ->with(['items'])
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Calculate tax data from payrolls
     */
    private function calculateTaxData($payrolls)
    {
        $data = [
            'gross_income' => 0,
            'tax_withheld' => 0,
            'net_income' => 0,
            'total_deductions' => 0,
            'overtime_income' => 0,
            'bonus_income' => 0,
            'other_income' => 0,
            'insurance_deductions' => 0,
            'advance_deductions' => 0,
            'other_deductions' => 0,
        ];

        foreach ($payrolls as $payroll) {
            // Base calculations
            $data['gross_income'] += $payroll->base_salary + $payroll->overtime_amount + $payroll->bonus_amount;
            $data['net_income'] += $payroll->final_amount;
            $data['total_deductions'] += $payroll->deduction_amount;
            $data['overtime_income'] += $payroll->overtime_amount;
            $data['bonus_income'] += $payroll->bonus_amount;
            $data['advance_deductions'] += $payroll->advance_deduction ?? 0;

            // Use the tax engine for this payroll
            $data['tax_withheld'] += $payroll->calculateTax();

            // Calculate from payroll items
            foreach ($payroll->items as $item) {
                switch ($item->type) {
                    case 'insurance':
                        $data['insurance_deductions'] += abs($item->amount);
                        break;
                    case 'allowance':
                    case 'commission':
                        $data['other_income'] += $item->amount;
                        break;
                    case 'loan':
                    case 'penalty':
                        $data['other_deductions'] += abs($item->amount);
                        break;
                }
            }
        }

        // Calculate effective tax rate
        $data['effective_tax_rate'] = $data['gross_income'] > 0
            ? ($data['tax_withheld'] / $data['gross_income']) * 100
            : 0;

        return $data;
    }

    /**
     * Calculate monthly breakdown
     */
    private function calculateMonthlyBreakdown($payrolls)
    {
        $breakdown = [];

        foreach ($payrolls as $payroll) {
            $month = Carbon::parse($payroll->created_at)->format('Y-m');

            if (!isset($breakdown[$month])) {
                $breakdown[$month] = [
                    'month' => $month,
                    'gross_income' => 0,
                    'tax_withheld' => 0,
                    'net_income' => 0,
                    'overtime' => 0,
                    'bonus' => 0,
                ];
            }

            $breakdown[$month]['gross_income'] += $payroll->base_salary + $payroll->overtime_amount + $payroll->bonus_amount;
            $breakdown[$month]['net_income'] += $payroll->final_amount;
            $breakdown[$month]['overtime'] += $payroll->overtime_amount;
            $breakdown[$month]['bonus'] += $payroll->bonus_amount;

            // Calculate tax from items
            foreach ($payroll->items as $item) {
                if ($item->type === 'tax') {
                    $breakdown[$month]['tax_withheld'] += abs($item->amount);
                }
            }
        }

        return array_values($breakdown);
    }

    /**
     * Download tax document as PDF
     */
    public function downloadTaxDocument(TaxDocument $taxDocument)
    {
        $taxDocument->load(['employee', 'payrolls']);

        $pdf = Pdf::loadView('payroll::tax-document-pdf', [
            'taxDocument' => $taxDocument,
            'employee' => $taxDocument->employee,
            'monthlyBreakdown' => $taxDocument->monthly_breakdown,
        ]);

        $filename = "tax-document-{$taxDocument->employee->id}-{$taxDocument->tax_year}.pdf";

        return $pdf->download($filename);
    }

    /**
     * Export tax documents to Excel
     */
    public function exportTaxDocuments(int $taxYear, $employeeId = null)
    {
        $query = TaxDocument::with(['employee'])
            ->where('tax_year', $taxYear);

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        $taxDocuments = $query->get();

        $filename = "tax-documents-{$taxYear}";
        if ($employeeId) {
            $employee = Employee::find($employeeId);
            $filename .= "-{$employee->first_name}-{$employee->last_name}";
        }
        $filename .= ".xlsx";

        return Excel::download(new TaxDocumentsExport($taxDocuments), $filename);
    }

    /**
     * Generate tax documents for all employees
     */
    public function generateBulkTaxDocuments(int $taxYear, array $employeeIds = [])
    {
        $query = Employee::query();

        if (!empty($employeeIds)) {
            $query->whereIn('id', $employeeIds);
        } else {
            $query->where('status', 'active');
        }

        $employees = $query->get();
        $results = [
            'success' => 0,
            'errors' => [],
        ];

        foreach ($employees as $employee) {
            try {
                $this->generateTaxDocument($employee, $taxYear);
                $results['success']++;
            } catch (\Exception $e) {
                $results['errors'][] = [
                    'employee' => $employee->name,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    /**
     * Get tax summary for a year
     */
    public function getTaxSummary(int $taxYear, $employeeId = null)
    {
        $query = TaxDocument::where('tax_year', $taxYear);

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        return [
            'total_documents' => $query->count(),
            'total_gross_income' => $query->sum('gross_income'),
            'total_tax_withheld' => $query->sum('tax_withheld'),
            'total_net_income' => $query->sum('net_income'),
            'average_tax_rate' => $query->avg('effective_tax_rate'),
            'total_employees' => $query->distinct('employee_id')->count(),
        ];
    }

    /**
     * Validate tax year
     */
    public function validateTaxYear(int $taxYear): bool
    {
        $currentYear = date('Y');
        return $taxYear >= 2020 && $taxYear <= $currentYear;
    }

    /**
     * Get available tax years
     */
    public function getAvailableTaxYears(): array
    {
        $currentYear = date('Y');
        $years = [];

        // Get years from existing payrolls
        $payrollYears = Payroll::selectRaw('YEAR(created_at) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();

        // Combine with standard range
        for ($year = $currentYear; $year >= 2020; $year--) {
            if (!in_array($year, $years)) {
                $years[] = $year;
            }
        }

        // Add payroll years
        $years = array_unique(array_merge($years, $payrollYears));
        rsort($years);

        return $years;
    }
}
