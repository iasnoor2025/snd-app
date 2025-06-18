<?php

namespace Modules\TimesheetManagement\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Modules\TimesheetManagement\Models\Timesheet;
use Modules\TimesheetManagement\Services\GeofencingService;
use Modules\TimesheetManagement\Events\GeofenceViolationDetected;

class ProcessOfflineTimesheets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'geofence:process-offline
                            {--batch-size=100 : Number of timesheets to process in each batch}
                            {--max-age=24 : Maximum age in hours for offline timesheets to process}
                            {--dry-run : Show what would be processed without actually processing}
                            {--user-id= : Process offline timesheets for specific user only}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process offline timesheets and validate their geofencing data';

    protected GeofencingService $geofencingService;

    /**
     * Create a new command instance.
     */
    public function __construct(GeofencingService $geofencingService)
    {
        parent::__construct();
        $this->geofencingService = $geofencingService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $batchSize = (int) $this->option('batch-size');
        $maxAge = (int) $this->option('max-age');
        $dryRun = $this->option('dry-run');
        $userId = $this->option('user-id');

        $this->info('Starting offline timesheet processing...');

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No data will be actually processed');
        }

        $cutoffTime = Carbon::now()->subHours($maxAge);
        $this->info("Processing offline timesheets newer than: {$cutoffTime->format('Y-m-d H:i:s')}");

        try {
            $query = $this->buildQuery($cutoffTime, $userId);
            $totalCount = $query->count();

            if ($totalCount === 0) {
                $this->info('No offline timesheets found to process.');
                return 0;
            }

            $this->info("Found {$totalCount} offline timesheets to process");

            $processed = 0;
            $errors = 0;
            $violations = 0;

            $progressBar = $this->output->createProgressBar($totalCount);
            $progressBar->start();

            // Process in batches
            $query->chunk($batchSize, function ($timesheets) use (&$processed, &$errors, &$violations, $dryRun, $progressBar) {
                foreach ($timesheets as $timesheet) {
                    try {
                        $result = $this->processOfflineTimesheet($timesheet, $dryRun);

                        if ($result['success']) {
                            $processed++;
                            if ($result['has_violations']) {
                                $violations++;
                            }
                        } else {
                            $errors++;
                        }

                    } catch (\Exception $e) {
                        $errors++;
                        Log::error('Failed to process offline timesheet', [
                            'timesheet_id' => $timesheet->id,
                            'error' => $e->getMessage(),
                        ]);
                    }

                    $progressBar->advance();
                }
            });

            $progressBar->finish();
            $this->newLine(2);

            // Display results
            $this->displayResults($processed, $errors, $violations, $dryRun);

            // Log the operation
            Log::info('Offline timesheet processing completed', [
                'total_found' => $totalCount,
                'processed' => $processed,
                'errors' => $errors,
                'violations' => $violations,
                'dry_run' => $dryRun,
            ]);

        } catch (\Exception $e) {
            $this->error('Processing failed: ' . $e->getMessage());
            Log::error('Offline timesheet processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return 1;
        }

        return 0;
    }

    /**
     * Build the query for offline timesheets.
     */
    protected function buildQuery(Carbon $cutoffTime, ?string $userId)
    {
        $query = Timesheet::where('is_offline_entry', true)
            ->where('sync_status', '!=', 'synced')
            ->where('created_at', '>=', $cutoffTime)
            ->with(['employee', 'project']);

        if ($userId) {
            $query->where('employee_id', $userId);
        }

        return $query->orderBy('created_at');
    }

    /**
     * Process a single offline timesheet.
     */
    protected function processOfflineTimesheet(Timesheet $timesheet, bool $dryRun): array
    {
        $result = [
            'success' => false,
            'has_violations' => false,
            'messages' => [],
        ];

        try {
            // Validate required data
            if (!$this->validateTimesheetData($timesheet)) {
                $result['messages'][] = 'Invalid timesheet data';
                return $result;
            }

            // Process geofencing if location data is available
            if ($timesheet->latitude && $timesheet->longitude) {
                $geofenceResult = $this->processGeofencing($timesheet, $dryRun);
                $result['has_violations'] = $geofenceResult['has_violations'];
                $result['messages'] = array_merge($result['messages'], $geofenceResult['messages']);
            }

            // Validate business rules
            $validationResult = $this->validateBusinessRules($timesheet);
            if (!$validationResult['valid']) {
                $result['messages'] = array_merge($result['messages'], $validationResult['errors']);
                return $result;
            }

            // Update sync status
            if (!$dryRun) {
                $this->updateSyncStatus($timesheet, $result['has_violations']);
            }

            $result['success'] = true;
            $result['messages'][] = 'Successfully processed';

        } catch (\Exception $e) {
            $result['messages'][] = 'Processing error: ' . $e->getMessage();
            Log::error('Error processing offline timesheet', [
                'timesheet_id' => $timesheet->id,
                'error' => $e->getMessage(),
            ]);
        }

        return $result;
    }

    /**
     * Validate timesheet data.
     */
    protected function validateTimesheetData(Timesheet $timesheet): bool
    {
        // Check required fields
        if (!$timesheet->employee_id || !$timesheet->date || !$timesheet->hours_worked) {
            return false;
        }

        // Check date validity
        if ($timesheet->date > Carbon::now()->addDay()) {
            return false; // Future dates not allowed
        }

        // Check hours validity
        if ($timesheet->hours_worked <= 0 || $timesheet->hours_worked > 24) {
            return false;
        }

        return true;
    }

    /**
     * Process geofencing for the timesheet.
     */
    protected function processGeofencing(Timesheet $timesheet, bool $dryRun): array
    {
        $result = [
            'has_violations' => false,
            'messages' => [],
        ];

        try {
            // Validate location
            $validationResult = $this->geofencingService->validateLocation(
                $timesheet->latitude,
                $timesheet->longitude,
                $timesheet->employee,
                $timesheet->project_id
            );

            if (!$validationResult['compliant']) {
                $result['has_violations'] = true;
                $result['messages'][] = 'Geofence violations detected';

                // Fire violation event if not dry run
                if (!$dryRun) {
                    event(new GeofenceViolationDetected(
                        $timesheet,
                        $timesheet->employee,
                        $timesheet->project,
                        [
                            'latitude' => $timesheet->latitude,
                            'longitude' => $timesheet->longitude,
                        ],
                        $validationResult['violations'] ?? [],
                        'medium' // Default severity for offline processing
                    ));
                }
            }

            // Update timesheet with geofence data
            if (!$dryRun) {
                $timesheet->update([
                    'geofence_status' => $validationResult['compliant'] ? 'compliant' : 'violation',
                    'geofence_violations' => $validationResult['violations'] ?? null,
                    'distance_from_site' => $validationResult['distance_from_nearest_zone'] ?? null,
                ]);
            }

        } catch (\Exception $e) {
            $result['messages'][] = 'Geofencing error: ' . $e->getMessage();
            Log::error('Geofencing processing error', [
                'timesheet_id' => $timesheet->id,
                'error' => $e->getMessage(),
            ]);
        }

        return $result;
    }

    /**
     * Validate business rules.
     */
    protected function validateBusinessRules(Timesheet $timesheet): array
    {
        $errors = [];

        // Check for duplicate entries
        $duplicate = Timesheet::where('employee_id', $timesheet->employee_id)
            ->where('date', $timesheet->date)
            ->where('project_id', $timesheet->project_id)
            ->where('id', '!=', $timesheet->id)
            ->where('sync_status', 'synced')
            ->exists();

        if ($duplicate) {
            $errors[] = 'Duplicate timesheet entry detected';
        }

        // Check project assignment
        if ($timesheet->project_id && $timesheet->employee) {
            $hasAccess = $timesheet->employee->projects()->where('id', $timesheet->project_id)->exists();
            if (!$hasAccess) {
                $errors[] = 'Employee not assigned to project';
            }
        }

        // Check overtime rules
        if ($timesheet->overtime_hours > 0) {
            $regularHours = $timesheet->hours_worked - $timesheet->overtime_hours;
            if ($regularHours < 8) { // Assuming 8 hours regular before overtime
                $errors[] = 'Invalid overtime calculation';
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * Update sync status of the timesheet.
     */
    protected function updateSyncStatus(Timesheet $timesheet, bool $hasViolations): void
    {
        $status = $hasViolations ? 'synced_with_violations' : 'synced';

        $timesheet->update([
            'sync_status' => $status,
            'synced_at' => Carbon::now(),
            'sync_attempts' => ($timesheet->sync_attempts ?? 0) + 1,
        ]);
    }

    /**
     * Display processing results.
     */
    protected function displayResults(int $processed, int $errors, int $violations, bool $dryRun): void
    {
        $this->info('\nProcessing Results:');

        $this->table(
            ['Metric', 'Count'],
            [
                ['Successfully Processed', $processed],
                ['Errors', $errors],
                ['Violations Detected', $violations],
                ['Success Rate', $processed > 0 ? round(($processed / ($processed + $errors)) * 100, 2) . '%' : '0%'],
            ]
        );

        if ($violations > 0) {
            $this->warn("⚠️  {$violations} timesheets had geofence violations");
        }

        if ($errors > 0) {
            $this->error("❌ {$errors} timesheets failed to process");
        }

        if ($processed > 0 && $errors === 0) {
            $this->info('✅ All timesheets processed successfully!');
        }

        if ($dryRun) {
            $this->info('\n🔍 This was a dry run - no actual changes were made.');
        }
    }

    /**
     * Get processing statistics.
     */
    protected function getStatistics(): array
    {
        $totalOffline = Timesheet::where('is_offline_entry', true)->count();
        $pendingSync = Timesheet::where('is_offline_entry', true)
            ->where('sync_status', '!=', 'synced')
            ->count();
        $withViolations = Timesheet::where('is_offline_entry', true)
            ->where('sync_status', 'synced_with_violations')
            ->count();

        return [
            'total_offline' => $totalOffline,
            'pending_sync' => $pendingSync,
            'with_violations' => $withViolations,
        ];
    }
}
