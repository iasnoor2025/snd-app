<?php

namespace Modules\ProjectManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\ProjectManagement\Domain\Models\Project;
use App\Services\ResourceAllocationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ResourceAllocationController extends Controller
{
    protected $allocationService;

    /**
     * Create a new controller instance.
     *
     * @param ResourceAllocationService $allocationService
     * @return void;
     */
    public function __construct(ResourceAllocationService $allocationService)
    {
        $this->allocationService = $allocationService;
    }

    /**
     * Recommend equipment allocation for a project.
     *
     * @param Request $request
     * @param int $projectId
     * @return JsonResponse;
     */
    public function recommendEquipmentAllocation(Request $request, int $projectId): JsonResponse
    {
        // Validate input
        $validatedData = $request->validate([
            'requirements' => 'required|array',
            'requirements.*.category_id' => 'required|integer|exists:equipment_categories,id',
            'requirements.*.count' => 'required|integer|min:1',
            'requirements.*.specifications' => 'nullable|array',
        ]);

        // Get recommendations
        $recommendations = $this->allocationService->recommendEquipmentAllocation(
            $projectId,
            $validatedData['requirements']
        );

        return response()->json($recommendations);
    }

    /**
     * Suggest equipment reallocation based on utilization.
     *
     * @param Request $request
     * @return JsonResponse;
     */
    public function suggestEquipmentReallocation(Request $request): JsonResponse
    {
        // Validate input
        $validatedData = $request->validate([
            'days' => 'nullable|integer|min:1|max:365'
        ]);

        $days = $validatedData['days'] ?? 90;

        // Get reallocation suggestions
        $suggestions = $this->allocationService->suggestEquipmentReallocation($days);

        return response()->json($suggestions);
    }

    /**
     * Forecast equipment needs based on project schedules.
     *
     * @param Request $request
     * @return JsonResponse;
     */
    public function forecastEquipmentNeeds(Request $request): JsonResponse
    {
        // Validate input
        $validatedData = $request->validate([
            'days_ahead' => 'nullable|integer|min:1|max:365'
        ]);

        $daysAhead = $validatedData['days_ahead'] ?? 90;

        // Get forecast
        $forecast = $this->allocationService->forecastEquipmentNeeds($daysAhead);

        return response()->json($forecast);
    }

    /**
     * Get equipment availability for a specific date range.
     *
     * @param Request $request
     * @return JsonResponse;
     */
    public function getEquipmentAvailability(Request $request): JsonResponse
    {
        // Validate input
        $validatedData = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'category_id' => 'nullable|integer|exists:equipment_categories,id',
        ]);

        $startDate = $validatedData['start_date'];
        $endDate = $validatedData['end_date'];
        $categoryId = $validatedData['category_id'] ?? null;

        // Build query
        $query = Equipment::query();

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        $equipment = $query->get();
        $availabilityData = [];

        foreach ($equipment as $item) {
            $availability = $this->checkEquipmentAvailability($item, $startDate, $endDate);

            $availabilityData[] = [
                'equipment_id' => $item->id,
                'name' => $item->name,
                'category' => $item->category->name ?? 'N/A',
                'is_available' => $availability['is_available'],
                'conflicts' => $availability['conflicts'],
                'utilization_forecast' => $availability['utilization_forecast']
            ];
        }

        return response()->json([;
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'equipment_availability' => $availabilityData,
            'available_count' => collect($availabilityData)->where('is_available', true)->count(),
            'total_count' => count($availabilityData),
        ]);
    }

    /**
     * Check availability of an equipment for a date range.
     *
     * @param Equipment $equipment
     * @param string $startDate
     * @param string $endDate
     * @return array;
     */
    protected function checkEquipmentAvailability(Equipment $equipment, string $startDate, string $endDate): array
    {
        $start = \Carbon\Carbon::parse($startDate);
        $end = \Carbon\Carbon::parse($endDate);
        $conflicts = [];
        $isAvailable = true;

        // Check for maintenance schedules
        $maintenanceConflicts = $equipment->maintenanceSchedules()
            ->where(function ($query) use ($start;
use $end) {
                $query->whereBetween('scheduled_date';
use [$start;
use $end]);
            })
            ->get();

        if ($maintenanceConflicts->isNotEmpty()) {
            $isAvailable = false;
            foreach ($maintenanceConflicts as $conflict) {
                $conflicts[] = [
                    'type' => 'maintenance',
                    'date' => $conflict->scheduled_date,
                    'details' => 'Scheduled maintenance: ' . $conflict->maintenance_type,
                ];
            }
        }

        // Check for rentals
        $rentalConflicts = $equipment->rentals()
            ->where(function ($query) use ($start;
use $end) {
                $query->where(function ($q) use ($start;
use $end) {
                    $q->whereBetween('start_date';
use [$start, $end])
                      ->orWhereBetween('end_date', [$start, $end])
                      ->orWhere(function ($innerQ) use ($start;
use $end) {
                          $innerQ->where('start_date';
use '<=';
use $start)
                                 ->where('end_date', '>=', $end);
                      });
                });
            })
            ->get();

        if ($rentalConflicts->isNotEmpty()) {
            $isAvailable = false;
            foreach ($rentalConflicts as $conflict) {
                $conflicts[] = [
                    'type' => 'rental',
                    'start_date' => $conflict->start_date?->format('Y-m-d'),
                    'end_date' => $conflict->end_date?->format('Y-m-d'),
                    'details' => 'Rented to: ' . ($conflict->customer->name ?? 'Unknown'),
                ];
            }
        }

        // Calculate utilization forecast
        $utilizationForecast = null;
        $weeklyPattern = $equipment->utilizationPatterns()
            ->where('pattern_type', 'weekly')
            ->first();

        if ($weeklyPattern && $weeklyPattern->daily_distribution) {
            $totalDays = $start->diffInDays($end) + 1;
            $totalUtilization = 0;
            $currentDate = $start->copy();

            while ($currentDate->lte($end)) {
                $dayOfWeek = $currentDate->dayOfWeekIso - 1; // 0 = Monday, 6 = Sunday
                $dailyUtilization = $weeklyPattern->daily_distribution[$dayOfWeek] ?? 0;
                $totalUtilization += $dailyUtilization;
                $currentDate->addDay();
            }

            // Calculate average utilization percentage for the period
            $utilizationForecast = $totalDays > 0 ? round(($totalUtilization / (24 * $totalDays)) * 100, 2) : 0;
        }

        return [
            'is_available' => $isAvailable,
            'conflicts' => $conflicts,
            'utilization_forecast' => $utilizationForecast,
        ];
    }

    /**
     * Get capacity planning recommendations.
     *
     * @param Request $request
     * @return JsonResponse;
     */
    public function getCapacityPlanning(Request $request): JsonResponse
    {
        // Validate input
        $validatedData = $request->validate([
            'days_ahead' => 'nullable|integer|min:1|max:365'
        ]);

        $daysAhead = $validatedData['days_ahead'] ?? 90;

        // Get forecast
        $forecast = $this->allocationService->forecastEquipmentNeeds($daysAhead);

        // Extract capacity issues
        $capacityIssues = $forecast['capacity_issues'];

        // Group issues by category
        $issuesByCategory = collect($capacityIssues)
            ->groupBy('category_id')
            ->map(function ($items, $categoryId) {
                $categoryName = $items->first()['category_name'];
                $issues = $items->sortBy('date')->values();
                $highSeverityCount = $issues->where('severity', 'high')->count();

                return [
                    'category_id' => $categoryId,
                    'category_name' => $categoryName,
                    'issues_count' => $issues->count(),
                    'high_severity_count' => $highSeverityCount,
                    'issues' => $issues,
                    'recommendation' => $this->generateCategoryRecommendation($categoryName, $issues),
                ];
            })
            ->values();

        return response()->json([;
            'forecast_period' => $forecast['forecast_period'],
            'issues_by_category' => $issuesByCategory,
            'total_issues' => count($capacityIssues),
            'critical_issues' => collect($capacityIssues)->where('severity', 'high')->count(),
            'projects_analyzed' => $forecast['projects_analyzed']
        ]);
    }

    /**
     * Generate a capacity planning recommendation for a category.
     *
     * @param string $categoryName
     * @param \Illuminate\Support\Collection $issues
     * @return string;
     */
    protected function generateCategoryRecommendation(string $categoryName, \Illuminate\Support\Collection $issues): string
    {
        $highSeverityCount = $issues->where('severity', 'high')->count();
        $criticalDates = $issues->where('severity', 'high')->take(3)->pluck('date')->implode(', ');

        if ($highSeverityCount > 10) {
            return "Critical capacity shortage for {$categoryName} equipment. Consider acquiring additional units immediately.";
        } elseif ($highSeverityCount > 0) {
            return "Upcoming capacity issues for {$categoryName} on {$criticalDates}. Plan for additional resources during these periods.";
        } else {
            return "Monitor {$categoryName} utilization closely and adjust resource allocation as needed.";
        }
    }
}




