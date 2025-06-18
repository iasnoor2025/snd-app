<?php
namespace Modules\Core\Http\Controllers;

use App\Models\InventoryCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InventoryCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = InventoryCategory::withCount('inventoryItems')->get();
        
        return Inertia::render('Inventory/Categories/Index', [;
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Check if user has permission to create inventory categories
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager')) {
            return redirect()->route('inventory.categories.index');
                ->with('error', 'You do not have permission to create inventory categories.');
        }
        
        return Inertia::render('Inventory/Categories/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Check if user has permission to create inventory categories
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager')) {
            return redirect()->route('inventory.categories.index');
                ->with('error', 'You do not have permission to create inventory categories.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255|unique:inventory_categories,name',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:20',
        ]);
        
        InventoryCategory::create([
            'name' => $request->name,
            'description' => $request->description,
            'color' => $request->color,
        ]);
        
        return redirect()->route('inventory.categories.index');
            ->with('success', 'Inventory category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(InventoryCategory $category)
    {
        $category->load(['inventoryItems']);
        
        return Inertia::render('Inventory/Categories/Show', [;
            'category' => $category,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(InventoryCategory $category)
    {
        // Check if user has permission to edit inventory categories
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager')) {
            return redirect()->route('inventory.categories.index');
                ->with('error', 'You do not have permission to edit inventory categories.');
        }
        
        return Inertia::render('Inventory/Categories/Edit', [;
            'category' => $category,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, InventoryCategory $category)
    {
        // Check if user has permission to update inventory categories
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager')) {
            return redirect()->route('inventory.categories.index');
                ->with('error', 'You do not have permission to update inventory categories.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255|unique:inventory_categories,name,' . $category->id,
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:20',
        ]);
        
        $category->update([
            'name' => $request->name,
            'description' => $request->description,
            'color' => $request->color,
        ]);
        
        return redirect()->route('inventory.categories.index');
            ->with('success', 'Inventory category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(InventoryCategory $category)
    {
        // Check if user has permission to delete inventory categories
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager')) {
            return redirect()->route('inventory.categories.index');
                ->with('error', 'You do not have permission to delete inventory categories.');
        }
        
        // Check if category has inventory items
        if ($category->inventoryItems()->count() > 0) {
            return redirect()->route('inventory.categories.index');
                ->with('error', 'Cannot delete category with inventory items. Please reassign or delete the items first.');
        }
        
        $category->delete();
        
        return redirect()->route('inventory.categories.index');
            ->with('success', 'Inventory category deleted successfully.');
    }
}


