<?php

namespace Modules\RentalManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\RentalManagement\Services\RentalAnalyticsService;

class RentalAnalyticsController extends Controller
{
    public function __construct(
        private readonly RentalAnalyticsService $analyticsService
    ) {}

    /**
     * Display the analytics dashboard
     */
    public function index(Request $request)
    {
        $period = $request->get('period', 'month');

        $analytics = [
            'revenue' => $this->analyticsService->getRevenueAnalytics($period),
            'equipment' => $this->analyticsService->getEquipmentUtilization(),
            'customers' => $this->analyticsService->getCustomerMetrics(),
            'performance' => $this->analyticsService->getPerformanceIndicators(),
        ];

        return Inertia::render('Rental/Analytics/Dashboard', [
            'analytics' => $analytics,
            'period' => $period,
        ]);
    }
}


