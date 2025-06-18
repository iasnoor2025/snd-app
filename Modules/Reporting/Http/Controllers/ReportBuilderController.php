<?php

namespace Modules\Reporting\Http\Controllers;

use Modules\Reporting\Domain\Models\Report;
use Modules\Reporting\Domain\Models\ReportTemplate;
use Modules\Core\Domain\Models\User;
use App\Services\ReportBuilderService;
use App\Services\ReportExportService;
use App\Services\ScheduledReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ReportBuilderController extends Controller
{
    protected ReportBuilderService $reportBuilder;
    protected ReportExportService $reportExport;
    protected ScheduledReportService $scheduledReport;

    public function __construct(
        ReportBuilderService $reportBuilder,
        ReportExportService $reportExport,
        ScheduledReportService $scheduledReport
    ) {
        $this->reportBuilder = $reportBuilder;
        $this->reportExport = $reportExport;
        $this->scheduledReport = $scheduledReport;
    }

    /**
     * Display the report builder interface.
     */
    public function index()
    {
        // Get saved templates accessible by the user
        $templates = ReportTemplate::accessibleBy(Auth::user())
            ->latest()
            ->get();

        // Get data sources and their available columns
        $dataSources = $this->reportBuilder->getDataSources();
        $columns = [];

        foreach (array_keys($dataSources) as $source) {
            $columns[$source] = $this->reportBuilder->getColumnsForDataSource($source);
        }

        // Get available aggregation functions
        $aggregationFunctions = $this->reportBuilder->getAggregationFunctions();

        // Get available filter operators
        $filterOperators = $this->reportBuilder->getFilterOperators();

        // Get available visualization types
        $visualizationTypes = $this->reportBuilder->getVisualizationTypes();

        // Get available export formats
        $exportFormats = $this->reportExport->getFormats();

        // Get scheduling options
        $scheduleFrequencies = $this->scheduledReport->getFrequencies();
        $daysOfWeek = $this->scheduledReport->getDaysOfWeek();
        $daysOfMonth = $this->scheduledReport->getDaysOfMonth();
        $times = $this->scheduledReport->getTimes();

        // Get potential recipients
        $recipients = User::where('id', '!=', Auth::id())
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Reports/Builder', [
            'templates' => $templates,
            'dataSources' => array_map(fn ($model) => class_basename($model), $dataSources),
            'columns' => $columns,
            'aggregationFunctions' => $aggregationFunctions,
            'filterOperators' => $filterOperators,
            'visualizationTypes' => $visualizationTypes,
            'exportFormats' => $exportFormats,
            'scheduleFrequencies' => $scheduleFrequencies,
            'daysOfWeek' => $daysOfWeek,
            'daysOfMonth' => $daysOfMonth,
            'times' => $times,
            'recipients' => $recipients,
        ]);
    }

    /**
     * Generate a report based on the provided parameters.
     */
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'data_source' => 'required|string',
            'columns' => 'required|array',
            'filters' => 'nullable|array',
            'group_by' => 'nullable|string',
            'aggregations' => 'nullable|array',
            'sort_by' => 'nullable|string',
            'sort_direction' => 'nullable|in:asc,desc',
            'limit' => 'nullable|integer|min:1|max:1000',
            'visualization_type' => 'nullable|string',
            'report_name' => 'nullable|string|max:255',
        ]);

        // Generate the report
        $results = $this->reportBuilder->generateReport($validated);

        if (!$results['success']) {
            return response()->json([
                'success' => false,
                'message' => $results['message'] ?? 'Failed to generate report'
            ], 400);
        }

        return response()->json($results);
    }

    /**
     * Save a report as a template.
     */
    public function saveTemplate(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'data_source' => 'required|string',
            'columns' => 'required|array',
            'filters' => 'nullable|array',
            'group_by' => 'nullable|string',
            'aggregations' => 'nullable|array',
            'sort_by' => 'nullable|string',
            'sort_direction' => 'nullable|in:asc,desc',
            'limit' => 'nullable|integer|min:1|max:1000',
            'visualization_type' => 'nullable|string',
            'is_public' => 'nullable|boolean',
        ]);

        // Convert to the format expected by the service
        $params = $validated;
        $params['template_name'] = $validated['name'];
        $params['template_description'] = $validated['description'] ?? null;
        $params['save_as_template'] = true;

        try {
            $template = $this->reportBuilder->saveAsTemplate($params);

            return response()->json([
                'success' => true,
                'template' => $template,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save template: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Schedule a report for later execution.
     */
    public function scheduleReport(Request $request)
    {
        $validated = $request->validate([
            'report_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'template_id' => 'nullable|exists:report_templates,id',
            'data_source' => 'required|string',
            'columns' => 'required|array',
            'filters' => 'nullable|array',
            'group_by' => 'nullable|string',
            'aggregations' => 'nullable|array',
            'sort_by' => 'nullable|string',
            'sort_direction' => 'nullable|in:asc,desc',
            'limit' => 'nullable|integer|min:1|max:1000',
            'visualization_type' => 'nullable|string',
            'format' => 'required|string|in:html,pdf,csv,xlsx,json',
            'schedule.frequency' => 'required|string|in:once,daily,weekly,monthly',
            'schedule.date' => 'required_if:schedule.frequency,once|nullable|date',
            'schedule.time' => 'required|string',
            'schedule.day_of_week' => 'required_if:schedule.frequency,weekly|nullable|integer|min:0|max:6',
            'schedule.day_of_month' => 'required_if:schedule.frequency,monthly|nullable|integer|min:1|max:31',
            'recipients' => 'nullable|array',
            'recipients.*' => 'exists:users,id',
        ]);

        // Extract report parameters and schedule
        $params = $request->except(['schedule', 'recipients']);
        $schedule = $request->input('schedule', []);
        $recipients = $request->input('recipients', []);

        try {
            $report = $this->scheduledReport->scheduleReport($params, $schedule, $recipients);

            return response()->json([
                'success' => true,
                'report' => $report,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to schedule report: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export a report in the specified format.
     */
    public function export(Request $request)
    {
        $validated = $request->validate([
            'data' => 'required|array',
            'format' => 'required|string|in:html,pdf,csv,xlsx,json',
            'filename' => 'nullable|string',
        ]);

        try {
            return $this->reportExport->export(
                $validated['data'],
                $validated['format'],
                $validated['filename'] ?? null
            );
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export report: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display a listing of templates.
     */
    public function templates()
    {
        $templates = ReportTemplate::accessibleBy(Auth::user())
            ->with('user')
            ->latest()
            ->paginate(10);

        return Inertia::render('Reports/Templates', [
            'templates' => $templates,
        ]);
    }

    /**
     * Display a listing of scheduled reports.
     */
    public function scheduledReports()
    {
        $reports = Report::where('user_id', Auth::id())
            ->with('template', 'user')
            ->latest()
            ->paginate(10);

        return Inertia::render('Reports/Scheduled', [
            'reports' => $reports,
        ]);
    }

    /**
     * Display a specific report.
     */
    public function show(Report $report)
    {
        if ($report->user_id !== Auth::id()) {
            Gate::authorize('viewAnyReport');
        }

        return Inertia::render('Reports/Show', [
            'report' => $report->load('template', 'user'),
        ]);
    }

    /**
     * Delete a template.
     */
    public function destroyTemplate(ReportTemplate $template)
    {
        if ($template->user_id !== Auth::id()) {
            Gate::authorize('deleteAnyReportTemplate');
        }

        $template->delete();

        return redirect()->route('reports.templates')
            ->with('success', 'Report template deleted successfully.');
    }

    /**
     * Delete a scheduled report.
     */
    public function destroyReport(Report $report)
    {
        if ($report->user_id !== Auth::id()) {
            Gate::authorize('deleteAnyReport');
        }

        $report->delete();

        return redirect()->route('reports.scheduled')
            ->with('success', 'Scheduled report deleted successfully.');
    }
}


