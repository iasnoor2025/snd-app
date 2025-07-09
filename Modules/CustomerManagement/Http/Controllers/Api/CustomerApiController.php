<?php

namespace Modules\CustomerManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\CustomerManagement\Domain\Models\Customer;
use Illuminate\Http\JsonResponse;
use Modules\CustomerManagement\Actions\SyncCustomersFromERPNextAction;

class CustomerApiController extends Controller
{
    /**
     * Display a listing of customers.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Customer::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('company_name', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $customers = $query->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => $customers->items(),
            'meta' => [
                'current_page' => $customers->currentPage(),
                'from' => $customers->firstItem(),
                'last_page' => $customers->lastPage(),
                'per_page' => $customers->perPage(),
                'to' => $customers->lastItem(),
                'total' => $customers->total(),
            ],
            'links' => [
                'first' => $customers->url(1),
                'last' => $customers->url($customers->lastPage()),
                'prev' => $customers->previousPageUrl(),
                'next' => $customers->nextPageUrl(),
            ]
        ]);
    }

    /**
     * Store a newly created customer.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers,email',
            'phone' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'type' => 'required|in:individual,corporate',
            'status' => 'required|in:active,inactive',
        ]);

        $customer = Customer::create($validated);

        return response()->json([
            'data' => $customer,
            'message' => 'Customer created successfully'
        ], 201);
    }

    /**
     * Display the specified customer.
     */
    public function show(Customer $customer): JsonResponse
    {
        return response()->json([
            'data' => $customer
        ]);
    }

    /**
     * Update the specified customer.
     */
    public function update(Request $request, Customer $customer): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers,email,' . $customer->id,
            'phone' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'type' => 'required|in:individual,corporate',
            'status' => 'required|in:active,inactive',
        ]);

        $customer->update($validated);

        return response()->json([
            'data' => $customer,
            'message' => 'Customer updated successfully'
        ]);
    }

    /**
     * Remove the specified customer.
     */
    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();

        return response()->json([
            'message' => 'Customer deleted successfully'
        ]);
    }

    /**
     * Get customer statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_customers' => Customer::count(),
            'active_customers' => Customer::where('status', 'active')->count(),
            'inactive_customers' => Customer::where('status', 'inactive')->count(),
            'individual_customers' => Customer::where('type', 'individual')->count(),
            'corporate_customers' => Customer::where('type', 'corporate')->count(),
        ];

        return response()->json([
            'data' => $stats
        ]);
    }

    /**
     * Get customer rentals.
     */
    public function rentals(Customer $customer): JsonResponse
    {
        // This would need to be implemented based on the rental relationship
        return response()->json([
            'data' => [],
            'message' => 'Customer rentals endpoint - implement based on rental relationships'
        ]);
    }

    /**
     * Get customer invoices.
     */
    public function invoices(Customer $customer): JsonResponse
    {
        // This would need to be implemented based on the invoice relationship
        return response()->json([
            'data' => [],
            'message' => 'Customer invoices endpoint - implement based on invoice relationships'
        ]);
    }

    /**
     * Get customer payments.
     */
    public function payments(Customer $customer): JsonResponse
    {
        // This would need to be implemented based on the payment relationship
        return response()->json([
            'data' => [],
            'message' => 'Customer payments endpoint - implement based on payment relationships'
        ]);
    }

    /**
     * Sync customers from ERPNext.
     */
    public function syncErpnext(): JsonResponse
    {
        $count = (new SyncCustomersFromERPNextAction())->execute();
        return response()->json([
            'message' => "ERPNext Customer Sync complete. {$count} customers processed.",
            'count' => $count
        ]);
    }
}
