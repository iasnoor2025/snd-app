<?php

namespace Modules\AuditCompliance\Console\Commands;

use Illuminate\Console\Command;
use Carbon\Carbon;
use Modules\AuditCompliance\Services\ComplianceReportService;

class GenerateComplianceReportCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'audit:generate-report
                            {type : Report type (audit_activity, gdpr_compliance, data_retention, user_consent, security_events)}
                            {--period-start= : Start date for the report period (YYYY-MM-DD)}
                            {--period-end= : End date for the report period (YYYY-MM-DD)}
                            {--days= : Number of days to include in the report (alternative to period dates)}
                            {--description= : Optional description for the report}
                            {--output= : Output file path (optional)}';

    /**
     * The console command description.
     */
    protected $description = 'Generate compliance reports for audit and regulatory purposes';

    protected ComplianceReportService $reportService;

    /**
     * Create a new command instance.
     */
    public function __construct(ComplianceReportService $reportService)
    {
        parent::__construct();
        $this->reportService = $reportService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $type = $this->argument('type');

        if (!$this->isValidReportType($type)) {
            $this->error('Invalid report type. Valid types are: audit_activity, gdpr_compliance, data_retention, user_consent, security_events');
            return 1;
        }

        try {
            $parameters = $this->buildReportParameters($type);

            $this->info("Generating {$type} report...");
            $this->displayReportInfo($parameters);

            $report = $this->reportService->generateReport($parameters);

            $this->info("\n✓ Report generated successfully!");
            $this->displayReportDetails($report);

            // Output to file if requested
            if ($this->option('output')) {
                $this->outputToFile($report, $this->option('output'));
            }

            return 0;
        } catch (\Exception $e) {
            $this->error('Error generating report: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Build report parameters from command options.
     */
    protected function buildReportParameters(string $type): array
    {
        $parameters = ['type' => $type];

        // Handle date range
        if ($this->option('days')) {
            $days = (int) $this->option('days');
            $endDate = Carbon::now();
            $startDate = $endDate->copy()->subDays($days);
        } else {
            $startDate = $this->option('period-start')
                ? Carbon::parse($this->option('period-start'))
                : Carbon::now()->subDays(30);

            $endDate = $this->option('period-end')
                ? Carbon::parse($this->option('period-end'))
                : Carbon::now();
        }

        $parameters['period_start'] = $startDate->toDateString();
        $parameters['period_end'] = $endDate->toDateString();

        if ($this->option('description')) {
            $parameters['description'] = $this->option('description');
        }

        return $parameters;
    }

    /**
     * Display report information before generation.
     */
    protected function displayReportInfo(array $parameters): void
    {
        $this->info('Report Configuration:');
        $this->line('- Type: ' . $this->getReportTypeName($parameters['type']));
        $this->line('- Period: ' . $parameters['period_start'] . ' to ' . $parameters['period_end']);

        if (isset($parameters['description'])) {
            $this->line('- Description: ' . $parameters['description']);
        }

        $this->line('');
    }

    /**
     * Display report details after generation.
     */
    protected function displayReportDetails($report): void
    {
        $this->info('Report Details:');
        $this->line('- ID: ' . $report->id);
        $this->line('- Title: ' . $report->title);
        $this->line('- Status: ' . ucfirst($report->status));
        $this->line('- Generated At: ' . $report->generated_at?->format('Y-m-d H:i:s'));

        if ($report->file_path) {
            $this->line('- File Path: ' . storage_path('app/' . $report->file_path));
        }

        // Display summary findings if available
        if ($report->findings && is_array($report->findings)) {
            $this->line('');
            $this->info('Report Summary:');

            if (isset($report->findings['summary'])) {
                foreach ($report->findings['summary'] as $key => $value) {
                    $displayValue = is_array($value) ? json_encode($value) : $value;
                    $this->line('- ' . ucfirst(str_replace('_', ' ', $key)) . ': ' . $displayValue);
                }
            }
        }
    }

    /**
     * Output report to a file.
     */
    protected function outputToFile($report, string $outputPath): void
    {
        try {
            if ($report->file_path && \Illuminate\Support\Facades\Storage::disk('local')->exists($report->file_path)) {
                $content = \Illuminate\Support\Facades\Storage::disk('local')->get($report->file_path);
                file_put_contents($outputPath, $content);
                $this->info("Report exported to: {$outputPath}");
            } else {
                $this->warn('Report file not found, cannot export.');
            }
        } catch (\Exception $e) {
            $this->error('Failed to export report: ' . $e->getMessage());
        }
    }

    /**
     * Check if report type is valid.
     */
    protected function isValidReportType(string $type): bool
    {
        return in_array($type, [
            'audit_activity',
            'gdpr_compliance',
            'data_retention',
            'user_consent',
            'security_events'
        ]);
    }

    /**
     * Get human-readable report type name.
     */
    protected function getReportTypeName(string $type): string
    {
        $names = [
            'audit_activity' => 'Audit Activity Report',
            'gdpr_compliance' => 'GDPR Compliance Report',
            'data_retention' => 'Data Retention Report',
            'user_consent' => 'User Consent Report',
            'security_events' => 'Security Events Report',
        ];

        return $names[$type] ?? ucfirst(str_replace('_', ' ', $type));
    }
}
