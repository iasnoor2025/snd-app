<?php

namespace Modules\EmployeeManagement\Services;

use Modules\Core\Services\PdfGenerationService;
use Modules\EmployeeManagement\Models\Employee;
use Modules\EmployeeManagement\Models\Settlement;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class SettlementDocumentService
{
    protected PdfGenerationService $pdfService;

    public function __construct(PdfGenerationService $pdfService)
    {
        $this->pdfService = $pdfService;
    }

    /**
     * Generate a final settlement document for an employee
     *
     * @param Employee $employee
     * @param Settlement $settlement
     * @return string
     */
    public function generateSettlementDocument(Employee $employee, Settlement $settlement): string
    {
        $data = $this->prepareSettlementData($employee, $settlement);

        return $this->pdfService->generateFromTemplate(
            'employeemanagement::pdfs.settlement',
            $data,
            [
                'watermark' => 'CONFIDENTIAL',
                'headerTemplate' => 'employeemanagement::pdfs.header',
                'footerTemplate' => 'employeemanagement::pdfs.footer',
                'companyLogo' => config('app.company_logo'),
                'fileName' => "settlement_{$employee->id}_{$settlement->id}.pdf"
            ]
        );
    }

    /**
     * Generate settlement documents in batch
     *
     * @param array $settlements
     * @return array
     */
    public function generateBatchSettlements(array $settlements): array
    {
        $batch = [];

        foreach ($settlements as $settlement) {
            $employee = $settlement->employee;
            $data = $this->prepareSettlementData($employee, $settlement);

            $batch[] = [
                'template' => 'employeemanagement::pdfs.settlement',
                'data' => $data,
                'options' => [
                    'watermark' => 'CONFIDENTIAL',
                    'headerTemplate' => 'employeemanagement::pdfs.header',
                    'footerTemplate' => 'employeemanagement::pdfs.footer',
                    'companyLogo' => config('app.company_logo'),
                    'fileName' => "settlement_{$employee->id}_{$settlement->id}.pdf"
                ]
            ];
        }

        return $this->pdfService->generateBatch($batch);
    }

    /**
     * Add digital signatures to a settlement document
     *
     * @param string $documentPath
     * @param array $signatures
     * @return string
     */
    public function addSignatures(string $documentPath, array $signatures): string
    {
        return $this->pdfService->addDigitalSignature($documentPath, [
            'signatures' => $signatures,
            'date' => Carbon::now()->format('Y-m-d'),
            'location' => config('app.company_location')
        ]);
    }

    /**
     * Prepare settlement data for PDF generation
     *
     * @param Employee $employee
     * @param Settlement $settlement
     * @return array
     */
    protected function prepareSettlementData(Employee $employee, Settlement $settlement): array
    {
        return [
            'employee' => [
                'name' => $employee->full_name,
                'id' => $employee->employee_id,
                'department' => $employee->department->name,
                'position' => $employee->position->name,
                'join_date' => $employee->join_date->format('Y-m-d'),
                'end_date' => $settlement->end_date->format('Y-m-d')
            ],
            'settlement' => [
                'basic_salary' => $settlement->basic_salary,
                'allowances' => $settlement->allowances,
                'deductions' => $settlement->deductions,
                'gratuity' => $settlement->gratuity,
                'leave_balance' => $settlement->leave_balance,
                'notice_period' => $settlement->notice_period,
                'final_settlement' => $settlement->final_settlement,
                'remarks' => $settlement->remarks
            ],
            'company' => [
                'name' => config('app.company_name'),
                'address' => config('app.company_address'),
                'phone' => config('app.company_phone'),
                'email' => config('app.company_email'),
                'logo' => config('app.company_logo')
            ],
            'generated_by' => [
                'name' => Auth::user()->name,
                'position' => Auth::user()->position,
                'date' => Carbon::now()->format('Y-m-d H:i:s')
            ]
        ];
    }

    /**
     * Generate a preview of the settlement document
     *
     * @param Employee $employee
     * @param Settlement $settlement
     * @return string
     */
    public function generatePreview(Employee $employee, Settlement $settlement): string
    {
        $documentPath = $this->generateSettlementDocument($employee, $settlement);
        return $this->pdfService->generatePreview($documentPath);
    }

    /**
     * Protect a settlement document with a password
     *
     * @param string $documentPath
     * @param string $password
     * @return string
     */
    public function protectDocument(string $documentPath, string $password): string
    {
        return $this->pdfService->protectPdf($documentPath, $password);
    }

    /**
     * Add page numbers to a settlement document
     *
     * @param string $documentPath
     * @return string
     */
    public function addPageNumbers(string $documentPath): string
    {
        return $this->pdfService->addPageNumbers($documentPath);
    }

    /**
     * Merge multiple settlement documents
     *
     * @param array $documentPaths
     * @param string|null $outputFileName
     * @return string
     */
    public function mergeDocuments(array $documentPaths, ?string $outputFileName = null): string
    {
        return $this->pdfService->mergePdfs($documentPaths, $outputFileName);
    }
} 