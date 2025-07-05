<?php

namespace Modules\AuditCompliance\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\AuditCompliance\Services\ComplianceService;
use Modules\AuditCompliance\Services\AuditLogService;

class ComplianceApiController extends Controller
{
    protected $complianceService;
    protected $auditLogService;

    public function __construct(ComplianceService $complianceService, AuditLogService $auditLogService)
    {
        $this->complianceService = $complianceService;
        $this->auditLogService = $auditLogService;
    }

    /**
     * Display a listing of compliance records.
     */
    public function index(Request $request): JsonResponse
    {
        $records = $this->complianceService->getComplianceRecords($request->all());

        return response()->json([
            'success' => true,
            'data' => $records,
            'message' => 'Compliance records retrieved successfully'
        ]);
    }

    /**
     * Store a newly created compliance record.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'description' => 'required|string',
            'status' => 'required|string',
            'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
            'metadata' => 'nullable|array'
        ]);

        $record = $this->complianceService->createComplianceRecord($validated);

        return response()->json([
            'success' => true,
            'data' => $record,
            'message' => 'Compliance record created successfully'
        ], 201);
    }

    /**
     * Display the specified compliance record.
     */
    public function show(string $id): JsonResponse
    {
        $record = $this->complianceService->getComplianceRecord($id);

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Compliance record not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $record,
            'message' => 'Compliance record retrieved successfully'
        ]);
    }

    /**
     * Update the specified compliance record.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'sometimes|string',
            'description' => 'sometimes|string',
            'status' => 'sometimes|string',
            'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
            'metadata' => 'nullable|array'
        ]);

        $record = $this->complianceService->updateComplianceRecord($id, $validated);

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Compliance record not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $record,
            'message' => 'Compliance record updated successfully'
        ]);
    }

    /**
     * Remove the specified compliance record.
     */
    public function destroy(string $id): JsonResponse
    {
        $deleted = $this->complianceService->deleteComplianceRecord($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Compliance record not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Compliance record deleted successfully'
        ]);
    }

    /**
     * Get compliance summary statistics.
     */
    public function summary(): JsonResponse
    {
        $summary = $this->complianceService->getComplianceSummary();

        return response()->json([
            'success' => true,
            'data' => $summary,
            'message' => 'Compliance summary retrieved successfully'
        ]);
    }

    /**
     * Get compliance dashboard data.
     */
    public function dashboard(): JsonResponse
    {
        $dashboard = $this->complianceService->getDashboardData();

        return response()->json([
            'success' => true,
            'data' => $dashboard,
            'message' => 'Compliance dashboard data retrieved successfully'
        ]);
    }

    /**
     * Generate compliance report.
     */
    public function report(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'filters' => 'nullable|array'
        ]);

        $report = $this->complianceService->generateReport($validated);

        return response()->json([
            'success' => true,
            'data' => $report,
            'message' => 'Compliance report generated successfully'
        ]);
    }
}
