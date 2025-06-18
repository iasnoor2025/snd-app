<?php
namespace Modules\Core\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventoryTransactionController extends Controller
{
    /**
     * Display a listing of the transactions.
     */
    public function index(Request $request)
    {
        $itemId = $request->input('item_id');
        $type = $request->input('type');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $supplierId = $request->input('supplier_id');

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

        if ($supplierId) {
            $query->where('supplier_id', $supplierId);
        }

        $transactions = $query->latest()->paginate(20);
        $inventoryItems = InventoryItem::all();
        $suppliers = Supplier::where('status', 'active')->get();

        return Inertia::render('Inventory/Transactions/Index', [
            'transactions' => $transactions,
            'inventoryItems' => $inventoryItems,
            'suppliers' => $suppliers,
            'filters' => [
                'item_id' => $itemId,
                'type' => $type,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'supplier_id' => $supplierId,
            ],
        ]);
    }

    /**
     * Show the form for creating a new transaction.
     */
    public function create()
    {
        // Check if user has permission to create transactions
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager') && !$user->hasRole('inventory')) {
            return redirect()->route('inventory.transactions.index')
                ->with('error', 'You do not have permission to create inventory transactions.');
        }

        $inventoryItems = InventoryItem::where('is_active', true)->get();
        $suppliers = Supplier::where('status', 'active')->get();

        return Inertia::render('Inventory/Transactions/Create', [
            'inventoryItems' => $inventoryItems,
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Store a newly created transaction in storage.
     */
    public function store(Request $request)
    {
        // Check if user has permission to create transactions
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager') && !$user->hasRole('inventory')) {
            return redirect()->route('inventory.transactions.index')
                ->with('error', 'You do not have permission to create inventory transactions.');
        }

        $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'type' => 'required|in:in,out,use,return,adjustment,initial',
            'quantity' => 'required|integer|min:1',
            'transaction_date' => 'required|date',
            'unit_cost' => 'required|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'notes' => 'nullable|string',
        ]);

        // Get inventory item
        $inventoryItem = InventoryItem::findOrFail($request->inventory_item_id);

        // Check if there's enough stock for out/use transactions
        if (in_array($request->type, ['out', 'use']) && $inventoryItem->quantity_in_stock < $request->quantity) {
            return redirect()->back()
                ->with('error', 'Not enough stock available for this transaction.');
        }

        DB::beginTransaction();

        try {
            // Create transaction
            $transaction = InventoryTransaction::create([
                'inventory_item_id' => $request->inventory_item_id,
                'type' => $request->type,
                'quantity' => $request->quantity,
                'transaction_date' => $request->transaction_date,
                'unit_cost' => $request->unit_cost,
                'total_cost' => $request->quantity * $request->unit_cost,
                'supplier_id' => $request->supplier_id,
                'created_by' => $user->id,
                'notes' => $request->notes,
            ]);

            // Update inventory item stock
            if (in_array($request->type, ['in', 'return', 'initial'])) {
                $inventoryItem->quantity_in_stock += $request->quantity;
            } elseif (in_array($request->type, ['out', 'use'])) {
                $inventoryItem->quantity_in_stock -= $request->quantity;
            } elseif ($request->type === 'adjustment') {
                // For adjustments, the quantity can be positive or negative
                $inventoryItem->quantity_in_stock = $inventoryItem->quantity_in_stock + $request->quantity;
            }

            $inventoryItem->save();

            DB::commit();

            return redirect()->route('inventory.transactions.index')
                ->with('success', 'Inventory transaction created successfully.')
                ->with('error', 'An error occurred while creating the transaction: ' . $e->getMessage());
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'An error occurred while creating the transaction: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified transaction.
     */
    public function show(InventoryTransaction $transaction)
    {
        $transaction->load(['inventoryItem', 'inventoryItem.category', 'creator', 'supplier']);

        return Inertia::render('Inventory/Transactions/Show', [
            'transaction' => $transaction,
        ]);
    }

    /**
     * Generate inventory transaction report.
     */
    public function report(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->format('Y-m-d'));
        $type = $request->input('type');
        $categoryId = $request->input('category_id');

        $query = InventoryTransaction::with(['inventoryItem', 'inventoryItem.category', 'supplier'])
            ->whereDate('transaction_date', '>=', $startDate)
            ->whereDate('transaction_date', '<=', $endDate);

        if ($type) {
            $query->where('type', $type);
        }

        if ($categoryId) {
            $query->whereHas('inventoryItem', function ($q) use ($categoryId) {
                $q->where('category_id', $categoryId);
            });
        }

        $transactions = $query->get();

        // Calculate totals
        $totalIn = $transactions->where('type', 'in')->sum('total_cost');
        $totalOut = $transactions->where('type', 'out')->sum('total_cost');
        $totalUse = $transactions->where('type', 'use')->sum('total_cost');

        // Group by type
        $byType = $transactions->groupBy('type')->map(function ($items) {
            return [
                'count' => $items->count(),
                'total_quantity' => $items->sum('quantity'),
                'total_cost' => $items->sum('total_cost'),
            ];
        });

        // Group by category
        $byCategory = $transactions->groupBy('inventoryItem.category.name')->map(function ($items) {
            return [
                'count' => $items->count(),
                'total_quantity' => $items->sum('quantity'),
                'total_cost' => $items->sum('total_cost'),
            ];
        });

        // Group by item
        $byItem = $transactions->groupBy('inventoryItem.name')->map(function ($items) {
            return [
                'count' => $items->count(),
                'total_quantity' => $items->sum('quantity'),
                'total_cost' => $items->sum('total_cost'),
            ];
        });

        // Group by date
        $byDate = $transactions->groupBy(function ($item) {
            return $item->transaction_date->format('Y-m-d');
        })->map(function ($items) {
            return [
                'count' => $items->count(),
                'total_quantity' => $items->sum('quantity'),
                'total_cost' => $items->sum('total_cost'),
            ];
        });

        return Inertia::render('Inventory/Transactions/Report', [
            'transactions' => $transactions,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'type' => $type,
                'category_id' => $categoryId,
            ],
            'totals' => [
                'count' => $transactions->count(),
                'in' => $totalIn,
                'out' => $totalOut,
                'use' => $totalUse,
                'net' => $totalIn - $totalOut - $totalUse,
            ],
            'byType' => $byType,
            'byCategory' => $byCategory,
            'byItem' => $byItem,
            'byDate' => $byDate,
        ]);
    }
}



