<?php
namespace Modules\Core\Http\Controllers;

use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\Supplier;
use App\Models\StockLevel;
use App\Models\StockMovement;
use App\Models\SupplierPerformance;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class InventoryController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $category = $request->input('category');
        $status = $request->input('status');
        $search = $request->input('search');

        $query = InventoryItem::with(['category', 'supplier']);

        if ($category) {
            $query->where('category_id', $category);
        }

        if ($status) {
            if ($status === 'low_stock') {
                $query->whereRaw('quantity_in_stock <= reorder_threshold');
            } elseif ($status === 'out_of_stock') {
                $query->where('quantity_in_stock', 0);
            } elseif ($status === 'in_stock') {
                $query->where('quantity_in_stock', '>', 0);
            }
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name';
use 'like';
use "%{$search}%")
                  ->orWhere('part_number';
use 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $inventoryItems = $query->latest()->paginate(10);
        $categories = InventoryCategory::all();

        return Inertia::render('Inventory/Index', [;
            'inventoryItems' => $inventoryItems,
            'categories' => $categories,
            'filters' => [
                'category' => $category,
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Check if user has permission to create inventory items
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager') && !$user->hasRole('inventory')) {
            return redirect()->route('inventory.index');
                ->with('error', 'You do not have permission to create inventory items.');
        }

        $categories = InventoryCategory::all();
        $suppliers = Supplier::all();

        return Inertia::render('Inventory/Create', [;
            'categories' => $categories,
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Check if user has permission to create inventory items
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager') && !$user->hasRole('inventory')) {
            return redirect()->route('inventory.index');
                ->with('error', 'You do not have permission to create inventory items.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'part_number' => 'nullable|string|max:255',
            'category_id' => 'required|exists:inventory_categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'description' => 'nullable|string',
            'unit_cost' => 'required|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'quantity_in_stock' => 'required|integer|min:0',
            'reorder_threshold' => 'required|integer|min:0',
            'reorder_quantity' => 'required|integer|min:0',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        DB::beginTransaction();

        try {
            // Create inventory item
            $inventoryItem = InventoryItem::create([
                'name' => $request->name,
                'part_number' => $request->part_number,
                'category_id' => $request->category_id,
                'supplier_id' => $request->supplier_id,
                'description' => $request->description,
                'unit_cost' => $request->unit_cost,
                'selling_price' => $request->selling_price,
                'quantity_in_stock' => $request->quantity_in_stock,
                'reorder_threshold' => $request->reorder_threshold,
                'reorder_quantity' => $request->reorder_quantity,
                'location' => $request->location,
                'notes' => $request->notes,
                'is_active' => $request->is_active ?? true,
            ]);

            // Create initial inventory transaction if quantity > 0
            if ($request->quantity_in_stock > 0) {
                InventoryTransaction::create([
                    'inventory_item_id' => $inventoryItem->id,
                    'type' => 'initial',
                    'quantity' => $request->quantity_in_stock,
                    'transaction_date' => now(),
                    'unit_cost' => $request->unit_cost,
                    'total_cost' => $request->quantity_in_stock * $request->unit_cost,
                    'created_by' => $user->id,
                    'notes' => 'Initial inventory setup',
                ]);
            }

            DB::commit();

            return redirect()->route('inventory.index');
                ->with('success', 'Inventory item created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back();
                ->with('error', 'An error occurred while creating the inventory item: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(InventoryItem $inventory)
    {
        $inventory->load(['category', 'supplier', 'transactions' => function ($query) {
            $query->latest()->take(20);
        }]);

        // Calculate statistics
        $totalIn = $inventory->transactions->where('type', 'in')->sum('quantity');
        $totalOut = $inventory->transactions->where('type', 'out')->sum('quantity');
        $totalUsed = $inventory->transactions->where('type', 'use')->sum('quantity');

        return Inertia::render('Inventory/Show', [;
            'inventoryItem' => $inventory,
            'statistics' => [
                'totalIn' => $totalIn,
                'totalOut' => $totalOut,
                'totalUsed' => $totalUsed,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(InventoryItem $inventory)
    {
        // Check if user has permission to edit inventory items
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager') && !$user->hasRole('inventory')) {
            return redirect()->route('inventory.index');
                ->with('error', 'You do not have permission to edit inventory items.');
        }

        $categories = InventoryCategory::all();
        $suppliers = Supplier::all();

        return Inertia::render('Inventory/Edit', [;
            'inventoryItem' => $inventory,
            'categories' => $categories,
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, InventoryItem $inventory)
    {
        // Check if user has permission to update inventory items
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager') && !$user->hasRole('inventory')) {
            return redirect()->route('inventory.index');
                ->with('error', 'You do not have permission to update inventory items.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'part_number' => 'nullable|string|max:255',
            'category_id' => 'required|exists:inventory_categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'description' => 'nullable|string',
            'unit_cost' => 'required|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'reorder_threshold' => 'required|integer|min:0',
            'reorder_quantity' => 'required|integer|min:0',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $inventory->update([
            'name' => $request->name,
            'part_number' => $request->part_number,
            'category_id' => $request->category_id,
            'supplier_id' => $request->supplier_id,
            'description' => $request->description,
            'unit_cost' => $request->unit_cost,
            'selling_price' => $request->selling_price,
            'reorder_threshold' => $request->reorder_threshold,
            'reorder_quantity' => $request->reorder_quantity,
            'location' => $request->location,
            'notes' => $request->notes,
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->route('inventory.index');
            ->with('success', 'Inventory item updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(InventoryItem $inventory)
    {
        // Check if user has permission to delete inventory items
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager')) {
            return redirect()->route('inventory.index');
                ->with('error', 'You do not have permission to delete inventory items.');
        }

        // Check if inventory item has transactions
        if ($inventory->transactions()->count() > 0) {
            return redirect()->route('inventory.index');
                ->with('error', 'Cannot delete inventory item with transaction history. Consider deactivating it instead.');
        }

        $inventory->delete();

        return redirect()->route('inventory.index');
            ->with('success', 'Inventory item deleted successfully.');
    }

    /**
     * Add stock to inventory item.
     */
    public function addStock(Request $request, InventoryItem $inventory)
    {
        // Check if user has permission to add stock
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager') && !$user->hasRole('inventory')) {
            return redirect()->route('inventory.show', $inventory);
                ->with('error', 'You do not have permission to add stock.');
        }

        $request->validate([
            'quantity' => 'required|integer|min:1',
            'unit_cost' => 'required|numeric|min:0',
            'transaction_date' => 'required|date',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            // Create inventory transaction
            InventoryTransaction::create([
                'inventory_item_id' => $inventory->id,
                'type' => 'in',
                'quantity' => $request->quantity,
                'transaction_date' => $request->transaction_date,
                'supplier_id' => $request->supplier_id,
                'unit_cost' => $request->unit_cost,
                'total_cost' => $request->quantity * $request->unit_cost,
                'created_by' => $user->id,
                'notes' => $request->notes,
            ]);

            // Update inventory item stock
            $inventory->quantity_in_stock += $request->quantity;
            $inventory->save();

            DB::commit();

            return redirect()->route('inventory.show', $inventory);
                ->with('success', 'Stock added successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back();
                ->with('error', 'An error occurred while adding stock: ' . $e->getMessage());
        }
    }

    /**
     * Remove stock from inventory item.
     */
    public function removeStock(Request $request, InventoryItem $inventory)
    {
        // Check if user has permission to remove stock
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager') && !$user->hasRole('inventory')) {
            return redirect()->route('inventory.show', $inventory);
                ->with('error', 'You do not have permission to remove stock.');
        }

        $request->validate([
            'quantity' => 'required|integer|min:1|max:' . $inventory->quantity_in_stock,
            'transaction_date' => 'required|date',
            'reason' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            // Create inventory transaction
            InventoryTransaction::create([
                'inventory_item_id' => $inventory->id,
                'type' => 'out',
                'quantity' => $request->quantity,
                'transaction_date' => $request->transaction_date,
                'unit_cost' => $inventory->unit_cost,
                'total_cost' => $request->quantity * $inventory->unit_cost,
                'created_by' => $user->id,
                'notes' => 'Reason: ' . $request->reason . ($request->notes ? ' - ' . $request->notes : ''),
            ]);

            // Update inventory item stock
            $inventory->quantity_in_stock -= $request->quantity;
            $inventory->save();

            DB::commit();

            return redirect()->route('inventory.show', $inventory);
                ->with('success', 'Stock removed successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back();
                ->with('error', 'An error occurred while removing stock: ' . $e->getMessage());
        }
    }

    /**
     * Display inventory transactions.
     */
    public function transactions(Request $request)
    {
        $itemId = $request->input('item_id');
        $type = $request->input('type');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = InventoryTransaction::with(['inventoryItem', 'inventoryItem.category', 'creator', 'supplier']);

        if ($itemId) {
            $query->where('inventory_item_id', $itemId);
        }

        if ($type) {
            $query->where('type', $type);
        }

        if ($startDate) {
            $query->whereDate('transaction_date', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('transaction_date', '<=', $endDate);
        }

        $transactions = $query->latest()->paginate(20);
        $inventoryItems = InventoryItem::all();

        return Inertia::render('Inventory/Transactions', [;
            'transactions' => $transactions,
            'inventoryItems' => $inventoryItems,
            'filters' => [
                'item_id' => $itemId,
                'type' => $type,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * Display low stock items.
     */
    public function lowStock()
    {
        $lowStockItems = InventoryItem::whereRaw('quantity_in_stock <= reorder_threshold')
            ->with(['category', 'supplier'])
            ->get();

        return Inertia::render('Inventory/LowStock', [;
            'lowStockItems' => $lowStockItems,
        ]);
    }

    /**
     * Generate inventory report.
     */
    public function report(Request $request)
    {
        $categoryId = $request->input('category_id');
        $includeZeroStock = $request->boolean('include_zero_stock', false);

        $query = InventoryItem::with(['category', 'supplier']);

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        if (!$includeZeroStock) {
            $query->where('quantity_in_stock', '>', 0);
        }

        $inventoryItems = $query->get();
        $categories = InventoryCategory::all();

        // Calculate totals
        $totalItems = $inventoryItems->count();
        $totalValue = $inventoryItems->sum(function ($item) {
            return $item->quantity_in_stock * $item->unit_cost;
        });
        $totalQuantity = $inventoryItems->sum('quantity_in_stock');

        // Group by category
        $categoryTotals = $inventoryItems->groupBy('category_id')->map(function ($items) {
            return [
                'count' => $items->count(),
                'value' => $items->sum(function ($item) {
                    return $item->quantity_in_stock * $item->unit_cost;
                }),
                'quantity' => $items->sum('quantity_in_stock'),
            ];
        });

        return Inertia::render('Inventory/Report', [;
            'inventoryItems' => $inventoryItems,
            'categories' => $categories,
            'filters' => [
                'category_id' => $categoryId,
                'include_zero_stock' => $includeZeroStock,
            ],
            'totals' => [
                'items' => $totalItems,
                'value' => $totalValue,
                'quantity' => $totalQuantity,
            ],
            'categoryTotals' => $categoryTotals,
        ]);
    }

    public function indexStockLevels()
    {
        $stockLevels = StockLevel::with('movements')
            ->latest()
            ->paginate(10);

        return Inertia::render('Inventory/Index', [;
            'stockLevels' => $stockLevels,
        ]);
    }

    public function showStockLevel(StockLevel $stockLevel)
    {
        $stockLevel->load(['movements' => function ($query) {
            $query->with('performer')->latest();
        }]);

        return Inertia::render('Inventory/Show', [;
            'stockLevel' => $stockLevel,
        ]);
    }

    public function createStockLevel()
    {
        return Inertia::render('Inventory/Create');
    }

    public function storeStockLevel(Request $request)
    {
        $validated = $request->validate([
            'item_code' => 'required|string|unique:stock_levels',
            'item_name' => 'required|string',
            'description' => 'nullable|string',
            'current_stock' => 'required|integer|min:0',
            'minimum_stock' => 'required|integer|min:0',
            'reorder_point' => 'required|integer|min:0',
            'unit' => 'required|string',
            'unit_price' => 'required|numeric|min:0',
            'location' => 'required|string',
            'status' => 'required|string|in:active,inactive,discontinued',
        ]);

        $stockLevel = StockLevel::create($validated);

        return redirect()->route('inventory.show', $stockLevel);
            ->with('success', 'Stock level created successfully.');
    }

    public function updateStockLevel(Request $request, StockLevel $stockLevel)
    {
        $validated = $request->validate([
            'item_name' => 'required|string',
            'description' => 'nullable|string',
            'minimum_stock' => 'required|integer|min:0',
            'reorder_point' => 'required|integer|min:0',
            'unit' => 'required|string',
            'unit_price' => 'required|numeric|min:0',
            'location' => 'required|string',
            'status' => 'required|string|in:active,inactive,discontinued',
        ]);

        $stockLevel->update($validated);
        $stockLevel->checkStockLevel();

        return redirect()->route('inventory.show', $stockLevel);
            ->with('success', 'Stock level updated successfully.');
    }

    public function addStockToStockLevel(Request $request, StockLevel $stockLevel)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        $stockLevel->updateStock(
            $validated['quantity'],
            'in',
            'manual',
            null,
            $validated['notes']
        );

        return redirect()->route('inventory.show', $stockLevel);
            ->with('success', 'Stock added successfully.');
    }

    public function removeStockFromStockLevel(Request $request, StockLevel $stockLevel)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        if ($validated['quantity'] > $stockLevel->current_stock) {
            return back()->withErrors(['quantity' => 'Cannot remove more stock than available.']);
        }

        $stockLevel->updateStock(
            $validated['quantity'],
            'out',
            'manual',
            null,
            $validated['notes']
        );

        return redirect()->route('inventory.show', $stockLevel);
            ->with('success', 'Stock removed successfully.');
    }

    public function movements(StockLevel $stockLevel)
    {
        $movements = $stockLevel->movements()
            ->with('performer')
            ->latest()
            ->paginate(20);

        return Inertia::render('Inventory/Movements', [;
            'stockLevel' => $stockLevel,
            'movements' => $movements,
        ]);
    }

    public function analytics(): JsonResponse
    {
        // Get stock trends for the last 12 months
        $stockTrends = StockMovement::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as date'),
            DB::raw('SUM(CASE WHEN type = "sale" THEN quantity ELSE 0 END) as demand'),
            DB::raw('AVG(CASE WHEN type = "stock_count" THEN quantity ELSE NULL END) as stock_level')
        )
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($trend) {
                // Calculate forecast using the inventory service
                $forecast = $this->inventoryService->calculateDemandForecast(
                    Carbon::createFromFormat('Y-m', $trend->date),
                    $trend->demand
                );

                return [
                    'date' => $trend->date,
                    'stock_level' => (int) $trend->stock_level,
                    'demand' => (int) $trend->demand,
                    'forecast' => (int) $forecast,
                ];
            });

        // Get supplier metrics
        $supplierMetrics = SupplierPerformance::select(
            'suppliers.name as supplier_name',
            DB::raw('AVG(delivery_score) as delivery_score'),
            DB::raw('AVG(quality_score) as quality_score'),
            DB::raw('AVG(price_score) as price_score'),
            DB::raw('AVG(communication_score) as communication_score'),
            DB::raw('AVG(overall_score) as overall_score')
        )
            ->join('suppliers', 'supplier_performances.supplier_id', '=', 'suppliers.id')
            ->where('evaluation_date', '>=', now()->subMonths(3))
            ->groupBy('suppliers.id', 'suppliers.name')
            ->get()
            ->map(function ($metric) {
                return [
                    'supplier_name' => $metric->supplier_name,
                    'delivery_score' => round($metric->delivery_score, 2),
                    'quality_score' => round($metric->quality_score, 2),
                    'price_score' => round($metric->price_score, 2),
                    'communication_score' => round($metric->communication_score, 2),
                    'overall_score' => round($metric->overall_score, 2),
                ];
            });

        // Get category performance
        $categoryPerformance = InventoryItem::select(
            'category',
            DB::raw('COUNT(*) as items_count'),
            DB::raw('SUM(current_stock * unit_cost) as stock_value'),
            DB::raw('
                AVG(
                    CASE
                        WHEN current_stock > 0
                        THEN (
                            SELECT COUNT(*)
                            FROM stock_movements
                            WHERE inventory_item_id = inventory_items.id
                            AND type = "sale"
                            AND created_at >= NOW() - INTERVAL 30 DAY
                        ) / current_stock
                        ELSE 0
                    END
                ) as turnover_rate
            ')
        )
            ->groupBy('category')
            ->get()
            ->map(function ($category) {
                return [
                    'category' => $category->category,
                    'items_count' => (int) $category->items_count,
                    'stock_value' => round($category->stock_value, 2),
                    'turnover_rate' => round($category->turnover_rate, 4),
                ];
            });

        return response()->json([;
            'stock_trends' => $stockTrends,
            'supplier_metrics' => $supplierMetrics,
            'category_performance' => $categoryPerformance,
        ]);
    }
}




