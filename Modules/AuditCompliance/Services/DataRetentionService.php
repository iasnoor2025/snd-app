<?php

namespace Modules\AuditCompliance\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Modules\AuditCompliance\Domain\Models\DataRetentionPolicy;
use Modules\AuditCompliance\Domain\Models\AuditLog;

class DataRetentionService
{
    /**
     * Execute all active retention policies.
     */
    public function executeRetentionPolicies(): array
    {
        $results = [];
        $policies = DataRetentionPolicy::active()->get();

        foreach ($policies as $policy) {
            if ($policy->shouldExecute()) {
                $result = $this->executePolicy($policy);
                $results[] = $result;
                $policy->markAsExecuted();
            }
        }

        return $results;
    }

    /**
     * Execute a specific retention policy.
     */
    public function executePolicy(DataRetentionPolicy $policy): array
    {
        $result = [
            'policy_id' => $policy->id,
            'policy_name' => $policy->name,
            'data_type' => $policy->data_type,
            'cutoff_date' => $policy->getCutoffDate(),
            'records_affected' => 0,
            'success' => false,
            'error' => null,
        ];

        try {
            DB::beginTransaction();

            $recordsAffected = $this->processDataType($policy);
            $result['records_affected'] = $recordsAffected;
            $result['success'] = true;

            DB::commit();

            Log::info('Data retention policy executed successfully', $result);
        } catch (\Exception $e) {
            DB::rollBack();
            $result['error'] = $e->getMessage();
            Log::error('Data retention policy execution failed', $result);
        }

        return $result;
    }

    /**
     * Process data based on the policy data type.
     */
    protected function processDataType(DataRetentionPolicy $policy): int
    {
        $cutoffDate = $policy->getCutoffDate();
        $conditions = $policy->conditions ?? [];

        switch ($policy->data_type) {
            case 'audit_logs':
                return $this->processAuditLogs($cutoffDate, $conditions, $policy->auto_delete);

            case 'user_activity':
                return $this->processUserActivity($cutoffDate, $conditions, $policy->auto_delete);

            case 'session_data':
                return $this->processSessionData($cutoffDate, $conditions, $policy->auto_delete);

            case 'temporary_files':
                return $this->processTemporaryFiles($cutoffDate, $conditions, $policy->auto_delete);

            default:
                throw new \InvalidArgumentException("Unsupported data type: {$policy->data_type}");
        }
    }

    /**
     * Process audit logs retention.
     */
    protected function processAuditLogs(Carbon $cutoffDate, array $conditions, bool $autoDelete): int
    {
        $query = AuditLog::where('created_at', '<', $cutoffDate);

        // Apply additional conditions
        if (isset($conditions['exclude_events'])) {
            $query->whereNotIn('event', $conditions['exclude_events']);
        }

        if (isset($conditions['include_events'])) {
            $query->whereIn('event', $conditions['include_events']);
        }

        if (isset($conditions['exclude_models'])) {
            $query->whereNotIn('auditable_type', $conditions['exclude_models']);
        }

        $count = $query->count();

        if ($autoDelete && $count > 0) {
            $query->delete();
        }

        return $count;
    }

    /**
     * Process user activity retention.
     */
    protected function processUserActivity(Carbon $cutoffDate, array $conditions, bool $autoDelete): int
    {
        // This would process user activity logs if they exist
        // Implementation depends on your specific user activity tracking
        return 0;
    }

    /**
     * Process session data retention.
     */
    protected function processSessionData(Carbon $cutoffDate, array $conditions, bool $autoDelete): int
    {
        $query = DB::table('sessions')->where('last_activity', '<', $cutoffDate->timestamp);

        $count = $query->count();

        if ($autoDelete && $count > 0) {
            $query->delete();
        }

        return $count;
    }

    /**
     * Process temporary files retention.
     */
    protected function processTemporaryFiles(Carbon $cutoffDate, array $conditions, bool $autoDelete): int
    {
        $tempPath = storage_path('app/temp');

        if (!is_dir($tempPath)) {
            return 0;
        }

        $files = glob($tempPath . '/*');
        $count = 0;

        foreach ($files as $file) {
            if (is_file($file)) {
                $fileTime = Carbon::createFromTimestamp(filemtime($file));

                if ($fileTime->lt($cutoffDate)) {
                    $count++;

                    if ($autoDelete) {
                        unlink($file);
                    }
                }
            }
        }

        return $count;
    }

    /**
     * Get retention statistics.
     */
    public function getRetentionStats(): array
    {
        $policies = DataRetentionPolicy::active()->get();
        $stats = [];

        foreach ($policies as $policy) {
            $cutoffDate = $policy->getCutoffDate();
            $affectedCount = $this->getAffectedRecordsCount($policy, $cutoffDate);

            $stats[] = [
                'policy' => $policy,
                'cutoff_date' => $cutoffDate,
                'affected_records' => $affectedCount,
                'should_execute' => $policy->shouldExecute(),
            ];
        }

        return $stats;
    }

    /**
     * Get count of records that would be affected by a policy.
     */
    protected function getAffectedRecordsCount(DataRetentionPolicy $policy, Carbon $cutoffDate): int
    {
        try {
            switch ($policy->data_type) {
                case 'audit_logs':
                    return AuditLog::where('created_at', '<', $cutoffDate)->count();

                case 'session_data':
                    return DB::table('sessions')->where('last_activity', '<', $cutoffDate->timestamp)->count();

                default:
                    return 0;
            }
        } catch (\Exception $e) {
            Log::warning('Failed to get affected records count', [
                'policy_id' => $policy->id,
                'error' => $e->getMessage()
            ]);
            return 0;
        }
    }

    /**
     * Create a new retention policy.
     */
    public function createPolicy(array $data): DataRetentionPolicy
    {
        return DataRetentionPolicy::create($data);
    }

    /**
     * Update an existing retention policy.
     */
    public function updatePolicy(DataRetentionPolicy $policy, array $data): DataRetentionPolicy
    {
        $policy->update($data);
        return $policy->fresh();
    }

    /**
     * Delete a retention policy.
     */
    public function deletePolicy(DataRetentionPolicy $policy): bool
    {
        return $policy->delete();
    }
}
