<?php

namespace Modules\RentalManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Modules\CustomerManagement\Domain\Models\Customer;

class CustomerController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Customer::class, 'customer');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Customer::query();

        // Apply filters
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->input('status')) {
            $status = $request->input('status') === 'active';
            $query->where('is_active', $status);
        }

        $customers = $query->paginate(10)
            ->withQueryString();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $countries = $this->getCountriesList();

        return Inertia::render('Customers/Create', [
            'countries' => $countries,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate request
        $validatedData = $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'website' => 'nullable|string|max:255',
            'tax_number' => 'nullable|string|max:50',
            'credit_limit' => 'nullable|numeric|min:0',
            'payment_terms' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            // Create customer
            $customer = Customer::create($validatedData);

            // Handle documents if any
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $index => $file) {
                    $documentName = $request->input('document_names.' . $index, 'Document ' . ($index + 1));
                    $customer->addMedia($file)
                        ->usingName($documentName)
                        ->toMediaCollection('documents');
                }
            }

            DB::commit();

            return redirect()->route('customers.show', $customer)
                ->with('success', 'Customer created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Customer creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withInput()->with('error', 'Failed to create customer: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer)
    {
        $customer->load(['rentals', 'invoices', 'payments']);

        return Inertia::render('Customers/Show', [
            'customer' => $customer,
            'attachments' => $customer->getMedia('documents'),
            'rentals' => [
                'data' => $customer->rentals()->latest()->take(5)->get(),
                'total' => $customer->rentals()->count(),
            ],
            'invoices' => [
                'data' => $customer->invoices()->latest()->take(5)->get(),
                'total' => $customer->invoices()->count(),
            ],
            'payments' => [
                'data' => $customer->payments()->latest()->take(5)->get(),
                'total' => $customer->payments()->count(),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Customer $customer)
    {
        $countries = $this->getCountriesList();

        return Inertia::render('Customers/Edit', [
            'customer' => $customer,
            'attachments' => $customer->getMedia('documents'),
            'countries' => $countries,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        // Validate request
        $validatedData = $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'website' => 'nullable|string|max:255',
            'tax_number' => 'nullable|string|max:50',
            'credit_limit' => 'nullable|numeric|min:0',
            'payment_terms' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            // Update customer
            $customer->update($validatedData);

            // Handle documents if any
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $index => $file) {
                    $documentName = $request->input('document_names.' . $index, 'Document ' . ($index + 1));
                    $customer->addMedia($file)
                        ->usingName($documentName)
                        ->toMediaCollection('documents');
                }
            }

            DB::commit();

            return redirect()->route('customers.show', $customer)
                ->with('success', 'Customer updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Customer update failed', [
                'customer_id' => $customer->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withInput()->with('error', 'Failed to update customer: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        try {
            // Check if customer has rentals, invoices, or payments
            if ($customer->rentals()->exists() || $customer->invoices()->exists() || $customer->payments()->exists()) {
                return back()->with('error', 'Cannot delete customer with associated rentals, invoices, or payments. Deactivate it instead.');
            }

            DB::beginTransaction();

            // Delete documents
            $customer->clearMediaCollection('documents');

            // Delete the customer
            $customer->delete();

            DB::commit();

            return redirect()->route('customers.index')
                ->with('success', 'Customer deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Customer deletion failed', [
                'customer_id' => $customer->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to delete customer: ' . $e->getMessage());
        }
    }

    /**
     * Generate a report of customers.
     */
    public function report(Request $request)
    {
        $this->authorize('viewAny', Customer::class);

        $status = $request->input('status');
        $city = $request->input('city');

        $query = Customer::query();

        if ($status) {
            $isActive = $status === 'active';
            $query->where('is_active', $isActive);
        }

        if ($city) {
            $query->where('city', $city);
        }

        $customers = $query->get();

        // Get unique cities for filter
        $cities = Customer::distinct('city')->whereNotNull('city')->pluck('city');

        // Calculate statistics
        $totalCustomers = $customers->count();
        $activeCustomers = $customers->where('is_active', true)->count();
        $inactiveCustomers = $customers->where('is_active', false)->count();

        return Inertia::render('Customers/Report', [
            'customers' => $customers,
            'cities' => $cities,
            'statistics' => [
                'total' => $totalCustomers,
                'active' => $activeCustomers,
                'inactive' => $inactiveCustomers,
                'activePercentage' => $totalCustomers > 0 ? round(($activeCustomers / $totalCustomers) * 100) : 0,
            ],
            'filters' => $request->only(['status', 'city'])
        ]);
    }

    /**
     * Get a list of customers for API use.
     */
    public function getCustomers(Request $request)
    {
        $search = $request->input('search');
        $query = Customer::query()->where('is_active', true);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%");
            });
        }

        $customers = $query->orderBy('company_name')->get([
            'id', 'company_name', 'contact_person', 'email', 'phone'
        ]);

        return response()->json($customers);
    }

    /**
     * Get list of countries for dropdowns
     */
    private function getCountriesList(): array
    {
        return [
            'United Arab Emirates',
            'Saudi Arabia',
            'Qatar',
            'Oman',
            'Kuwait',
            'Bahrain',
            // Add more countries as needed
        ];
    }
}




