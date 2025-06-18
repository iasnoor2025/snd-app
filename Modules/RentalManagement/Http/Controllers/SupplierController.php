<?php
namespace Modules\RentalManagement\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');

        $query = Supplier::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        $suppliers = $query->latest()->paginate(10);

        return Inertia::render('Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Check if user has permission to create suppliers
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager') && !$user->hasRole('inventory')) {
            return redirect()->route('suppliers.index')
                ->with('error', 'You do not have permission to create suppliers.');
        }

        return Inertia::render('Suppliers/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Check if user has permission to create suppliers
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager') && !$user->hasRole('inventory')) {
            return redirect()->route('suppliers.index')
                ->with('error', 'You do not have permission to create suppliers.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:255',
            'tax_number' => 'nullable|string|max:50',
            'payment_terms' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        Supplier::create([
            'name' => $request->name,
            'contact_person' => $request->contact_person,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'city' => $request->city,
            'state' => $request->state,
            'postal_code' => $request->postal_code,
            'country' => $request->country,
            'website' => $request->website,
            'tax_number' => $request->tax_number,
            'payment_terms' => $request->payment_terms,
            'notes' => $request->notes,
            'status' => $request->status,
        ]);

        return redirect()->route('suppliers.index')
            ->with('success', 'Supplier created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Supplier $supplier)
    {
        $supplier->load(['inventoryItems', 'inventoryTransactions' => function ($query) {
            $query->latest()->take(10);
        }]);

        return Inertia::render('Suppliers/Show', [
            'supplier' => $supplier,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Supplier $supplier)
    {
        // Check if user has permission to edit suppliers
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager') && !$user->hasRole('inventory')) {
            return redirect()->route('suppliers.index')
                ->with('error', 'You do not have permission to edit suppliers.');
        }

        return Inertia::render('Suppliers/Edit', [
            'supplier' => $supplier,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Supplier $supplier)
    {
        // Check if user has permission to update suppliers
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager') && !$user->hasRole('inventory')) {
            return redirect()->route('suppliers.index')
                ->with('error', 'You do not have permission to update suppliers.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:255',
            'tax_number' => 'nullable|string|max:50',
            'payment_terms' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $supplier->update([
            'name' => $request->name,
            'contact_person' => $request->contact_person,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'city' => $request->city,
            'state' => $request->state,
            'postal_code' => $request->postal_code,
            'country' => $request->country,
            'website' => $request->website,
            'tax_number' => $request->tax_number,
            'payment_terms' => $request->payment_terms,
            'notes' => $request->notes,
            'status' => $request->status,
        ]);

        return redirect()->route('suppliers.index')
            ->with('success', 'Supplier updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier)
    {
        // Check if user has permission to delete suppliers
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->hasRole('manager')) {
            return redirect()->route('suppliers.index')
                ->with('error', 'You do not have permission to delete suppliers.');
        }

        // Check if supplier has inventory items or transactions
        if ($supplier->inventoryItems()->count() > 0 || $supplier->inventoryTransactions()->count() > 0) {
            return redirect()->route('suppliers.index')
                ->with('error', 'Cannot delete supplier with inventory items or transactions. Consider deactivating it instead.');
        }

        $supplier->delete();

        return redirect()->route('suppliers.index')
            ->with('success', 'Supplier deleted successfully.');
    }
}




