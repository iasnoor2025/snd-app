<?php

namespace Modules\CustomerManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\CustomerManagement\Services\CustomerService;
use Modules\RentalManagement\Services\RentalService;

class DashboardApiController extends Controller
{
    protected $customerService;
    protected $rentalService;

    public function __construct(CustomerService $customerService, RentalService $rentalService)
    {
        $this->customerService = $customerService;
        $this->rentalService = $rentalService;
    }

    /**
     * Get customer management dashboard data.
     */
    public function index(Request $request): JsonResponse
    {
        $dashboard = $this->customerService->getDashboardData($request->all());

        return response()->json([
            'success' => true,
            'data' => $dashboard,
            'message' => 'Customer dashboard data retrieved successfully'
        ]);
    }

    /**
     * Get customer statistics.
     */
    public function stats(Request $request): JsonResponse
    {
        $stats = $this->customerService->getCustomerStats($request->all());

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Customer statistics retrieved successfully'
        ]);
    }

    /**
     * Get recent customer activities.
     */
    public function activities(Request $request): JsonResponse
    {
        $activities = $this->customerService->getRecentActivities($request->all());

        return response()->json([
            'success' => true,
            'data' => $activities,
            'message' => 'Recent customer activities retrieved successfully'
        ]);
    }

    /**
     * Get customer revenue analytics.
     */
    public function revenue(Request $request): JsonResponse
    {
        $revenue = $this->customerService->getRevenueAnalytics($request->all());

        return response()->json([
            'success' => true,
            'data' => $revenue,
            'message' => 'Customer revenue analytics retrieved successfully'
        ]);
    }

    /**
     * Get top customers.
     */
    public function topCustomers(Request $request): JsonResponse
    {
        $topCustomers = $this->customerService->getTopCustomers($request->all());

        return response()->json([
            'success' => true,
            'data' => $topCustomers,
            'message' => 'Top customers retrieved successfully'
        ]);
    }

    /**
     * Get customer growth metrics.
     */
    public function growth(Request $request): JsonResponse
    {
        $growth = $this->customerService->getGrowthMetrics($request->all());

        return response()->json([
            'success' => true,
            'data' => $growth,
            'message' => 'Customer growth metrics retrieved successfully'
        ]);
    }

    /**
     * Get customer retention analytics.
     */
    public function retention(Request $request): JsonResponse
    {
        $retention = $this->customerService->getRetentionAnalytics($request->all());

        return response()->json([
            'success' => true,
            'data' => $retention,
            'message' => 'Customer retention analytics retrieved successfully'
        ]);
    }

    /**
     * Get customer rental overview.
     */
    public function rentals(Request $request): JsonResponse
    {
        $rentals = $this->rentalService->getCustomerRentalOverview($request->all());

        return response()->json([
            'success' => true,
            'data' => $rentals,
            'message' => 'Customer rental overview retrieved successfully'
        ]);
    }

    /**
     * Get customer payment overview.
     */
    public function payments(Request $request): JsonResponse
    {
        $payments = $this->customerService->getPaymentOverview($request->all());

        return response()->json([
            'success' => true,
            'data' => $payments,
            'message' => 'Customer payment overview retrieved successfully'
        ]);
    }

    /**
     * Get customer segmentation data.
     */
    public function segmentation(Request $request): JsonResponse
    {
        $segmentation = $this->customerService->getCustomerSegmentation($request->all());

        return response()->json([
            'success' => true,
            'data' => $segmentation,
            'message' => 'Customer segmentation data retrieved successfully'
        ]);
    }

    /**
     * Get customer satisfaction metrics.
     */
    public function satisfaction(Request $request): JsonResponse
    {
        $satisfaction = $this->customerService->getSatisfactionMetrics($request->all());

        return response()->json([
            'success' => true,
            'data' => $satisfaction,
            'message' => 'Customer satisfaction metrics retrieved successfully'
        ]);
    }

    /**
     * Get customer lifecycle analytics.
     */
    public function lifecycle(Request $request): JsonResponse
    {
        $lifecycle = $this->customerService->getLifecycleAnalytics($request->all());

        return response()->json([
            'success' => true,
            'data' => $lifecycle,
            'message' => 'Customer lifecycle analytics retrieved successfully'
        ]);
    }
}
