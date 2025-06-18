<?php

namespace Modules\AuditCompliance\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Modules\AuditCompliance\Domain\Models\ComplianceReport;
use Modules\AuditCompliance\Domain\Models\AuditLog;
use Modules\AuditCompliance\Domain\Models\ConsentRecord;
use Modules\AuditCompliance\Domain\Models\GdprDataRequest;
use Modules\Core\Domain\Models\User;

class ComplianceReportService
{
    /**
     * Generate a compliance report.
     */
    public function generateReport(array $parameters): ComplianceReport
    {
        $reportType = $parameters['type'];
        $periodStart = Carbon::parse($parameters['period_start']);
        $periodEnd = Carbon::parse($parameters['period_end']);

        $report = ComplianceReport::create([
            'title' => $this->generateReportTitle($reportType, $periodStart, $periodEnd),
            'description' => $parameters['description'] ?? null,
            'type' => $reportType,
            'status' => 'generating',
            'report_date' => Carbon::now(),
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
            'parameters' => $parameters,
            'generated_by' => Auth::id(),
        ]);

        try {
            $reportData = $this->generateReportData($reportType, $periodStart, $periodEnd, $parameters);
            $filePath = $this->saveReportFile($report, $reportData);

            $report->update([
                'status' => 'completed',
                'findings' => $reportData['summary'],
                'file_path' => $filePath,
                'generated_at' => Carbon::now(),
            ]);
        } catch (\Exception $e) {
            $report->update([
                'status' => 'failed',
                'findings' => ['error' => $e->getMessage()],
            ]);
            throw $e;
        }

        return $report->fresh();
    }

    /**
     * Generate report data based on type.
     */
    protected function generateReportData(string $type, Carbon $periodStart, Carbon $periodEnd, array $parameters): array
    {
        switch ($type) {
            case 'audit_activity':
                return $this->generateAuditActivityReport($periodStart, $periodEnd, $parameters);

            case 'gdpr_compliance':
                return $this->generateGdprComplianceReport($periodStart, $periodEnd, $parameters);

            case 'data_retention':
                return $this->generateDataRetentionReport($periodStart, $periodEnd, $parameters);

            case 'user_consent':
                return $this->generateUserConsentReport($periodStart, $periodEnd, $parameters);

            case 'security_events':
                return $this->generateSecurityEventsReport($periodStart, $periodEnd, $parameters);

            default:
                throw new \InvalidArgumentException("Unsupported report type: {$type}");
        }
    }

    /**
     * Generate audit activity report.
     */
    protected function generateAuditActivityReport(Carbon $periodStart, Carbon $periodEnd, array $parameters): array
    {
        $auditLogs = AuditLog::whereBetween('created_at', [$periodStart, $periodEnd])
            ->with('user')
            ->get();

        $eventCounts = $auditLogs->groupBy('event')->map->count();
        $modelCounts = $auditLogs->groupBy('auditable_type')->map->count();
        $userActivity = $auditLogs->groupBy('user_id')->map->count();
        $dailyActivity = $auditLogs->groupBy(function ($log) {
            return $log->created_at->format('Y-m-d');
        })->map->count();

        $topUsers = User::whereIn('id', $userActivity->keys())
            ->get()
            ->map(function ($user) use ($userActivity) {
                return [
                    'user' => $user->name,
                    'email' => $user->email,
                    'activity_count' => $userActivity[$user->id] ?? 0,
                ];
            })
            ->sortByDesc('activity_count')
            ->take(10)
            ->values();

        return [
            'summary' => [
                'total_events' => $auditLogs->count(),
                'unique_users' => $auditLogs->pluck('user_id')->unique()->count(),
                'date_range' => [
                    'start' => $periodStart->toDateString(),
                    'end' => $periodEnd->toDateString(),
                ],
            ],
            'event_breakdown' => $eventCounts->toArray(),
            'model_breakdown' => $modelCounts->toArray(),
            'daily_activity' => $dailyActivity->toArray(),
            'top_users' => $topUsers->toArray(),
            'detailed_logs' => $auditLogs->map(function ($log) {
                return [
                    'id' => $log->id,
                    'event' => $log->event,
                    'model' => $log->auditable_type,
                    'model_id' => $log->auditable_id,
                    'user' => $log->user ? $log->user->name : 'System',
                    'ip_address' => $log->ip_address,
                    'created_at' => $log->created_at->toISOString(),
                ];
            })->toArray(),
        ];
    }

