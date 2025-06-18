<?php

namespace Modules\AuditCompliance\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Carbon\Carbon;
use Modules\AuditCompliance\Services\DataRetentionService;
use Modules\AuditCompliance\Services\GdprService;
use Modules\AuditCompliance\Services\ComplianceReportService;
use Modules\AuditCompliance\Domain\Models\GdprDataRequest;
use Modules\AuditCompliance\Domain\Models\ConsentRecord;
use Modules\Core\Domain\Models\User;

class ComplianceMonitoringJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected array $config;

    /**
     * Create a new job instance.
     */
    public function __construct(array $config = [])
    {
        $this->config = array_merge([
            'check_overdue_requests' => true,
            'check_expired_consents' => true,
            'execute_retention_policies' => false, // Usually run separately
            'generate_daily_report' => false,
            'notify_administrators' => true,
        ], $config);
    }

    /**
     * Execute the job.
     */
    public function handle(
        DataRetentionService $retentionService,
        GdprService $gdprService,
        ComplianceReportService $reportService
    ): void {
        Log::info('Starting compliance monitoring job');

        $issues = [];
        $notifications = [];

        try {
            // Check for overdue GDPR requests
            if ($this->config['check_overdue_requests']) {
                $overdueIssues = $this->checkOverdueRequests($gdprService);
                $issues = array_merge($issues, $overdueIssues);
            }

            // Check for expired consents
            if ($this->config['check_expired_consents']) {
                $consentIssues = $this->checkExpiredConsents();
                $issues = array_merge($issues, $consentIssues);
            }

            // Execute retention policies if configured
            if ($this->config['execute_retention_policies']) {
                $retentionResults = $this->executeRetentionPolicies($retentionService);
                $notifications[] = $retentionResults;
            }

            // Generate daily compliance report if configured
            if ($this->config['generate_daily_report']) {
                $reportResult = $this->generateDailyReport($reportService);
                $notifications[] = $reportResult;
            }

            // Send notifications if there are issues or if configured
            if (!empty($issues) || $this->config['notify_administrators']) {
                $this->sendNotifications($issues, $notifications);
            }

            Log::info('Compliance monitoring job completed', [
                'issues_found' => count($issues),
                'notifications_sent' => count($notifications),
            ]);
        } catch (\Exception $e) {
            Log::error('Compliance monitoring job failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Check for overdue GDPR requests.
     */
    protected function checkOverdueRequests(GdprService $gdprService): array
    {
        $overdueRequests = $gdprService->getOverdueRequests();
        $issues = [];

        foreach ($overdueRequests as $request) {
            $daysOverdue = abs($request->getDaysUntilDue());
            $issues[] = [
                'type' => 'overdue_gdpr_request',
                'severity' => $daysOverdue > 10 ? 'high' : 'medium',
                'message' => "GDPR request {$request->request_id} is {$daysOverdue} days overdue",
                'details' => [
                    'request_id' => $request->request_id,
                    'type' => $request->type,
                    'subject_email' => $request->subject_email,
                    'days_overdue' => $daysOverdue,
                    'due_date' => $request->due_date?->toDateString(),
                ],
            ];
        }

        return $issues;
    }

    /**
     * Check for expired consents.
     */
    protected function checkExpiredConsents(): array
    {
        $expiredConsents = ConsentRecord::active()
            ->expired()
            ->get();

        $issues = [];

        foreach ($expiredConsents as $consent) {
            $daysExpired = $consent->expiry_date ? Carbon::now()->diffInDays($consent->expiry_date) : 0;
            $issues[] = [
                'type' => 'expired_consent',
                'severity' => 'medium',
                'message' => "Consent for {$consent->email} ({$consent->consent_type}) has expired",
                'details' => [
                    'email' => $consent->email,
                    'consent_type' => $consent->consent_type,
                    'expiry_date' => $consent->expiry_date?->toDateString(),
                    'days_expired' => $daysExpired,
                ],
            ];
        }

        return $issues;
    }

    /**
     * Execute retention policies.
     */
    protected function executeRetentionPolicies(DataRetentionService $retentionService): array
    {
        $results = $retentionService->executeRetentionPolicies();

        $successCount = count(array_filter($results, fn($r) => $r['success']));
        $totalCount = count($results);
        $totalRecordsProcessed = array_sum(array_column($results, 'records_affected'));

        return [
            'type' => 'retention_execution',
            'message' => "Executed {$successCount}/{$totalCount} retention policies",
            'details' => [
                'successful_policies' => $successCount,
                'total_policies' => $totalCount,
                'records_processed' => $totalRecordsProcessed,
                'results' => $results,
            ],
        ];
    }

    /**
     * Generate daily compliance report.
     */
    protected function generateDailyReport(ComplianceReportService $reportService): array
    {
        try {
            $parameters = [
                'type' => 'gdpr_compliance',
                'period_start' => Carbon::yesterday()->toDateString(),
                'period_end' => Carbon::today()->toDateString(),
                'description' => 'Automated daily compliance monitoring report',
            ];

            $report = $reportService->generateReport($parameters);

            return [
                'type' => 'daily_report',
                'message' => 'Daily compliance report generated successfully',
                'details' => [
                    'report_id' => $report->id,
                    'report_title' => $report->title,
                    'status' => $report->status,
                ],
            ];
        } catch (\Exception $e) {
            return [
                'type' => 'daily_report_error',
                'message' => 'Failed to generate daily compliance report',
                'details' => [
                    'error' => $e->getMessage(),
                ],
            ];
        }
    }

    /**
     * Send notifications to administrators.
     */
    protected function sendNotifications(array $issues, array $notifications): void
    {
        // Get administrators (users with appropriate permissions)
        $administrators = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'compliance_officer']);
        })->get();

        if ($administrators->isEmpty()) {
            Log::warning('No administrators found to send compliance notifications');
            return;
        }

        $notificationData = [
            'issues' => $issues,
            'notifications' => $notifications,
            'timestamp' => Carbon::now(),
            'summary' => $this->generateNotificationSummary($issues, $notifications),
        ];

        // Send notification to each administrator
        foreach ($administrators as $admin) {
            try {
                // You would implement your notification class here
                // Notification::send($admin, new ComplianceMonitoringNotification($notificationData));

                Log::info('Compliance notification sent', [
                    'recipient' => $admin->email,
                    'issues_count' => count($issues),
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send compliance notification', [
                    'recipient' => $admin->email,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Generate notification summary.
     */
    protected function generateNotificationSummary(array $issues, array $notifications): array
    {
        $summary = [
            'total_issues' => count($issues),
            'high_severity_issues' => count(array_filter($issues, fn($i) => ($i['severity'] ?? 'low') === 'high')),
            'overdue_requests' => count(array_filter($issues, fn($i) => $i['type'] === 'overdue_gdpr_request')),
            'expired_consents' => count(array_filter($issues, fn($i) => $i['type'] === 'expired_consent')),
            'notifications_count' => count($notifications),
        ];

        return $summary;
    }

    /**
     * Get the tags that should be assigned to the job.
     */
    public function tags(): array
    {
        return ['compliance', 'monitoring', 'audit'];
    }

    /**
     * Calculate the number of seconds to wait before retrying the job.
     */
    public function backoff(): array
    {
        return [60, 300, 900]; // 1 minute, 5 minutes, 15 minutes
    }

    /**
     * Determine the time at which the job should timeout.
     */
    public function retryUntil(): \DateTime
    {
        return now()->addHours(2);
    }
}
