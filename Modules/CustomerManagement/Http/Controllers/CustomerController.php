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
        $customer->load(['rentals', 'invoices', 'payments']);

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
            'attachments' => $customer->attachments,
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
     * Get a list of countries for the form.
     */
    private function getCountriesList(): array
    {
        return [
            'KSA' => 'Saudi Arabia',
        ];
    }
}




