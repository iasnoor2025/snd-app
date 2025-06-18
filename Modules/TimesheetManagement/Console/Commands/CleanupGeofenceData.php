<?php

namespace Modules\TimesheetManagement\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Modules\TimesheetManagement\Models\Timesheet;
use Modules\TimesheetManagement\Models\GeofenceZone;

class CleanupGeofenceData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'geofence:cleanup
                            {--days=90 : Number of days to keep data}
                            {--dry-run : Show what would be deleted without actually deleting}
                            {--force : Force cleanup without confirmation}
                            {--type=all : Type of data to cleanup (all, locations, violations, logs)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old geofencing data to maintain database performance';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = (int) $this->option('days');
        $dryRun = $this->option('dry-run');
        $force = $this->option('force');
        $type = $this->option('type');

        $this->info("Starting geofence data cleanup (keeping last {$days} days)");

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No data will be actually deleted');
        }

        $cutoffDate = Carbon::now()->subDays($days);
        $this->info("Cutoff date: {$cutoffDate->format('Y-m-d H:i:s')}");

        // Confirm before proceeding (unless forced or dry run)
        if (!$dryRun && !$force) {
            if (!$this->confirm('This will permanently delete old geofencing data. Continue?')) {
                $this->info('Cleanup cancelled.');
                return 0;
            }
        }

        $totalDeleted = 0;

        try {
            DB::beginTransaction();

            // Cleanup based on type
            switch ($type) {
                case 'locations':
                    $totalDeleted += $this->cleanupLocationHistory($cutoffDate, $dryRun);
                    break;

                case 'violations':
                    $totalDeleted += $this->cleanupViolationLogs($cutoffDate, $dryRun);
                    break;

                case 'logs':
                    $totalDeleted += $this->cleanupAuditLogs($cutoffDate, $dryRun);
                    break;

                case 'all':
                default:
                    $totalDeleted += $this->cleanupLocationHistory($cutoffDate, $dryRun);
                    $totalDeleted += $this->cleanupViolationLogs($cutoffDate, $dryRun);
                    $totalDeleted += $this->cleanupAuditLogs($cutoffDate, $dryRun);
                    $totalDeleted += $this->cleanupOrphanedData($dryRun);
                    break;
            }

            if (!$dryRun) {
                DB::commit();
                $this->info("Cleanup completed successfully. Total records deleted: {$totalDeleted}");

                // Log the cleanup operation
                Log::info('Geofence data cleanup completed', [
                    'days_kept' => $days,
                    'cutoff_date' => $cutoffDate,
                    'type' => $type,
                    'records_deleted' => $totalDeleted,
                ]);
            } else {
                DB::rollBack();
                $this->info("DRY RUN completed. Would delete {$totalDeleted} records.");
            }

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Cleanup failed: ' . $e->getMessage());
            Log::error('Geofence cleanup failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return 1;
        }

        return 0;
    }

    /**
     * Clean up old location history data.
     */
    protected function cleanupLocationHistory(Carbon $cutoffDate, bool $dryRun): int
    {
        $this->info('Cleaning up location history...');

        // Clean up location_history JSON data from timesheets
        $query = Timesheet::where('created_at', '<', $cutoffDate)
            ->whereNotNull('location_history');

        $count = $query->count();

        if ($count > 0) {
            $this->line("Found {$count} timesheets with old location history");

            if (!$dryRun) {
                // Instead of deleting, we'll clear the location_history field
                $updated = $query->update(['location_history' => null]);
                $this->info("Cleared location history from {$updated} timesheets");
            }
        }

        return $count;
    }

    /**
     * Clean up old violation logs.
     */
    protected function cleanupViolationLogs(Carbon $cutoffDate, bool $dryRun): int
    {
        $this->info('Cleaning up violation logs...');

        // This would clean up a dedicated violations table if it existed
        // For now, we'll clean up violation-related data from timesheets
        $query = Timesheet::where('created_at', '<', $cutoffDate)
            ->where(function($q) {
                $q->where('geofence_status', 'violation')
                  ->orWhereNotNull('geofence_violations');
            });

        $count = $query->count();

        if ($count > 0) {
            $this->line("Found {$count} old violation records");

            if (!$dryRun) {
                // Clear violation data but keep the timesheet record
                $updated = $query->update([
                    'geofence_violations' => null,
                    'geofence_status' => 'unknown',
                ]);
                $this->info("Cleared violation data from {$updated} timesheets");
            }
        }

        return $count;
    }

    /**
     * Clean up old audit logs.
     */
    protected function cleanupAuditLogs(Carbon $cutoffDate, bool $dryRun): int
    {
        $this->info('Cleaning up audit logs...');

        // Clean up old GPS logs from timesheets
        $query = Timesheet::where('created_at', '<', $cutoffDate)
            ->whereNotNull('gps_logs');

        $count = $query->count();

        if ($count > 0) {
            $this->line("Found {$count} timesheets with old GPS logs");

            if (!$dryRun) {
                $updated = $query->update(['gps_logs' => null]);
                $this->info("Cleared GPS logs from {$updated} timesheets");
            }
        }

        return $count;
    }

    /**
     * Clean up orphaned data.
     */
    protected function cleanupOrphanedData(bool $dryRun): int
    {
        $this->info('Cleaning up orphaned data...');

        $totalCleaned = 0;

        // Clean up inactive geofence zones that haven't been used
        $inactiveZones = GeofenceZone::where('is_active', false)
            ->where('updated_at', '<', Carbon::now()->subDays(30))
            ->whereDoesntHave('timesheets'); // Assuming a relationship exists

        $inactiveCount = $inactiveZones->count();

        if ($inactiveCount > 0) {
            $this->line("Found {$inactiveCount} inactive, unused geofence zones");

            if (!$dryRun) {
                $deleted = $inactiveZones->delete();
                $this->info("Deleted {$deleted} inactive geofence zones");
                $totalCleaned += $deleted;
            } else {
                $totalCleaned += $inactiveCount;
            }
        }

        // Clean up timesheets with invalid geofence data
        $invalidTimesheets = Timesheet::whereNotNull('geofence_zone_id')
            ->whereDoesntHave('geofenceZone');

        $invalidCount = $invalidTimesheets->count();

        if ($invalidCount > 0) {
            $this->line("Found {$invalidCount} timesheets with invalid geofence zone references");

            if (!$dryRun) {
                $updated = $invalidTimesheets->update(['geofence_zone_id' => null]);
                $this->info("Fixed {$updated} timesheets with invalid geofence references");
            }
        }

        return $totalCleaned;
    }

    /**
     * Get database statistics before and after cleanup.
     */
    protected function showStatistics(): void
    {
        $this->info('\nDatabase Statistics:');

        $timesheetCount = Timesheet::count();
        $geofenceZoneCount = GeofenceZone::count();

        $timesheetsWithLocation = Timesheet::whereNotNull('latitude')->count();
        $timesheetsWithHistory = Timesheet::whereNotNull('location_history')->count();
        $timesheetsWithViolations = Timesheet::whereNotNull('geofence_violations')->count();

        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Timesheets', number_format($timesheetCount)],
                ['Total Geofence Zones', number_format($geofenceZoneCount)],
                ['Timesheets with Location', number_format($timesheetsWithLocation)],
                ['Timesheets with Location History', number_format($timesheetsWithHistory)],
                ['Timesheets with Violations', number_format($timesheetsWithViolations)],
            ]
        );
    }
}
