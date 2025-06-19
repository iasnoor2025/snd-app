<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ScheduledReportService
{
    protected ReportBuilderService $reportBuilder;
    protected ReportExportService $reportExport;

    public function __construct(
        ReportBuilderService $reportBuilder,
        ReportExportService $reportExport
    ) {
        $this->reportBuilder = $reportBuilder;
        $this->reportExport = $reportExport;
    }

    /**
     * Schedule a report to run at specified intervals
     */
    public function scheduleReport(array $config): array
    {
        $schedule = [
            'id' => uniqid('schedule_'),
            'name' => $config['name'] ?? 'Scheduled Report',
            'frequency' => $config['frequency'] ?? 'daily',
            'next_run' => $this->calculateNextRun($config['frequency'] ?? 'daily'),
            'config' => $config,
            'created_at' => now(),
            'status' => 'active',
        ];

        // In a real implementation, this would be stored in the database
        Log::info('Report scheduled', $schedule);

        return $schedule;
    }

    /**
     * Execute a scheduled report
     */
    public function executeScheduledReport(array $schedule): array
    {
        try {
            $report = $this->reportBuilder->buildReport($schedule['config']);
            
            // Export if format is specified
            if (isset($schedule['config']['export_format'])) {
                $data = collect($report['data']);
                $filename = $schedule['name'] . '_' . now()->format('Y-m-d_H-i-s');
                $export = $this->reportExport->export($data, $schedule['config']['export_format'], $filename);
                
                $report['export'] = [
                    'format' => $schedule['config']['export_format'],
                    'filename' => $filename,
                    'generated_at' => now(),
                ];
            }

            // Update schedule with last run info
            $schedule['last_run'] = now();
            $schedule['next_run'] = $this->calculateNextRun($schedule['frequency']);
            $schedule['status'] = 'completed';

            Log::info('Scheduled report executed successfully', [
                'schedule_id' => $schedule['id'],
                'records_count' => count($report['data']),
            ]);

            return [
                'success' => true,
                'schedule' => $schedule,
                'report' => $report,
            ];

        } catch (\Exception $e) {
            Log::error('Scheduled report execution failed', [
                'schedule_id' => $schedule['id'],
                'error' => $e->getMessage(),
            ]);

            $schedule['status'] = 'failed';
            $schedule['last_error'] = $e->getMessage();

            return [
                'success' => false,
                'schedule' => $schedule,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get all scheduled reports
     */
    public function getScheduledReports(): Collection
    {
        // In a real implementation, this would fetch from database
        return collect([
            [
                'id' => 'schedule_1',
                'name' => 'Daily Rental Summary',
                'frequency' => 'daily',
                'next_run' => now()->addDay(),
                'status' => 'active',
                'config' => [
                    'table' => 'rentals',
                    'filters' => [
                        ['column' => 'status', 'operator' => '=', 'value' => 'active']
                    ],
                    'export_format' => 'csv',
                ],
            ],
            [
                'id' => 'schedule_2',
                'name' => 'Weekly Equipment Report',
                'frequency' => 'weekly',
                'next_run' => now()->addWeek(),
                'status' => 'active',
                'config' => [
                    'table' => 'equipment',
                    'summary_fields' => [
                        'daily_rate' => ['avg', 'min', 'max'],
                    ],
                    'export_format' => 'excel',
                ],
            ],
        ]);
    }

    /**
     * Update a scheduled report
     */
    public function updateScheduledReport(string $scheduleId, array $updates): array
    {
        // In a real implementation, this would update the database
        $schedule = $this->getScheduledReports()->firstWhere('id', $scheduleId);
        
        if (!$schedule) {
            throw new \Exception("Scheduled report not found: {$scheduleId}");
        }

        $updated = array_merge($schedule, $updates);
        $updated['updated_at'] = now();

        Log::info('Scheduled report updated', [
            'schedule_id' => $scheduleId,
            'updates' => $updates,
        ]);

        return $updated;
    }

    /**
     * Delete a scheduled report
     */
    public function deleteScheduledReport(string $scheduleId): bool
    {
        // In a real implementation, this would delete from database
        Log::info('Scheduled report deleted', ['schedule_id' => $scheduleId]);
        
        return true;
    }

    /**
     * Calculate next run time based on frequency
     */
    protected function calculateNextRun(string $frequency): Carbon
    {
        $now = now();

        switch ($frequency) {
            case 'hourly':
                return $now->addHour();
            case 'daily':
                return $now->addDay();
            case 'weekly':
                return $now->addWeek();
            case 'monthly':
                return $now->addMonth();
            case 'quarterly':
                return $now->addMonths(3);
            case 'yearly':
                return $now->addYear();
            default:
                return $now->addDay();
        }
    }

    /**
     * Get reports due for execution
     */
    public function getDueReports(): Collection
    {
        return $this->getScheduledReports()
            ->where('status', 'active')
            ->where('next_run', '<=', now());
    }

    /**
     * Process all due reports
     */
    public function processDueReports(): array
    {
        $dueReports = $this->getDueReports();
        $results = [];

        foreach ($dueReports as $schedule) {
            $results[] = $this->executeScheduledReport($schedule);
        }

        return $results;
    }

    /**
     * Get supported frequencies
     */
    public function getSupportedFrequencies(): array
    {
        return [
            'hourly' => 'Every Hour',
            'daily' => 'Daily',
            'weekly' => 'Weekly',
            'monthly' => 'Monthly',
            'quarterly' => 'Quarterly',
            'yearly' => 'Yearly',
        ];
    }
} 