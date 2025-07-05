<?php

namespace Modules\AuditCompliance\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Modules\AuditCompliance\Domain\Models\ComplianceReport;
use Modules\AuditCompliance\Services\ComplianceReportService;

class ComplianceReportController extends Controller
{
    protected ComplianceReportService $reportService;

    public function __construct(ComplianceReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Display a listing of compliance reports.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['type', 'status', 'date_from', 'date_to', 'search']);

        $reports = $this->reportService->getAllReports($filters);

        return Inertia::render('AuditCompliance::ComplianceReports/Index', [
            'reports' => $reports,
            'filters' => $filters,
            'reportTypes' => $this->getReportTypes(),
            'statusOptions' => $this->getStatusOptions(),
        ]);
    }

    /**
     * Show the form for creating a new report.
     */
    public function create()
    {
        return Inertia::render('AuditCompliance::ComplianceReports/Create', [
            'reportTypes' => $this->getReportTypes(),
        ]);
    }

    /**
     * Store a newly created report.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string|in:audit_activity,gdpr_compliance,data_retention,user_consent,security_events',
            'description' => 'nullable|string|max:1000',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'parameters' => 'nullable|array',
        ]);

        try {
            $report = $this->reportService->generateReport($validated);

            return response()->json([
                'message' => 'Compliance report generated successfully.',
                'report' => $report,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate report: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the specified report.
     */
    public function show(ComplianceReport $report)
    {
        $report->load('generatedBy');
        $reportData = null;
        if ($report->file_path && \Storage::disk('local')->exists($report->file_path)) {
            $reportData = json_decode(\Storage::disk('local')->get($report->file_path), true);
        }
        return Inertia::render('AuditCompliance::ComplianceReports/Show', [
            'report' => $report,
            'reportData' => $reportData,
            'generatedBy' => $report->generatedBy,
            'created_at' => $report->created_at,
            'updated_at' => $report->updated_at,
            'deleted_at' => $report->deleted_at,
        ]);
    }

    /**
     * Download the report file.
     */
    public function download(ComplianceReport $report): Response
    {
        if (!$report->file_path || !Storage::disk('local')->exists($report->file_path)) {
            abort(404, 'Report file not found.');
        }

        $filename = "compliance_report_{$report->type}_" . $report->report_date->format('Y_m_d') . '.json';

        return Storage::disk('local')->download($report->file_path, $filename);
    }

    /**
     * Remove the specified report.
     */
    public function destroy(ComplianceReport $report): JsonResponse
    {
        $this->reportService->deleteReport($report);

        return response()->json([
            'message' => 'Compliance report deleted successfully.',
        ]);
    }

    /**
     * Generate a quick report.
     */
    public function quickReport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string|in:audit_activity,gdpr_compliance,data_retention,user_consent,security_events',
            'days' => 'required|integer|min:1|max:365',
        ]);

        $endDate = now();
        $startDate = $endDate->copy()->subDays($validated['days']);

        $parameters = [
            'type' => $validated['type'],
            'period_start' => $startDate->toDateString(),
            'period_end' => $endDate->toDateString(),
            'description' => "Quick {$validated['days']}-day {$validated['type']} report",
        ];

        try {
            $report = $this->reportService->generateReport($parameters);

            return response()->json([
                'message' => 'Quick report generated successfully.',
                'report' => $report,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate quick report: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get report statistics.
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_reports' => ComplianceReport::count(),
            'completed_reports' => ComplianceReport::where('status', 'completed')->count(),
            'failed_reports' => ComplianceReport::where('status', 'failed')->count(),
            'generating_reports' => ComplianceReport::where('status', 'generating')->count(),
            'reports_by_type' => ComplianceReport::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
            'recent_reports' => ComplianceReport::with('generatedBy')
                ->latest()
                ->take(5)
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Export report data as CSV.
     */
    public function exportCsv(ComplianceReport $report): Response
    {
        if (!$report->file_path || !Storage::disk('local')->exists($report->file_path)) {
            abort(404, 'Report file not found.');
        }

        $reportData = json_decode(Storage::disk('local')->get($report->file_path), true);

        $csv = $this->convertToCsv($reportData);
        $filename = "compliance_report_{$report->type}_" . $report->report_date->format('Y_m_d') . '.csv';

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Get available report types.
     */
    protected function getReportTypes(): array
    {
        return [
            'audit_activity' => 'Audit Activity Report',
            'gdpr_compliance' => 'GDPR Compliance Report',
            'data_retention' => 'Data Retention Report',
            'user_consent' => 'User Consent Report',
            'security_events' => 'Security Events Report',
        ];
    }

    /**
     * Get status options.
     */
    protected function getStatusOptions(): array
    {
        return [
            'generating' => 'Generating',
            'completed' => 'Completed',
            'failed' => 'Failed',
        ];
    }

    /**
     * Convert report data to CSV format.
     */
    protected function convertToCsv(array $data): string
    {
        $csv = "Report Summary\n";

        if (isset($data['summary'])) {
            foreach ($data['summary'] as $key => $value) {
                $csv .= "{$key}," . (is_array($value) ? json_encode($value) : $value) . "\n";
            }
        }

        $csv .= "\nDetailed Data\n";

        // Add detailed logs if available
        if (isset($data['detailed_logs'])) {
            $csv .= "ID,Event,Model,Model ID,User,IP Address,Created At\n";
            foreach ($data['detailed_logs'] as $log) {
                $csv .= "{$log['id']},{$log['event']},{$log['model']},{$log['model_id']},{$log['user']},{$log['ip_address']},{$log['created_at']}\n";
            }
        }

        return $csv;
    }
}
