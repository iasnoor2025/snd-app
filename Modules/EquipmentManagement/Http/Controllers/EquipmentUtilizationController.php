<?php
namespace Modules\EquipmentManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\EquipmentUtilizationLog;
use Modules\EquipmentManagement\Services\UtilizationTrackingService;
use Modules\EquipmentManagement\Services\UtilizationAnalyticsService;
use Modules\EquipmentManagement\Http\Requests\EquipmentUtilizationRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EquipmentUtilizationController extends Controller
{
    protected $trackingService;
    protected $analyticsService;

    /**
     * Create a new controller instance.
     *
     * @param UtilizationTrackingService $trackingService
     * @param UtilizationAnalyticsService $analyticsService
     * @return void
     */
    public function __construct(
        UtilizationTrackingService $trackingService,
        UtilizationAnalyticsService $analyticsService
    ) {
        $this->trackingService = $trackingService;
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get utilization logs for an equipment.
     *
     * @param Request $request
     * @param int $equipmentId
     * @return JsonResponse
     */
    public function getLogs(Request $request, int $equipmentId): JsonResponse
    {
        // Validate input
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|string',
        ]);

        // Get equipment
        $equipment = Equipment::findOrFail($equipmentId);

        // Build query
        $query = $equipment->utilizationLogs();

        // Apply filters
        if ($request->has('start_date')) {
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date', now());
            $query->inDateRange($startDate, $endDate);
        }

        if ($request->has('status')) {
            $query->withStatus($request->input('status'));
        }

        // Get results
        $logs = $query->orderBy('start_time', 'desc')->paginate(20);

        return response()->json($logs);
    }

    /**
     * Start equipment utilization.
     *
     * @param EquipmentUtilizationRequest $request
     * @param int $equipmentId
     * @return JsonResponse
     */
    public function startUtilization(EquipmentUtilizationRequest $request, int $equipmentId): JsonResponse
    {
        $validatedData = $request->validated();
        $userId = auth()->id();

        // Start utilization
        $utilizationLog = $this->trackingService->startUtilization($equipmentId, $validatedData, $userId);

        return response()->json([
            'message' => 'Equipment utilization started successfully',
            'utilization_log' => $utilizationLog,
        ], 201);
    }

    /**
     * End equipment utilization.
     *
     * @param Request $request
     * @param int $logId
     * @return JsonResponse
     */
    public function endUtilization(Request $request, int $logId): JsonResponse
    {
        // Validate input
        $validatedData = $request->validate([
            'end_time' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
            'equipment_status' => 'nullable|string|in:available,maintenance,retired',
        ]);

        $userId = auth()->id();

        // End utilization
        $utilizationLog = $this->trackingService->endUtilization($logId, $validatedData, $userId);

        if (!$utilizationLog) {
            return response()->json([
                'message' => 'Utilization log not found or already ended',
            ], 404);
        }

        return response()->json([
            'message' => 'Equipment utilization ended successfully',
            'utilization_log' => $utilizationLog,
        ]);
    }

    /**
     * Update utilization log status.
     *
     * @param Request $request
     * @param int $logId
     * @return JsonResponse
     */
    public function updateStatus(Request $request, int $logId): JsonResponse
    {
        // Validate input
        $validatedData = $request->validate([
            'status' => 'required|string|in:active,idle,standby,maintenance',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Update status
        $utilizationLog = $this->trackingService->updateStatus(
            $logId,
            $validatedData['status'],
            $validatedData['notes'] ?? null
        );

        return response()->json([
            'message' => 'Utilization status updated successfully',
            'utilization_log' => $utilizationLog,
        ]);
    }

    /**
     * Get utilization data for an equipment.
     *
     * @param Request $request
     * @param int $equipmentId
     * @return JsonResponse
     */
    public function getUtilizationData(Request $request, int $equipmentId): JsonResponse
    {
        // Validate input
        $validatedData = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        // Get utilization data
        $utilizationData = $this->trackingService->getEquipmentUtilization(
            $equipmentId,
            $validatedData['start_date'],
            $validatedData['end_date']
        );

        return response()->json($utilizationData);
    }

    /**
     * Get utilization patterns for an equipment.
     *
     * @param Request $request
     * @param int $equipmentId
     * @return JsonResponse
     */
    public function getUtilizationPatterns(Request $request, int $equipmentId): JsonResponse
    {
        // Validate input
        $request->validate([
            'pattern_type' => 'nullable|string|in:daily,weekly,monthly,seasonal'
        ]);

        // Get equipment
        $equipment = Equipment::findOrFail($equipmentId);

        // Build query
        $query = $equipment->utilizationPatterns();

        // Apply filter
        if ($request->has('pattern_type')) {
            $query->where('pattern_type', $request->input('pattern_type'));
        }

        // Get results
        $patterns = $query->orderBy('period_end', 'desc')->get();

        return response()->json($patterns);
    }

    /**
     * Generate utilization patterns for an equipment.
     *
     * @param Request $request
     * @param int $equipmentId
     * @return JsonResponse
     */
    public function generatePatterns(Request $request, int $equipmentId): JsonResponse
    {
        // Validate input
        $validatedData = $request->validate([
            'pattern_type' => 'required|string|in:daily,weekly,monthly,seasonal,all',
            'force' => 'nullable|boolean',
        ]);

        $patternType = $validatedData['pattern_type'];
        $force = $validatedData['force'] ?? false;

        // Generate patterns
        $patterns = [];

        if ($patternType === 'all' || $patternType === 'daily') {
            $patterns['daily'] = $this->analyticsService->generateDailyPatterns($equipmentId);
        }

        if ($patternType === 'all' || $patternType === 'weekly') {
            $patterns['weekly'] = $this->analyticsService->generateWeeklyPatterns($equipmentId);
        }

        if ($patternType === 'all' || $patternType === 'monthly') {
            $patterns['monthly'] = $this->analyticsService->generateMonthlyPatterns($equipmentId);
        }

        if ($patternType === 'all' || $patternType === 'seasonal') {
            $patterns['seasonal'] = $this->analyticsService->generateSeasonalPatterns($equipmentId);
        }

        // Update equipment utilization statistics
        $equipment = Equipment::findOrFail($equipmentId);
        $equipment->updateUtilizationStatistics();

        return response()->json([
            'message' => 'Utilization patterns generated successfully',
            'patterns' => $patterns,
        ]);
    }

    /**
     * Analyze utilization trends for an equipment.
     *
     * @param Request $request
     * @param int $equipmentId
     * @return JsonResponse
     */
    public function analyzeUtilizationTrends(Request $request, int $equipmentId): JsonResponse
    {
        // Validate input
        $validatedData = $request->validate([
            'months' => 'nullable|integer|min:1|max:36'
        ]);

        $months = $validatedData['months'] ?? 12;

        // Analyze trends
        $trends = $this->analyticsService->analyzeUtilizationTrends($equipmentId, $months);

        return response()->json($trends);
    }

    /**
     * Identify idle periods for an equipment.
     *
     * @param Request $request
     * @param int $equipmentId
     * @return JsonResponse
     */
    public function identifyIdlePeriods(Request $request, int $equipmentId): JsonResponse
    {
        // Validate input
        $validatedData = $request->validate([
            'days' => 'nullable|integer|min:1|max:365'
        ]);

        $days = $validatedData['days'] ?? 30;

        // Get equipment
        $equipment = Equipment::findOrFail($equipmentId);

        // Identify idle periods
        $idlePeriods = $equipment->identifyIdlePeriods($days);

        return response()->json([
            'equipment_id' => $equipmentId,
            'days_analyzed' => $days,
            'idle_periods' => $idlePeriods,
            'idle_periods_count' => count($idlePeriods),
            'total_idle_hours' => collect($idlePeriods)->sum('duration_hours'),
        ]);
    }

    /**
     * Get active utilization logs.
     *
     * @return JsonResponse
     */
    public function getActiveUtilizationLogs(): JsonResponse
    {
        $activeLogs = $this->trackingService->getActiveUtilizationLogs();

        return response()->json($activeLogs);
    }
}


