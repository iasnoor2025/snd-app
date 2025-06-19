<?php

namespace Modules\Reporting\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use App\Http\Controllers\Controller;

class ReportApiController extends Controller
{
    /**
     * Get all available reports
     */
    public function index(Request $request): JsonResponse
    {
        $reports = [
            [
                'id' => 'equipment-utilization',
                'name' => 'Equipment Utilization',
                'description' => 'Monitor equipment usage and efficiency metrics',
                'category' => 'operations',
                'last_updated' => Carbon::now()->subHours(2)->toISOString(),
            ],
            [
                'id' => 'employee-productivity',
                'name' => 'Employee Productivity',
                'description' => 'Track employee performance and productivity metrics',
                'category' => 'hr',
                'last_updated' => Carbon::now()->subHours(1)->toISOString(),
            ],
            [
                'id' => 'project-performance',
                'name' => 'Project Performance',
                'description' => 'Analyze project timelines, costs, and deliverables',
                'category' => 'projects',
                'last_updated' => Carbon::now()->subMinutes(30)->toISOString(),
            ],
            [
                'id' => 'financial-summary',
                'name' => 'Financial Summary',
                'description' => 'Overview of revenue, costs, and profit margins',
                'category' => 'finance',
                'last_updated' => Carbon::now()->subMinutes(15)->toISOString(),
            ],
            [
                'id' => 'rental-overview',
                'name' => 'Rental Overview',
                'description' => 'Comprehensive rental statistics and trends',
                'category' => 'rentals',
                'last_updated' => Carbon::now()->subMinutes(10)->toISOString(),
            ],
            [
                'id' => 'maintenance-status',
                'name' => 'Maintenance Status',
                'description' => 'Equipment maintenance schedules and status',
                'category' => 'maintenance',
                'last_updated' => Carbon::now()->subMinutes(5)->toISOString(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $reports,
            'total' => count($reports),
        ]);
    }

    /**
     * Get equipment utilization report
     */
    public function equipmentUtilization(Request $request): JsonResponse
    {
        $period = $request->get('period', '30');
        $startDate = Carbon::now()->subDays($period);

        $data = Cache::remember("equipment_utilization_{$period}", 3600, function () use ($startDate) {
            // Mock data - replace with actual database queries
            return [
                'total_equipment' => 150,
                'active_rentals' => 98,
                'utilization_rate' => 65.3,
                'top_equipment' => [
                    ['name' => 'Excavator CAT 320', 'utilization' => 92.5, 'revenue' => 15000],
                    ['name' => 'Bulldozer D6T', 'utilization' => 88.2, 'revenue' => 12500],
                    ['name' => 'Crane RT-130', 'utilization' => 85.7, 'revenue' => 18000],
                ],
                'trends' => [
                    ['date' => Carbon::now()->subDays(7)->toDateString(), 'utilization' => 62.1],
                    ['date' => Carbon::now()->subDays(6)->toDateString(), 'utilization' => 64.3],
                    ['date' => Carbon::now()->subDays(5)->toDateString(), 'utilization' => 66.8],
                    ['date' => Carbon::now()->subDays(4)->toDateString(), 'utilization' => 65.2],
                    ['date' => Carbon::now()->subDays(3)->toDateString(), 'utilization' => 67.9],
                    ['date' => Carbon::now()->subDays(2)->toDateString(), 'utilization' => 63.4],
                    ['date' => Carbon::now()->subDays(1)->toDateString(), 'utilization' => 65.3],
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'period' => $period,
            'generated_at' => Carbon::now()->toISOString(),
        ]);
    }

    /**
     * Get employee productivity report
     */
    public function employeeProductivity(Request $request): JsonResponse
    {
        $period = $request->get('period', '30');
        $department = $request->get('department');

        $data = Cache::remember("employee_productivity_{$period}_{$department}", 1800, function () {
            return [
                'total_employees' => 45,
                'active_employees' => 42,
                'average_efficiency' => 87.3,
                'top_performers' => [
                    ['name' => 'Ahmed Hassan', 'efficiency' => 98.5, 'projects_completed' => 12],
                    ['name' => 'Sarah Mohammed', 'efficiency' => 96.2, 'projects_completed' => 10],
                    ['name' => 'Omar Abdullah', 'efficiency' => 94.8, 'projects_completed' => 11],
                ],
                'department_breakdown' => [
                    ['department' => 'Operations', 'efficiency' => 89.2, 'employees' => 15],
                    ['department' => 'Maintenance', 'efficiency' => 91.7, 'employees' => 12],
                    ['department' => 'Logistics', 'efficiency' => 84.3, 'employees' => 8],
                    ['department' => 'Administration', 'efficiency' => 82.1, 'employees' => 10],
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'period' => $period,
            'department' => $department,
            'generated_at' => Carbon::now()->toISOString(),
        ]);
    }

    /**
     * Get project performance report
     */
    public function projectPerformance(Request $request): JsonResponse
    {
        $status = $request->get('status');
        $period = $request->get('period', '90');

        $data = Cache::remember("project_performance_{$status}_{$period}", 1800, function () {
            return [
                'total_projects' => 28,
                'active_projects' => 18,
                'completed_projects' => 8,
                'delayed_projects' => 2,
                'on_time_delivery' => 85.7,
                'budget_variance' => -2.3,
                'recent_projects' => [
                    [
                        'name' => 'City Center Construction',
                        'progress' => 75,
                        'budget_used' => 68.5,
                        'status' => 'on_track',
                        'end_date' => Carbon::now()->addDays(45)->toDateString()
                    ],
                    [
                        'name' => 'Highway Extension',
                        'progress' => 92,
                        'budget_used' => 89.2,
                        'status' => 'nearly_complete',
                        'end_date' => Carbon::now()->addDays(15)->toDateString()
                    ],
                    [
                        'name' => 'Mall Development',
                        'progress' => 45,
                        'budget_used' => 52.1,
                        'status' => 'delayed',
                        'end_date' => Carbon::now()->addDays(90)->toDateString()
                    ],
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'status' => $status,
            'period' => $period,
            'generated_at' => Carbon::now()->toISOString(),
        ]);
    }

    /**
     * Get financial summary report
     */
    public function financialSummary(Request $request): JsonResponse
    {
        $period = $request->get('period', '30');
        $currency = $request->get('currency', 'USD');

        $data = Cache::remember("financial_summary_{$period}_{$currency}", 3600, function () {
            return [
                'total_revenue' => 485000,
                'total_expenses' => 320000,
                'net_profit' => 165000,
                'profit_margin' => 34.0,
                'rental_revenue' => 385000,
                'service_revenue' => 100000,
                'monthly_trends' => [
                    ['month' => 'Jan', 'revenue' => 420000, 'expenses' => 290000, 'profit' => 130000],
                    ['month' => 'Feb', 'revenue' => 455000, 'expenses' => 305000, 'profit' => 150000],
                    ['month' => 'Mar', 'revenue' => 485000, 'expenses' => 320000, 'profit' => 165000],
                ],
                'expense_breakdown' => [
                    ['category' => 'Equipment Maintenance', 'amount' => 120000, 'percentage' => 37.5],
                    ['category' => 'Salaries', 'amount' => 95000, 'percentage' => 29.7],
                    ['category' => 'Fuel & Transport', 'amount' => 65000, 'percentage' => 20.3],
                    ['category' => 'Administration', 'amount' => 40000, 'percentage' => 12.5],
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'period' => $period,
            'currency' => $currency,
            'generated_at' => Carbon::now()->toISOString(),
        ]);
    }

    /**
     * Get rental overview report
     */
    public function rentalOverview(Request $request): JsonResponse
    {
        $period = $request->get('period', '30');
        $category = $request->get('category');

        $data = Cache::remember("rental_overview_{$period}_{$category}", 1800, function () {
            return [
                'total_rentals' => 156,
                'active_rentals' => 98,
                'completed_rentals' => 52,
                'pending_returns' => 6,
                'average_rental_duration' => 12.5,
                'total_rental_value' => 385000,
                'popular_equipment' => [
                    ['name' => 'Excavators', 'count' => 35, 'revenue' => 125000],
                    ['name' => 'Bulldozers', 'count' => 28, 'revenue' => 98000],
                    ['name' => 'Cranes', 'count' => 22, 'revenue' => 110000],
                    ['name' => 'Loaders', 'count' => 18, 'revenue' => 52000],
                ],
                'geographic_distribution' => [
                    ['region' => 'Riyadh', 'count' => 45, 'percentage' => 28.8],
                    ['region' => 'Jeddah', 'count' => 38, 'percentage' => 24.4],
                    ['region' => 'Dammam', 'count' => 32, 'percentage' => 20.5],
                    ['region' => 'Other', 'count' => 41, 'percentage' => 26.3],
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'period' => $period,
            'category' => $category,
            'generated_at' => Carbon::now()->toISOString(),
        ]);
    }

    /**
     * Get maintenance status report
     */
    public function maintenanceStatus(Request $request): JsonResponse
    {
        $priority = $request->get('priority');
        $status = $request->get('status');

        $data = Cache::remember("maintenance_status_{$priority}_{$status}", 1800, function () {
            return [
                'total_equipment' => 150,
                'due_maintenance' => 12,
                'overdue_maintenance' => 3,
                'in_maintenance' => 8,
                'maintenance_completion_rate' => 94.2,
                'average_downtime' => 2.3,
                'upcoming_maintenance' => [
                    [
                        'equipment' => 'Excavator CAT 320 #001',
                        'type' => 'Scheduled Service',
                        'due_date' => Carbon::now()->addDays(5)->toDateString(),
                        'priority' => 'medium'
                    ],
                    [
                        'equipment' => 'Crane RT-130 #003',
                        'type' => 'Annual Inspection',
                        'due_date' => Carbon::now()->addDays(3)->toDateString(),
                        'priority' => 'high'
                    ],
                    [
                        'equipment' => 'Bulldozer D6T #002',
                        'type' => 'Oil Change',
                        'due_date' => Carbon::now()->addDays(8)->toDateString(),
                        'priority' => 'low'
                    ],
                ],
                'maintenance_costs' => [
                    ['month' => 'Jan', 'cost' => 45000],
                    ['month' => 'Feb', 'cost' => 52000],
                    ['month' => 'Mar', 'cost' => 48000],
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'priority' => $priority,
            'status' => $status,
            'generated_at' => Carbon::now()->toISOString(),
        ]);
    }

    /**
     * Export report data
     */
    public function export(Request $request): JsonResponse
    {
        $request->validate([
            'report_type' => 'required|string',
            'format' => 'required|in:excel,pdf,csv',
            'filters' => 'array',
        ]);

        $exportId = uniqid('export_');
        
        // In a real implementation, you would queue this job
        Cache::put("export_status_{$exportId}", [
            'status' => 'processing',
            'progress' => 0,
            'created_at' => Carbon::now()->toISOString(),
        ], 3600);

        // Simulate processing
        Cache::put("export_status_{$exportId}", [
            'status' => 'completed',
            'progress' => 100,
            'file_url' => "/exports/{$exportId}.{$request->format}",
            'created_at' => Carbon::now()->toISOString(),
            'completed_at' => Carbon::now()->addSeconds(30)->toISOString(),
        ], 3600);

        return response()->json([
            'success' => true,
            'export_id' => $exportId,
            'message' => 'Export queued successfully',
        ]);
    }

    /**
     * Get export status
     */
    public function exportStatus(string $id): JsonResponse
    {
        $status = Cache::get("export_status_{$id}");

        if (!$status) {
            return response()->json([
                'success' => false,
                'message' => 'Export not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $status,
        ]);
    }

    /**
     * Download export file
     */
    public function downloadExport(string $id): JsonResponse
    {
        $status = Cache::get("export_status_{$id}");

        if (!$status || $status['status'] !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Export not ready for download',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'download_url' => $status['file_url'],
            'expires_at' => Carbon::now()->addHours(24)->toISOString(),
        ]);
    }
} 