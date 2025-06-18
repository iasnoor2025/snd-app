<?php

namespace Modules\Reporting\Http\Controllers;

use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\MaintenanceHistory;
use App\Models\StockLevel;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function dashboard()
    {
        // Equipment Analytics
        $equipmentStats = [
            'total' => Equipment::count(),
            'active' => Equipment::where('status', 'active')->count(),
            'maintenance' => Equipment::where('status', 'maintenance')->count(),
            'rented' => Equipment::where('status', 'rented')->count(),
        ];

        // Maintenance Analytics
        $maintenanceStats = [
            'total' => MaintenanceHistory::count(),
            'scheduled' => MaintenanceHistory::where('status', 'scheduled')->count(),
            'completed' => MaintenanceHistory::where('status', 'completed')->count(),
            'overdue' => MaintenanceHistory::where('status', 'scheduled')
                ->where('scheduled_date', '<', now())
                ->count(),
        ];

        // Stock Analytics
        $stockStats = [
            'total_items' => StockLevel::count(),
            'low_stock' => StockLevel::where('current_stock', '<', DB::raw('minimum_stock'))->count(),
            'out_of_stock' => StockLevel::where('current_stock', 0)->count(),
            'total_value' => StockLevel::sum(DB::raw('current_stock * unit_price')),
        ];

        // Recent Stock Movements
        $recentMovements = StockMovement::with(['stockLevel', 'performer'])
            ->latest()
            ->take(5)
            ->get();

        // Upcoming Maintenance
        $upcomingMaintenance = MaintenanceHistory::with(['equipment', 'technician'])
            ->where('status', 'scheduled')
            ->where('scheduled_date', '>=', now())
            ->orderBy('scheduled_date')
            ->take(5)
            ->get();

        return Inertia::render('Analytics/Dashboard', [
            'equipmentStats' => $equipmentStats,
            'maintenanceStats' => $maintenanceStats,
            'stockStats' => $stockStats,
            'recentMovements' => $recentMovements,
            'upcomingMaintenance' => $upcomingMaintenance,
        ]);
    }

    public function equipment()
    {
        // Equipment Status Distribution
        $statusDistribution = Equipment::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        // Equipment by Category
        $categoryDistribution = Equipment::select('category', DB::raw('count(*) as count'))
            ->groupBy('category')
            ->get();

        // Maintenance Frequency
        $maintenanceFrequency = MaintenanceHistory::select(
                'equipment_id',
                DB::raw('count(*) as maintenance_count')
            )
            ->with('equipment:id,name')
            ->groupBy('equipment_id')
            ->orderByDesc('maintenance_count')
            ->take(10)
            ->get();

        return Inertia::render('Analytics/Equipment', [
            'statusDistribution' => $statusDistribution,
            'categoryDistribution' => $categoryDistribution,
            'maintenanceFrequency' => $maintenanceFrequency,
        ]);
    }

    public function maintenance()
    {
        // Maintenance by Status
        $statusDistribution = MaintenanceHistory::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        // Maintenance by Type
        $typeDistribution = MaintenanceHistory::select('type', DB::raw('count(*) as count'))
            ->groupBy('type')
            ->get();

        // Maintenance Costs
        $costAnalysis = MaintenanceHistory::select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(cost) as total_cost')
            )
            ->where('status', 'completed')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        return Inertia::render('Analytics/Maintenance', [
            'statusDistribution' => $statusDistribution,
            'typeDistribution' => $typeDistribution,
            'costAnalysis' => $costAnalysis,
        ]);
    }

    public function inventory()
    {
        // Stock Level Distribution
        $stockDistribution = StockLevel::select(
                DB::raw('CASE
                    WHEN current_stock = 0 THEN "Out of Stock"
                    WHEN current_stock < minimum_stock THEN "Low Stock"
                    WHEN current_stock >= reorder_point THEN "Adequate"
                    ELSE "Below Reorder Point"
                END as status'),
                DB::raw('count(*) as count')
            )
            ->groupBy('status')
            ->get();

        // Stock Value by Category
        $valueByCategory = StockLevel::select(
                'category',
                DB::raw('SUM(current_stock * unit_price) as total_value')
            )
            ->groupBy('category')
            ->get();

        // Stock Movement Trends
        $movementTrends = StockMovement::select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(CASE WHEN type = "in" THEN quantity ELSE 0 END) as stock_in'),
                DB::raw('SUM(CASE WHEN type = "out" THEN quantity ELSE 0 END) as stock_out')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        return Inertia::render('Analytics/Inventory', [
            'stockDistribution' => $stockDistribution,
            'valueByCategory' => $valueByCategory,
            'movementTrends' => $movementTrends,
        ]);
    }
}

