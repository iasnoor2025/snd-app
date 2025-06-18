<?php

namespace Modules\RentalManagement\Services;

use Illuminate\Support\Collection;
use Modules\RentalManagement\Repositories\RentalRepository;
use Modules\RentalManagement\Repositories\RentalItemRepository;
use Carbon\Carbon;

class RentalAnalyticsService
{
    public function __construct(
        private readonly RentalRepository $rentalRepository,
        private readonly RentalItemRepository $rentalItemRepository,
        private readonly GpsTrackingService $gpsTrackingService
    ) {}

    /**
     * Get comprehensive analytics data
     */
    public function getAnalytics(string $period = 'month'): array
    {
        return [
            'revenue' => $this->getRevenueAnalytics($period),
            'equipment' => $this->getEquipmentUtilization(),
            'customers' => $this->getCustomerMetrics(),
            'performance' => $this->getPerformanceIndicators(),
            'gps_tracking' => $this->getGpsTrackingAnalytics(),
        ];
    }

    /**
     * Get revenue analytics for a specific period
     */
    public function getRevenueAnalytics(string $period = 'month'): array
    {
        $startDate = $this->getStartDate($period);
        $rentals = $this->rentalRepository->getByDateRange($startDate, now());

        return [
            'total_revenue' => $rentals->sum('total_amount'),
            'average_revenue' => $rentals->avg('total_amount'),
            'revenue_by_status' => $this->getRevenueByStatus($rentals),
            'revenue_trend' => $this->getRevenueTrend($rentals, $period),
        ];
    }

    /**
     * Get equipment utilization metrics
     */
    public function getEquipmentUtilization(): array
    {
        $rentalItems = $this->rentalItemRepository->getActiveRentals();

        return [
            'total_equipment' => $rentalItems->unique('equipment_id')->count(),
            'active_equipment' => $rentalItems->where('status', 'active')->count(),
            'utilization_rate' => $this->calculateUtilizationRate($rentalItems),
            'popular_equipment' => $this->getPopularEquipment($rentalItems),
        ];
    }

    /**
     * Get customer metrics
     */
    public function getCustomerMetrics(): array
    {
        $rentals = $this->rentalRepository->all();

        return [
            'total_customers' => $rentals->unique('customer_id')->count(),
            'active_customers' => $rentals->where('status', 'active')->unique('customer_id')->count(),
            'customer_retention' => $this->calculateCustomerRetention($rentals),
            'top_customers' => $this->getTopCustomers($rentals),
        ];
    }

    /**
     * Get performance indicators
     */
    public function getPerformanceIndicators(): array
    {
        $rentals = $this->rentalRepository->all();

        return [
            'average_rental_duration' => $this->calculateAverageRentalDuration($rentals),
            'on_time_delivery_rate' => $this->calculateOnTimeDeliveryRate($rentals),
            'customer_satisfaction' => $this->calculateCustomerSatisfaction($rentals),
            'revenue_per_equipment' => $this->calculateRevenuePerEquipment($rentals),
        ];
    }

    /**
     * Get GPS tracking analytics
     */
    private function getGpsTrackingAnalytics(): array
    {
        $trackingData = $this->gpsTrackingService->getEquipmentTrackingAnalytics();
        $realTimeData = $this->gpsTrackingService->getRealTimeTrackingData();

        return [
            'active_tracking' => [
                'count' => $trackingData['active_tracking'],
                'percentage' => $this->calculateTrackingPercentage($trackingData['active_tracking'])
            ],
            'location_history' => [
                'total_points' => count($trackingData['location_history']),
                'recent_movements' => $realTimeData['recent_movements']
            ],
            'alerts' => [
                'movement_alerts' => $trackingData['movement_alerts'],
                'geofence_violations' => $trackingData['geofence_violations'],
                'active_alerts' => $realTimeData['active_alerts']
            ],
            'equipment_locations' => $realTimeData['active_equipment']
        ];
    }

    /**
     * Calculate the percentage of equipment with active GPS tracking
     */
    private function calculateTrackingPercentage(int $activeTrackingCount): float
    {
        $totalEquipment = $this->rentalItemRepository->count();
        return $totalEquipment > 0 ? ($activeTrackingCount / $totalEquipment) * 100 : 0;
    }

    private function getStartDate(string $period): Carbon
    {
        return match($period) {
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            'quarter' => now()->subQuarter(),
            'year' => now()->subYear(),
            default => now()->subMonth(),
        };
    }

    private function getRevenueByStatus(Collection $rentals): array
    {
        return $rentals->groupBy('status')
            ->map(fn($group) => $group->sum('total_amount'))
            ->toArray();
    }

    private function getRevenueTrend(Collection $rentals, string $period): array
    {
        $grouped = $rentals->groupBy(fn($rental) => $rental->created_at->format($this->getDateFormat($period)));

        return $grouped->map(fn($group) => $group->sum('total_amount'))->toArray();
    }

    private function getDateFormat(string $period): string
    {
        return match($period) {
            'week' => 'Y-W',
            'month' => 'Y-m',
            'quarter' => 'Y-Q',
            'year' => 'Y',
            default => 'Y-m',
        };
    }

    private function calculateUtilizationRate(Collection $rentalItems): float
    {
        $totalEquipment = $rentalItems->unique('equipment_id')->count();
        if ($totalEquipment === 0) return 0;
;
        return ($rentalItems->where('status', 'active')->count() / $totalEquipment) * 100;
    }

    private function getPopularEquipment(Collection $rentalItems): array
    {
        return $rentalItems->groupBy('equipment_id')
            ->map(fn($group) => $group->count())
            ->sortDesc()
            ->take(5)
            ->toArray();
    }

    private function calculateCustomerRetention(Collection $rentals): float
    {
        $totalCustomers = $rentals->unique('customer_id')->count();
        if ($totalCustomers === 0) return 0;
;
        $returningCustomers = $rentals->groupBy('customer_id')
            ->filter(fn($group) => $group->count() > 1)
            ->count();

        return ($returningCustomers / $totalCustomers) * 100;
    }

    private function getTopCustomers(Collection $rentals): array
    {
        return $rentals->groupBy('customer_id')
            ->map(fn($group) => $group->sum('total_amount'))
            ->sortDesc()
            ->take(5)
            ->toArray();
    }

    private function calculateAverageRentalDuration(Collection $rentals): float
    {
        return $rentals->avg(fn($rental) =>
            Carbon::parse($rental->start_date)->diffInDays($rental->end_date)
        );
    }

    private function calculateOnTimeDeliveryRate(Collection $rentals): float
    {
        $totalDeliveries = $rentals->where('status', 'completed')->count();
        if ($totalDeliveries === 0) return 0;
;
        $onTimeDeliveries = $rentals->where('status', 'completed')
            ->filter(fn($rental) =>
                Carbon::parse($rental->actual_delivery_date) <= Carbon::parse($rental->expected_delivery_date)
            )
            ->count();

        return ($onTimeDeliveries / $totalDeliveries) * 100;
    }

    private function calculateCustomerSatisfaction(Collection $rentals): float
    {
        return $rentals->whereNotNull('rating')
            ->avg('rating');
    }

    private function calculateRevenuePerEquipment(Collection $rentals): float
    {
        $totalEquipment = $rentals->pluck('rentalItems')
            ->flatten()
            ->unique('equipment_id')
            ->count();

        if ($totalEquipment === 0) return 0;
;
        return $rentals->sum('total_amount') / $totalEquipment;
    }
}