    /**
     * Generate GDPR compliance report.
     */
    protected function generateGdprComplianceReport(Carbon $periodStart, Carbon $periodEnd, array $parameters): array
    {
        $dataRequests = GdprDataRequest::whereBetween('created_at', [$periodStart, $periodEnd])->get();
        $consentRecords = ConsentRecord::whereBetween('created_at', [$periodStart, $periodEnd])->get();

        $requestsByType = $dataRequests->groupBy('type')->map->count();
        $requestsByStatus = $dataRequests->groupBy('status')->map->count();
        $overdueRequests = $dataRequests->filter->isOverdue();

        $consentsByType = $consentRecords->groupBy('consent_type')->map->count();
        $consentsByStatus = $consentRecords->groupBy('consent_given')->map->count();
        $expiredConsents = $consentRecords->filter->isExpired();

        return [
            'summary' => [
                'total_data_requests' => $dataRequests->count(),
                'overdue_requests' => $overdueRequests->count(),
                'total_consent_records' => $consentRecords->count(),
                'expired_consents' => $expiredConsents->count(),
                'compliance_score' => $this->calculateComplianceScore($dataRequests, $consentRecords),
            ],
            'data_requests' => [
                'by_type' => $requestsByType->toArray(),
                'by_status' => $requestsByStatus->toArray(),
                'overdue' => $overdueRequests->map(function ($request) {
                    return [
                        'id' => $request->id,
                        'type' => $request->type,
                        'email' => $request->subject_email,
                        'days_overdue' => $request->getDaysUntilDue() * -1,
                    ];
                })->toArray(),
            ],
            'consent_management' => [
                'by_type' => $consentsByType->toArray(),
                'by_status' => $consentsByStatus->toArray(),
                'expired' => $expiredConsents->map(function ($consent) {
                    return [
                        'id' => $consent->id,
                        'email' => $consent->email,
                        'type' => $consent->consent_type,
                        'expired_date' => $consent->expiry_date?->toDateString(),
                    ];
                })->toArray(),
            ],
        ];
    }

    /**
     * Generate data retention report.
     */
    protected function generateDataRetentionReport(Carbon $periodStart, Carbon $periodEnd, array $parameters): array
    {
        $retentionService = app(DataRetentionService::class);
        $stats = $retentionService->getRetentionStats();

        return [
            'summary' => [
                'active_policies' => count($stats),
                'total_affected_records' => array_sum(array_column($stats, 'affected_records')),
                'policies_due_execution' => count(array_filter($stats, fn($s) => $s['should_execute'])),
            ],
            'policies' => array_map(function ($stat) {
                return [
                    'name' => $stat['policy']->name,
                    'data_type' => $stat['policy']->data_type,
                    'retention_days' => $stat['policy']->retention_days,
                    'auto_delete' => $stat['policy']->auto_delete,
                    'cutoff_date' => $stat['cutoff_date']->toDateString(),
                    'affected_records' => $stat['affected_records'],
                    'should_execute' => $stat['should_execute'],
                ];
            }, $stats),
        ];
    }

    /**
     * Generate user consent report.
     */
    protected function generateUserConsentReport(Carbon $periodStart, Carbon $periodEnd, array $parameters): array
    {
        $consents = ConsentRecord::whereBetween('consent_date', [$periodStart, $periodEnd])
            ->active()
            ->get();

        $consentsByType = $consents->groupBy('consent_type');
        $consentTrends = $consents->groupBy(function ($consent) {
            return $consent->consent_date->format('Y-m-d');
        })->map->count();

        return [
            'summary' => [
                'total_consents' => $consents->count(),
                'consents_given' => $consents->where('consent_given', true)->count(),
                'consents_withdrawn' => $consents->where('consent_given', false)->count(),
                'unique_users' => $consents->pluck('email')->unique()->count(),
            ],
            'by_type' => $consentsByType->map(function ($typeConsents, $type) {
                return [
                    'type' => $type,
                    'total' => $typeConsents->count(),
                    'given' => $typeConsents->where('consent_given', true)->count(),
                    'withdrawn' => $typeConsents->where('consent_given', false)->count(),
                ];
            })->values()->toArray(),
            'daily_trends' => $consentTrends->toArray(),
        ];
    }

