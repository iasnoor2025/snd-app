<?php

namespace Modules\RentalManagement\Http\Controllers;

use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ReportingDashboardController extends Controller
{
    public function index(Request $request)
    {
        // Mock analytics data for now
        $analytics = [
            'revenue' => [
                'total' => 120000,
                'average' => 10000,
                'trends' => [
                    ['month' => 'Jan', 'amount' => 9000],
                    ['month' => 'Feb', 'amount' => 11000],
                    ['month' => 'Mar', 'amount' => 12000],
                    ['month' => 'Apr', 'amount' => 13000],
                    ['month' => 'May', 'amount' => 14000],
                    ['month' => 'Jun', 'amount' => 15000],
                ],
            ],
            'equipment' => [
                'total' => 80,
                'available' => 30,
                'utilization' => 62,
            ],
            'customers' => [
                'total' => 200,
                'active' => 120,
                'top' => [
                    ['name' => 'Acme Corp', 'revenue' => 25000],
                    ['name' => 'Beta LLC', 'revenue' => 18000],
                    ['name' => 'Gamma Ltd', 'revenue' => 15000],
                ],
            ],
            'rentals' => [
                'active' => 25,
                'completed' => 200,
                'overdue' => 3,
            ],
        ];

        $leaveSummary = [
            'total_requests' => 120,
            'approved_requests' => 90,
            'pending_requests' => 20,
            'rejected_requests' => 10,
            'total_days' => 350,
            'by_leave_type' => [
                ['leave_type' => 'Annual', 'count' => 60, 'total_days' => 180],
                ['leave_type' => 'Sick', 'count' => 40, 'total_days' => 100],
                ['leave_type' => 'Unpaid', 'count' => 20, 'total_days' => 70],
            ],
            'by_status' => [
                ['status' => 'approved', 'count' => 90, 'percentage' => 75],
                ['status' => 'pending', 'count' => 20, 'percentage' => 16.7],
                ['status' => 'rejected', 'count' => 10, 'percentage' => 8.3],
            ],
            'monthly_trend' => [
                ['period' => 'Jan', 'requests' => 10, 'days' => 30],
                ['period' => 'Feb', 'requests' => 15, 'days' => 40],
                ['period' => 'Mar', 'requests' => 20, 'days' => 50],
                ['period' => 'Apr', 'requests' => 25, 'days' => 60],
                ['period' => 'May', 'requests' => 30, 'days' => 80],
                ['period' => 'Jun', 'requests' => 20, 'days' => 90],
            ],
        ];

        return Inertia::render('RentalManagement::Reporting', [
            'analytics' => $analytics,
            'leaveSummary' => $leaveSummary,
        ]);
    }
}
