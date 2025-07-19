<?php

namespace Modules\CustomerManagement\Http\Controllers;

use Modules\CustomerManagement\Actions\CreateCustomerAction;
use Modules\CustomerManagement\Actions\DeleteCustomerAction;
use Modules\CustomerManagement\Actions\UpdateCustomerAction;
use Modules\CustomerManagement\Http\Requests\StoreCustomerRequest;
use Modules\CustomerManagement\Http\Requests\UpdateCustomerRequest;
use Modules\CustomerManagement\Domain\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Routing\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CustomerController extends Controller
{
    use AuthorizesRequests;

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

        // Apply search filter
        if ($request->has('search') && $request->input('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if ($request->has('status') && $request->input('status') && $request->input('status') !== 'all') {
            $status = $request->input('status') === 'active';
            $query->where('is_active', $status);
        }

        // Apply city filter
        if ($request->has('city') && $request->input('city') && $request->input('city') !== 'all') {
            $query->where('city', $request->input('city'));
        }

        $perPage = $request->input('per_page', 10);
        $customers = $query->paginate($perPage)
            ->withQueryString();

        // Transform customers for frontend
        $customersTransformed = $customers->getCollection()->map(function ($customer) {
            return [
                'id' => $customer->id,
                'name' => $customer->company_name ?? $customer->name,
                'contact_person' => $customer->contact_person,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'city' => $customer->city,
                'status' => $customer->is_active ? 'active' : 'inactive',
            ];
        });
        $customers->setCollection($customersTransformed);

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'status', 'city'])
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
    public function store(StoreCustomerRequest $request, CreateCustomerAction $action)
    {
        try {
            // Get validated data
            $data = $request->validated();

            // Extract documents
            $documents = $request->hasFile('documents') ? $request->file('documents') : null;

            // Create customer
            $customer = $action->execute($data, $documents);

            return redirect()->route('customers.show', $customer)
                ->with('success', 'Customer created successfully.');
        } catch (\Exception $e) {
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
        $customer->load(['rentals', 'invoices', 'payments', 'user']);
        $countries = $this->getCountriesList();
        $translations = method_exists($customer, 'getTranslations') ? $customer->getTranslations('notes') : [];
        return Inertia::render('Customers/Show', [
            'customer' => $customer,
            'attachments' => $customer->attachments,
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
            'user' => $customer->user,
            'translations' => $translations,
            'created_at' => $customer->created_at,
            'updated_at' => $customer->updated_at,
            'deleted_at' => $customer->deleted_at,
            'countries' => $countries,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Customer $customer)
    {
        $customer->load(['rentals', 'invoices', 'payments', 'user']);
        $countries = $this->getCountriesList();
        $translations = method_exists($customer, 'getTranslations') ? $customer->getTranslations('notes') : [];
        return Inertia::render('Customers/Edit', [
            'customer' => $customer,
            'attachments' => $customer->attachments,
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
            'user' => $customer->user,
            'translations' => $translations,
            'created_at' => $customer->created_at,
            'updated_at' => $customer->updated_at,
            'deleted_at' => $customer->deleted_at,
            'countries' => $countries,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCustomerRequest $request, Customer $customer, UpdateCustomerAction $action)
    {
        try {
            // Get validated data
            $data = $request->validated();

            // Extract documents
            $documents = $request->hasFile('documents') ? $request->file('documents') : null;

            // Update customer
            $customer = $action->execute($customer, $data, $documents);

            return redirect()->route('customers.show', $customer)
                ->with('success', 'Customer updated successfully.');
        } catch (\Exception $e) {
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
    public function destroy(Customer $customer, DeleteCustomerAction $action)
    {
        try {
            $action->execute($customer);

            return redirect()->route('customers.index')
                ->with('success', 'Customer deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Customer deletion failed', [
                'customer_id' => $customer->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', $e->getMessage());
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

        return Inertia::render('Customers/Report', [
            'customers' => $customers,
            'filters' => $request->only(['status', 'city'])
        ]);
    }

    /**
     * Export customers to Excel/CSV
     */
    public function export(Request $request)
    {
        try {
            $query = Customer::query();

            // Apply same filters as index
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

            $customers = $query->get();

            // For now, return JSON. In a real implementation, you'd use Laravel Excel
            return response()->json([
                'data' => $customers,
                'message' => 'Export functionality - implement with Laravel Excel'
            ]);
        } catch (\Exception $e) {
            Log::error('Customer export failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Export failed: ' . $e->getMessage());
        }
    }

    /**
     * Show import form
     */
    public function importForm()
    {
        return Inertia::render('Customers/Import');
    }

    /**
     * Process import file
     */
    public function processImport(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls'
        ]);

        try {
            // For now, just return success. In a real implementation, you'd process the file
            return redirect()->route('customers.index')
                ->with('success', 'Import functionality - implement with Laravel Excel');
        } catch (\Exception $e) {
            Log::error('Customer import failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

    /**
     * Get customer invoices
     */
    public function invoices(Customer $customer)
    {
        $invoices = $customer->invoices()->latest()->paginate(10);

        return Inertia::render('Customers/Invoices', [
            'customer' => $customer,
            'invoices' => $invoices
        ]);
    }

    /**
     * Get customer rentals
     */
    public function rentals(Customer $customer)
    {
        $rentals = $customer->rentals()->latest()->paginate(10);

        return Inertia::render('Customers/Rentals', [
            'customer' => $customer,
            'rentals' => $rentals
        ]);
    }

    /**
     * Get customer quotations
     */
    public function quotations(Customer $customer)
    {
        $quotations = $customer->quotations()->latest()->paginate(10);

        return Inertia::render('Customers/Quotations', [
            'customer' => $customer,
            'quotations' => $quotations
        ]);
    }

    /**
     * Get customer payments
     */
    public function payments(Customer $customer)
    {
        $payments = $customer->payments()->latest()->paginate(10);

        return Inertia::render('Customers/Payments', [
            'customer' => $customer,
            'payments' => $payments
        ]);
    }

    /**
     * Get a list of countries for the form.
     */
    private function getCountriesList(): array
    {
        return [
            'KSA' => 'Saudi Arabia',
        ];
    }
}