    /**
     * Generate security events report.
     */
    protected function generateSecurityEventsReport(Carbon $periodStart, Carbon $periodEnd, array $parameters): array
    {
        $securityEvents = AuditLog::whereBetween('created_at', [$periodStart, $periodEnd])
            ->whereIn('event', ['login', 'logout', 'failed_login', 'password_change', 'account_locked'])
            ->get();

        $eventsByType = $securityEvents->groupBy('event')->map->count();
        $eventsByIP = $securityEvents->groupBy('ip_address')->map->count();
        $suspiciousIPs = $eventsByIP->filter(function ($count) {
            return $count > 10; // Configurable threshold
        });

        return [
            'summary' => [
                'total_security_events' => $securityEvents->count(),
                'unique_ip_addresses' => $securityEvents->pluck('ip_address')->unique()->count(),
                'suspicious_ips' => $suspiciousIPs->count(),
                'failed_logins' => $securityEvents->where('event', 'failed_login')->count(),
            ],
            'events_by_type' => $eventsByType->toArray(),
            'suspicious_activity' => $suspiciousIPs->map(function ($count, $ip) {
                return [
                    'ip_address' => $ip,
                    'event_count' => $count,
                ];
            })->values()->toArray(),
        ];
    }

    /**
     * Calculate compliance score.
     */
    protected function calculateComplianceScore($dataRequests, $consentRecords): float
    {
        $totalRequests = $dataRequests->count();
        $overdueRequests = $dataRequests->filter->isOverdue()->count();
        $expiredConsents = $consentRecords->filter->isExpired()->count();
        $totalConsents = $consentRecords->count();

        if ($totalRequests === 0 && $totalConsents === 0) {
            return 100.0;
        }

        $requestScore = $totalRequests > 0 ? (($totalRequests - $overdueRequests) / $totalRequests) * 100 : 100;
        $consentScore = $totalConsents > 0 ? (($totalConsents - $expiredConsents) / $totalConsents) * 100 : 100;

        return ($requestScore + $consentScore) / 2;
    }

    /**
     * Generate report title.
     */
    protected function generateReportTitle(string $type, Carbon $periodStart, Carbon $periodEnd): string
    {
        $typeNames = [
            'audit_activity' => 'Audit Activity Report',
            'gdpr_compliance' => 'GDPR Compliance Report',
            'data_retention' => 'Data Retention Report',
            'user_consent' => 'User Consent Report',
            'security_events' => 'Security Events Report',
        ];

        $typeName = $typeNames[$type] ?? ucfirst(str_replace('_', ' ', $type));

        return "{$typeName} ({$periodStart->format('M d, Y')} - {$periodEnd->format('M d, Y')})";
    }

    /**
     * Save report file.
     */
    protected function saveReportFile(ComplianceReport $report, array $data): string
    {
        $filename = "compliance_report_{$report->id}_{$report->type}_" . Carbon::now()->format('Y_m_d_H_i_s') . '.json';
        $path = "compliance_reports/{$filename}";

        Storage::disk('local')->put($path, json_encode($data, JSON_PRETTY_PRINT));

        return $path;
    }

    /**
     * Get all reports.
     */
    public function getAllReports(array $filters = []): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $query = ComplianceReport::with('generatedBy')
            ->orderBy('created_at', 'desc');

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['date_from'])) {
            $query->where('report_date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('report_date', '<=', $filters['date_to']);
        }

        return $query->paginate(15);
    }

    /**
     * Delete a report.
     */
    public function deleteReport(ComplianceReport $report): bool
    {
        if ($report->file_path && Storage::disk('local')->exists($report->file_path)) {
            Storage::disk('local')->delete($report->file_path);
        }

        return $report->delete();
    }
}
