<?php

namespace Modules\PayrollManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\PayrollManagement\Domain\Models\Payroll;
use Modules\PayrollManagement\Domain\Models\TaxDocument;
use Modules\PayrollManagement\Services\TaxDocumentationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TaxDocumentationController extends Controller
{
    protected $taxDocumentationService;

    public function __construct(TaxDocumentationService $taxDocumentationService)
    {
        $this->taxDocumentationService = $taxDocumentationService;
    }

    /**
     * Display tax documentation dashboard
     */
    public function index(Request $request)
    {
        $currentYear = $request->get('year', date('Y'));
        $employeeId = $request->get('employee_id');

        // Get employees for filter
        $employees = Employee::where('status', 'active')
            ->orWhere('status', 'inactive')
            ->get(['id', 'first_name', 'middle_name', 'last_name'])
            ->append('name')
            ->filter(function ($employee) {
                return !empty($employee->id) && !empty($employee->name);
            })
            ->values();

        // Get tax documents with filters
        $query = TaxDocument::with(['employee'])
            ->where('tax_year', $currentYear);

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        $taxDocuments = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Get summary statistics
        $summary = $this->getTaxSummary($currentYear, $employeeId);

        return Inertia::render('Payroll/TaxDocumentation/Index', [
            'taxDocuments' => $taxDocuments,
            'employees' => $employees,
            'summary' => $summary,
            'filters' => [
                'year' => $currentYear,
                'employee_id' => $employeeId,
            ],
            'availableYears' => $this->getAvailableYears(),
        ]);
    }

    /**
     * Generate tax document for employee
     */
    public function generate(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'tax_year' => 'required|integer|min:2020|max:' . (date('Y') + 1),
        ]);

        $employee = Employee::findOrFail($request->employee_id);
        $taxYear = $request->tax_year;

        try {
            $taxDocument = $this->taxDocumentationService->generateTaxDocument($employee, $taxYear);

            return redirect()->back()->with('success', 'Tax document generated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to generate tax document: ' . $e->getMessage());
        }
    }

    /**
     * Bulk generate tax documents
     */
    public function bulkGenerate(Request $request)
    {
        $request->validate([
            'tax_year' => 'required|integer|min:2020|max:' . (date('Y') + 1),
            'employee_ids' => 'array',
            'employee_ids.*' => 'exists:employees,id',
        ]);

        $taxYear = $request->tax_year;
        $employeeIds = $request->employee_ids;

        // If no specific employees selected, generate for all active employees
        if (empty($employeeIds)) {
            $employees = Employee::where('status', 'active')->get();
        } else {
            $employees = Employee::whereIn('id', $employeeIds)->get();
        }

        $generated = 0;
        $errors = [];

        foreach ($employees as $employee) {
            try {
                $this->taxDocumentationService->generateTaxDocument($employee, $taxYear);
                $generated++;
            } catch (\Exception $e) {
                $errors[] = "Failed to generate for {$employee->name}: " . $e->getMessage();
            }
        }

        $message = "Generated {$generated} tax documents.";
        if (!empty($errors)) {
            $message .= ' Errors: ' . implode(', ', $errors);
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Show tax document details
     */
    public function show(TaxDocument $taxDocument)
    {
        $taxDocument->load(['employee', 'payrolls']);

        return Inertia::render('Payroll/TaxDocumentation/Show', [
            'taxDocument' => $taxDocument,
        ]);
    }

    /**
     * Download tax document as PDF
     */
    public function download(TaxDocument $taxDocument)
    {
        return $this->taxDocumentationService->downloadTaxDocument($taxDocument);
    }

    /**
     * Get tax summary statistics
     */
    private function getTaxSummary($year, $employeeId = null)
    {
        $query = DB::table('tax_documents')
            ->where('tax_year', $year);

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        return [
            'total_documents' => $query->count(),
            'total_gross_income' => $query->sum('gross_income'),
            'total_tax_withheld' => $query->sum('tax_withheld'),
            'total_net_income' => $query->sum('net_income'),
            'average_tax_rate' => $query->avg('effective_tax_rate'),
        ];
    }

    /**
     * Get available years for tax documents
     */
    private function getAvailableYears()
    {
        $years = [];
        $currentYear = date('Y');
        $startYear = 2020; // Adjust based on your needs

        for ($year = $currentYear; $year >= $startYear; $year--) {
            $years[] = $year;
        }

        return $years;
    }

    /**
     * Export tax documents to Excel
     */
    public function export(Request $request)
    {
        $request->validate([
            'tax_year' => 'required|integer',
            'employee_id' => 'nullable|exists:employees,id',
        ]);

        return $this->taxDocumentationService->exportTaxDocuments(
            $request->tax_year,
            $request->employee_id
        );
    }
}
