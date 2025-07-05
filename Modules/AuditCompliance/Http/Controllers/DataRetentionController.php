<?php

namespace Modules\AuditCompliance\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Modules\AuditCompliance\Domain\Models\DataRetentionPolicy;
use Modules\AuditCompliance\Services\DataRetentionService;

class DataRetentionController extends Controller
{
    protected DataRetentionService $dataRetentionService;

    public function __construct(DataRetentionService $dataRetentionService)
    {
        $this->dataRetentionService = $dataRetentionService;
    }

    /**
     * Display a listing of data retention policies.
     */
    public function index(Request $request)
    {
        $policies = DataRetentionPolicy::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('data_type', 'like', "%{$search}%");
            })
            ->when($request->data_type, function ($query, $dataType) {
                $query->where('data_type', $dataType);
            })
            ->when($request->status !== null, function ($query) use ($request) {
                $query->where('is_active', $request->status === 'active');
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $stats = $this->dataRetentionService->getRetentionStats();

        return Inertia::render('AuditCompliance::DataRetention/Index', [
            'policies' => $policies,
            'stats' => $stats,
            'filters' => $request->only(['search', 'data_type', 'status']),
            'dataTypes' => $this->getDataTypes(),
        ]);
    }

    /**
     * Show the form for creating a new policy.
     */
    public function create()
    {
        return Inertia::render('AuditCompliance::DataRetention/Create', [
            'dataTypes' => $this->getDataTypes(),
        ]);
    }

    /**
     * Store a newly created policy.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'data_type' => 'required|string|in:audit_logs,user_activity,session_data,temporary_files',
            'retention_days' => 'required|integer|min:1|max:3650',
            'auto_delete' => 'required|boolean',
            'conditions' => 'nullable|array',
            'is_active' => 'required|boolean',
        ]);

        $policy = $this->dataRetentionService->createPolicy($validated);

        return response()->json([
            'message' => 'Data retention policy created successfully.',
            'policy' => $policy,
        ], 201);
    }

    /**
     * Display the specified policy.
     */
    public function show(DataRetentionPolicy $policy)
    {
        $policy->load(['executionLogs' => function ($query) {
            $query->latest()->take(10);
        }]);
        return Inertia::render('AuditCompliance::DataRetention/Show', [
            'policy' => $policy,
            'executionLogs' => $policy->executionLogs,
            'affectedRecords' => $this->getAffectedRecordsCount($policy),
            'dataTypes' => $this->getDataTypes(),
            'created_at' => $policy->created_at,
            'updated_at' => $policy->updated_at,
            'deleted_at' => $policy->deleted_at,
        ]);
    }

    /**
     * Show the form for editing the specified policy.
     */
    public function edit(DataRetentionPolicy $policy)
    {
        $policy->load(['executionLogs' => function ($query) {
            $query->latest()->take(10);
        }]);
        return Inertia::render('AuditCompliance::DataRetention/Edit', [
            'policy' => $policy,
            'executionLogs' => $policy->executionLogs,
            'dataTypes' => $this->getDataTypes(),
            'created_at' => $policy->created_at,
            'updated_at' => $policy->updated_at,
            'deleted_at' => $policy->deleted_at,
        ]);
    }

    /**
     * Update the specified policy.
     */
    public function update(Request $request, DataRetentionPolicy $policy): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'data_type' => 'required|string|in:audit_logs,user_activity,session_data,temporary_files',
            'retention_days' => 'required|integer|min:1|max:3650',
            'auto_delete' => 'required|boolean',
            'conditions' => 'nullable|array',
            'is_active' => 'required|boolean',
        ]);

        $policy = $this->dataRetentionService->updatePolicy($policy, $validated);

        return response()->json([
            'message' => 'Data retention policy updated successfully.',
            'policy' => $policy,
        ]);
    }

    /**
     * Remove the specified policy.
     */
    public function destroy(DataRetentionPolicy $policy): JsonResponse
    {
        $this->dataRetentionService->deletePolicy($policy);

        return response()->json([
            'message' => 'Data retention policy deleted successfully.',
        ]);
    }

    /**
     * Execute a specific retention policy.
     */
    public function execute(DataRetentionPolicy $policy): JsonResponse
    {
        if (!$policy->is_active) {
            return response()->json([
                'message' => 'Cannot execute inactive policy.',
            ], 422);
        }

        $result = $this->dataRetentionService->executePolicy($policy);

        return response()->json([
            'message' => $result['success'] ? 'Policy executed successfully.' : 'Policy execution failed.',
            'result' => $result,
        ], $result['success'] ? 200 : 422);
    }

    /**
     * Execute all active retention policies.
     */
    public function executeAll(): JsonResponse
    {
        $results = $this->dataRetentionService->executeRetentionPolicies();

        $successCount = count(array_filter($results, fn($r) => $r['success']));
        $totalCount = count($results);

        return response()->json([
            'message' => "Executed {$successCount} of {$totalCount} policies successfully.",
            'results' => $results,
        ]);
    }

    /**
     * Get retention statistics.
     */
    public function stats(): JsonResponse
    {
        $stats = $this->dataRetentionService->getRetentionStats();

        return response()->json($stats);
    }

    /**
     * Get available data types.
     */
    protected function getDataTypes(): array
    {
        return [
            'audit_logs' => 'Audit Logs',
            'user_activity' => 'User Activity',
            'session_data' => 'Session Data',
            'temporary_files' => 'Temporary Files',
        ];
    }

    /**
     * Get affected records count for a policy.
     */
    protected function getAffectedRecordsCount(DataRetentionPolicy $policy): int
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
