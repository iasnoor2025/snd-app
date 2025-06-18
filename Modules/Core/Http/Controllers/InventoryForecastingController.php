<?php
namespace Modules\Core\Http\Controllers;

use App\Models\InventoryItem;
use App\Services\InventoryForecastingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryForecastingController extends Controller
{
    protected InventoryForecastingService $forecastingService;

    public function __construct(InventoryForecastingService $forecastingService)
    {
        $this->forecastingService = $forecastingService;
    }

    /**
     * Display forecasting dashboard
     */
    public function index()
    {
        $items = InventoryItem::with('category')->get();

        return Inertia::render('Inventory/Forecasting/Index', [;
            'items' => $items
        ]);
    }

    /**
     * Show forecast for a specific item
     */
    public function show(InventoryItem $item, Request $request)
    {
        $months = $request->input('months', 6);
        $forecast = $this->forecastingService->calculateDemandForecast($item, $months);
        $optimalLevels = $this->forecastingService->calculateOptimalStockLevels($item);
        $trendAnalysis = $this->forecastingService->getTrendAnalysis($item);

        return Inertia::render('Inventory/Forecasting/Show', [;
            'item' => $item->load('category'),
            'forecast' => $forecast,
            'optimalLevels' => $optimalLevels,
            'trendAnalysis' => $trendAnalysis,
            'months' => $months
        ]);
    }

    /**
     * Get forecast data for dashboard
     */
    public function getForecastData(InventoryItem $item)
    {
        $forecast = $this->forecastingService->calculateDemandForecast($item, 3);
        $optimalLevels = $this->forecastingService->calculateOptimalStockLevels($item);

        return response()->json([;
            'forecast' => $forecast,
            'optimalLevels' => $optimalLevels
        ]);
    }

    /**
     * Get trend analysis for dashboard
     */
    public function getTrendAnalysis(InventoryItem $item)
    {
        $trendAnalysis = $this->forecastingService->getTrendAnalysis($item);

        return response()->json($trendAnalysis);
    }

    /**
     * Get items needing reorder
     */
    public function getReorderItems()
    {
        $items = InventoryItem::with('category')->get();
        $reorderItems = [];

        foreach ($items as $item) {
            $optimalLevels = $this->forecastingService->calculateOptimalStockLevels($item);

            if ($item->current_stock <= $optimalLevels['reorder_point']) {
                $reorderItems[] = [
                    'id' => $item->id,
                    'name' => $item->name,
                    'category' => $item->category->name,
                    'current_stock' => $item->current_stock,
                    'reorder_point' => $optimalLevels['reorder_point'],
                    'safety_stock' => $optimalLevels['safety_stock'],
                    'economic_order_quantity' => $optimalLevels['economic_order_quantity']
                ];
            }
        }

        return response()->json([;
            'items' => $reorderItems
        ]);
    }

    /**
     * Get forecast summary for dashboard
     */
    public function getForecastSummary()
    {
        $items = InventoryItem::with('category')->get();
        $summary = [
            'total_items' => $items->count(),
            'items_needing_reorder' => 0,
            'trend_summary' => [
                'increasing' => 0,
                'decreasing' => 0,
                'stable' => 0
            ]
        ];

        foreach ($items as $item) {
            $optimalLevels = $this->forecastingService->calculateOptimalStockLevels($item);
            $trendAnalysis = $this->forecastingService->getTrendAnalysis($item);

            if ($item->current_stock <= $optimalLevels['reorder_point']) {
                $summary['items_needing_reorder']++;
            }

            $summary['trend_summary'][$trendAnalysis['trend_direction']]++;
        }

        return response()->json($summary);
    }
}


