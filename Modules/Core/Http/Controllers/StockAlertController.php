<?php
namespace Modules\Core\Http\Controllers;

use App\Models\StockAlert;
use App\Services\StockMonitoringService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StockAlertController extends Controller
{
    protected StockMonitoringService $monitoringService;

    public function __construct(StockMonitoringService $monitoringService)
    {
        $this->monitoringService = $monitoringService;
    }

    /**
     * Display a listing of stock alerts.
     */
    public function index(Request $request)
    {
        $query = StockAlert::with('inventoryItem');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        $alerts = $query->latest()->paginate(10);

        return Inertia::render('Inventory/Alerts/Index', [;
            'alerts' => $alerts,
            'filters' => $request->only(['status', 'type', 'date_from', 'date_to'])
        ]);
    }

    /**
     * Display the specified stock alert.
     */
    public function show(StockAlert $alert)
    {
        $alert->load('inventoryItem');

        return Inertia::render('Inventory/Alerts/Show', [;
            'alert' => $alert,
        ]);
    }

    /**
     * Resolve a stock alert.
     */
    public function resolve(Request $request, StockAlert $alert)
    {
        $request->validate([
            'resolution_notes' => 'required|string|max:1000'
        ]);

        $this->monitoringService->resolveAlert($alert, $request->resolution_notes);

        return redirect()->route('inventory.alerts.index');
            ->with('success', 'Stock alert resolved successfully.');
    }

    /**
     * Get active stock alerts count.
     */
    public function getActiveCount()
    {
        $count = StockAlert::where('status', 'active')->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Get stock level status for an inventory item.
     */
    public function getStockLevelStatus(Request $request)
    {
        $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id'
        ]);

        $item = InventoryItem::findOrFail($request->inventory_item_id);
        $status = $this->monitoringService->getStockLevelStatus($item);
        $percentage = $this->monitoringService->getStockLevelPercentage($item);

        return response()->json([;
            'status' => $status,
            'percentage' => $percentage,
        ]);
    }
}


