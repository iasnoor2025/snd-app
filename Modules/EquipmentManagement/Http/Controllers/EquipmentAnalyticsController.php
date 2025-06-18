<?php

namespace Modules\EquipmentManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\EquipmentManagement\Domain\Models\Equipment;

class EquipmentAnalyticsController extends Controller
{
    public function dashboard()
    {
        // Generate mock analytics data for the dashboard
        $analytics = [
            'totalEquipment' => Equipment::count() ?: 50,
            'activeEquipment' => Equipment::where('status', 'active')->count() ?: 45,
            'maintenanceDue' => Equipment::where('status', 'maintenance')->count() ?: 3,
            'totalValue' => 2500000, // $2.5M
            'utilizationRate' => 87,
            'maintenanceCosts' => 125000,
            'revenueGenerated' => 450000,
            'efficiencyScore' => 92,
            'utilizationTrend' => [
                ['date' => '2024-01', 'utilization' => 85, 'revenue' => 42000, 'maintenanceCost' => 12000],
                ['date' => '2024-02', 'utilization' => 88, 'revenue' => 45000, 'maintenanceCost' => 11000],
                ['date' => '2024-03', 'utilization' => 82, 'revenue' => 41000, 'maintenanceCost' => 13000],
                ['date' => '2024-04', 'utilization' => 89, 'revenue' => 47000, 'maintenanceCost' => 10000],
                ['date' => '2024-05', 'utilization' => 91, 'revenue' => 49000, 'maintenanceCost' => 9000],
                ['date' => '2024-06', 'utilization' => 87, 'revenue' => 46000, 'maintenanceCost' => 11500],
            ],
            'categoryBreakdown' => [
                ['category' => 'Excavators', 'count' => 15, 'value' => 750000, 'utilization' => 92],
                ['category' => 'Bulldozers', 'count' => 12, 'value' => 600000, 'utilization' => 88],
                ['category' => 'Cranes', 'count' => 8, 'value' => 800000, 'utilization' => 85],
                ['category' => 'Loaders', 'count' => 10, 'value' => 350000, 'utilization' => 90],
                ['category' => 'Others', 'count' => 5, 'value' => 200000, 'utilization' => 78],
            ],
            'maintenanceSchedule' => [
                ['equipmentName' => 'CAT 320D', 'dueDate' => '2024-07-15', 'type' => 'Service', 'priority' => 'high', 'estimatedCost' => 2500],
                ['equipmentName' => 'Komatsu PC200', 'dueDate' => '2024-07-18', 'type' => 'Inspection', 'priority' => 'medium', 'estimatedCost' => 1500],
                ['equipmentName' => 'Volvo L120H', 'dueDate' => '2024-07-20', 'type' => 'Repair', 'priority' => 'low', 'estimatedCost' => 800],
            ],
            'performanceMetrics' => [
                ['equipmentId' => 1, 'name' => 'CAT 320D', 'efficiency' => 95, 'uptime' => 98, 'costPerHour' => 45, 'revenuePerHour' => 120],
                ['equipmentId' => 2, 'name' => 'Komatsu PC200', 'efficiency' => 92, 'uptime' => 96, 'costPerHour' => 42, 'revenuePerHour' => 115],
                ['equipmentId' => 3, 'name' => 'Volvo L120H', 'efficiency' => 88, 'uptime' => 94, 'costPerHour' => 38, 'revenuePerHour' => 100],
            ],
            'predictiveInsights' => [
                ['type' => 'maintenance', 'equipment' => 'CAT 320D', 'prediction' => 'Service required in 2 weeks', 'confidence' => 85, 'impact' => 'medium', 'recommendedAction' => 'Schedule preventive maintenance'],
                ['type' => 'replacement', 'equipment' => 'Old Bulldozer BD-01', 'prediction' => 'Replacement needed within 6 months', 'confidence' => 78, 'impact' => 'high', 'recommendedAction' => 'Begin procurement process'],
            ],
        ];

        return Inertia::render('EquipmentManagement::Equipment/Analytics/Dashboard', [
            'analytics' => $analytics,
        ]);
    }
}
