<?php

namespace Modules\PayrollManagement\Services;

use Modules\Core\Services\PdfGenerationService;
use Modules\Reporting\Services\ReportExportService;
use Modules\EmployeeManagement\Services\EmployeeService;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class PayslipGenerationService
{
    protected PdfGenerationService $pdfService;
    protected ReportExportService $reportService;
    protected EmployeeService $employeeService;

    public function __construct(
        PdfGenerationService $pdfService,
        ReportExportService $reportService,
        EmployeeService $employeeService
    ) {
        $this->pdfService = $pdfService;
        $this->reportService = $reportService;
        $this->employeeService = $employeeService;
    }

    /**
     * Generate a single payslip
     */
    public function generatePayslip(int $employeeId, string $period, array $data, array $options = []): string
    {
        $employee = $this->employeeService->findById($employeeId);
        
        $payslipData = array_merge($data, [
            'employee' => $employee->toArray(),
            'period' => $period,
            'generated_at' => Carbon::now(),
        ]);

        $defaultOptions = [
            'template' => 'default',
            'paper' => 'a4',
            'orientation' => 'portrait',
            'watermark' => config('payroll.confidential_watermark', 'CONFIDENTIAL'),
            'show_watermark' => true,
            'include_header' => true,
            'include_footer' => true,
            'include_page_numbers' => true,
        ];

        $mergedOptions = array_merge($defaultOptions, $options);
        
        return $this->pdfService->generateFromView(
            "payroll::pdfs.payslips.{$mergedOptions['template']}",
            $payslipData,
            $mergedOptions
        );
    }

    /**
     * Generate payslips in bulk for multiple employees
     */
    public function generateBulkPayslips(array $employeeIds, string $period, array $data = [], array $options = []): array
    {
        $paths = [];
        $defaultOptions = [
            'combine' => true,
            'email_employees' => true,
            'store_permanently' => true,
        ];

        $mergedOptions = array_merge($defaultOptions, $options);

        foreach ($employeeIds as $employeeId) {
            try {
                $employeeData = $data[$employeeId] ?? [];
                $path = $this->generatePayslip($employeeId, $period, $employeeData, $mergedOptions);
                
                if ($mergedOptions['store_permanently']) {
                    $permanentPath = $this->storePayslipPermanently($path, $employeeId, $period);
                    $paths[] = $permanentPath;
                } else {
                    $paths[] = $path;
                }

                if ($mergedOptions['email_employees']) {
                    $this->emailPayslipToEmployee($employeeId, $path, $period);
                }
            } catch (\Exception $e) {
                \Log::error("Failed to generate payslip for employee {$employeeId}", [
                    'error' => $e->getMessage(),
                    'period' => $period,
                ]);
                continue;
            }
        }

        if ($mergedOptions['combine'] && count($paths) > 0) {
            return [$this->combinePayslips($paths)];
        }

        return $paths;
    }

    /**
     * Store payslip in permanent storage
     */
    protected function storePayslipPermanently(string $tempPath, int $employeeId, string $period): string
    {
        $fileName = "payslips/{$employeeId}/{$period}.pdf";
        
        if (Storage::exists($fileName)) {
            Storage::delete($fileName);
        }
        
        Storage::move($tempPath, $fileName);
        
        return $fileName;
    }

    /**
     * Email payslip to employee
     */
    protected function emailPayslipToEmployee(int $employeeId, string $path, string $period): void
    {
        $employee = $this->employeeService->findById($employeeId);
        
        if (!$employee->email) {
            \Log::warning("Cannot send payslip email - no email address for employee {$employeeId}");
            return;
        }

        dispatch(new \Modules\PayrollManagement\Jobs\SendPayslipEmail(
            $employee,
            $path,
            $period
        ));
    }

    /**
     * Combine multiple payslips into a single PDF
     */
    protected function combinePayslips(array $paths): string
    {
        $combinedPath = 'temp/combined_payslips_' . Str::random(40) . '.pdf';
        
        $merger = new \Webklex\PDFMerger\PDFMerger;
        
        foreach ($paths as $path) {
            $merger->addPDF(Storage::path($path));
        }
        
        $merger->merge();
        $merger->save(Storage::path($combinedPath));
        
        // Cleanup individual files if they're temporary
        foreach ($paths as $path) {
            if (str_starts_with($path, 'temp/')) {
                Storage::delete($path);
            }
        }
        
        return $combinedPath;
    }

    /**
     * Get available payslip templates
     */
    public function getAvailableTemplates(): Collection
    {
        return collect([
            'default' => 'Standard Payslip Template',
            'detailed' => 'Detailed Payslip with Breakdown',
            'simple' => 'Simple Payslip Layout',
            'bank' => 'Bank Transfer Format',
        ]);
    }

    /**
     * Calculate payslip totals
     */
    protected function calculateTotals(array $data): array
    {
        $totals = [
            'gross_pay' => 0,
            'total_deductions' => 0,
            'net_pay' => 0,
        ];

        // Add basic salary
        $totals['gross_pay'] += $data['basic_salary'] ?? 0;

        // Add allowances
        foreach ($data['allowances'] ?? [] as $allowance) {
            $totals['gross_pay'] += $allowance['amount'];
        }

        // Add overtime
        foreach ($data['overtime'] ?? [] as $overtime) {
            $totals['gross_pay'] += $overtime['amount'];
        }

        // Subtract deductions
        foreach ($data['deductions'] ?? [] as $deduction) {
            $totals['total_deductions'] += $deduction['amount'];
        }

        // Calculate net pay
        $totals['net_pay'] = $totals['gross_pay'] - $totals['total_deductions'];

        return $totals;
    }
} 