<?php

namespace Modules\AuditCompliance\Console\Commands;

use Illuminate\Console\Command;
use Modules\AuditCompliance\Services\DataRetentionService;

class ExecuteDataRetentionCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'audit:execute-retention
                            {--policy= : Execute specific policy by ID}
                            {--dry-run : Show what would be deleted without actually deleting}
                            {--force : Force execution without confirmation}';

    /**
     * The console command description.
     */
    protected $description = 'Execute data retention policies to clean up old data';

    protected DataRetentionService $dataRetentionService;

    /**
     * Create a new command instance.
     */
    public function __construct(DataRetentionService $dataRetentionService)
    {
        parent::__construct();
        $this->dataRetentionService = $dataRetentionService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting data retention execution...');

        $policyId = $this->option('policy');
        $dryRun = $this->option('dry-run');
        $force = $this->option('force');

        try {
            if ($policyId) {
                return $this->executeSinglePolicy($policyId, $dryRun, $force);
            } else {
                return $this->executeAllPolicies($dryRun, $force);
            }
        } catch (\Exception $e) {
            $this->error('Error executing data retention: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Execute a single policy.
     */
    protected function executeSinglePolicy(int $policyId, bool $dryRun, bool $force): int
    {
        $policy = \Modules\AuditCompliance\Domain\Models\DataRetentionPolicy::find($policyId);

        if (!$policy) {
            $this->error("Policy with ID {$policyId} not found.");
            return 1;
        }

        if (!$policy->is_active) {
            $this->error("Policy '{$policy->name}' is not active.");
            return 1;
        }

        $this->info("Executing policy: {$policy->name}");
        $this->displayPolicyInfo($policy);

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No data will be actually deleted');
            $affectedCount = $this->getAffectedRecordsCount($policy);
            $this->info("Would affect {$affectedCount} records.");
            return 0;
        }

        if (!$force && !$this->confirm('Do you want to proceed with this policy execution?')) {
            $this->info('Operation cancelled.');
            return 0;
        }

        $result = $this->dataRetentionService->executePolicy($policy);
        $this->displayResult($result);

        return $result['success'] ? 0 : 1;
    }

    /**
     * Execute all active policies.
     */
    protected function executeAllPolicies(bool $dryRun, bool $force): int
    {
        $stats = $this->dataRetentionService->getRetentionStats();
        $policiesToExecute = array_filter($stats, fn($s) => $s['should_execute']);

        if (empty($policiesToExecute)) {
            $this->info('No policies are due for execution.');
            return 0;
        }

        $this->info('Found ' . count($policiesToExecute) . ' policies due for execution:');

        $table = [];
        $totalAffected = 0;

        foreach ($policiesToExecute as $stat) {
            $policy = $stat['policy'];
            $affected = $stat['affected_records'];
            $totalAffected += $affected;

            $table[] = [
                $policy->name,
                $policy->data_type,
                $policy->retention_days . ' days',
                $affected,
                $policy->auto_delete ? 'Yes' : 'No',
            ];
        }

        $this->table(
            ['Policy Name', 'Data Type', 'Retention', 'Affected Records', 'Auto Delete'],
            $table
        );

        $this->info("Total records that would be affected: {$totalAffected}");

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No data will be actually deleted');
            return 0;
        }

        if (!$force && !$this->confirm('Do you want to proceed with executing all due policies?')) {
            $this->info('Operation cancelled.');
            return 0;
        }

        $results = $this->dataRetentionService->executeRetentionPolicies();

        $successCount = 0;
        $failureCount = 0;

        foreach ($results as $result) {
            $this->displayResult($result);

            if ($result['success']) {
                $successCount++;
            } else {
                $failureCount++;
            }
        }

        $this->info("\nExecution Summary:");
        $this->info("- Successful: {$successCount}");

        if ($failureCount > 0) {
            $this->error("- Failed: {$failureCount}");
        }

        return $failureCount > 0 ? 1 : 0;
    }

    /**
     * Display policy information.
     */
    protected function displayPolicyInfo($policy): void
    {
        $this->info("Policy Details:");
        $this->line("- Name: {$policy->name}");
        $this->line("- Data Type: {$policy->data_type}");
        $this->line("- Retention Period: {$policy->retention_days} days");
        $this->line("- Auto Delete: " . ($policy->auto_delete ? 'Yes' : 'No'));
        $this->line("- Cutoff Date: " . $policy->getCutoffDate()->toDateString());

        if ($policy->conditions) {
            $this->line("- Conditions: " . json_encode($policy->conditions));
        }

        $this->line('');
    }

    /**
     * Display execution result.
     */
    protected function displayResult(array $result): void
    {
        $status = $result['success'] ? '✓' : '✗';
        $message = "{$status} {$result['policy_name']} ({$result['data_type']})";

        if ($result['success']) {
            $this->info("{$message} - {$result['records_affected']} records processed");
        } else {
            $this->error("{$message} - Error: {$result['error']}");
        }
    }

    /**
     * Get affected records count for a policy.
     */
    protected function getAffectedRecordsCount($policy): int
    {
        $cutoffDate = $policy->getCutoffDate();

        switch ($policy->data_type) {
            case 'audit_logs':
                return \Modules\AuditCompliance\Domain\Models\AuditLog::where('created_at', '<', $cutoffDate)->count();

            case 'session_data':
                return \Illuminate\Support\Facades\DB::table('sessions')
                    ->where('last_activity', '<', $cutoffDate->timestamp)
                    ->count();

            default:
                return 0;
        }
    }
}
