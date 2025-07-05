<?php

namespace Modules\CustomerManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\CustomerManagement\Services\CustomerPortalService;
use Modules\RentalManagement\Services\RentalService;

class CustomerPortalApiController extends Controller
{
    protected $customerPortalService;
    protected $rentalService;

    public function __construct(CustomerPortalService $customerPortalService, RentalService $rentalService)
    {
        $this->customerPortalService = $customerPortalService;
        $this->rentalService = $rentalService;
    }

    /**
     * Get customer dashboard data.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $customerId = $request->user()->customer_id ?? $request->get('customer_id');

        if (!$customerId) {
            return response()->json([
                'success' => false,
                'message' => 'Customer ID is required'
            ], 400);
        }

        $dashboard = $this->customerPortalService->getDashboardData($customerId);

        return response()->json([
            'success' => true,
            'data' => $dashboard,
            'message' => 'Customer dashboard data retrieved successfully'
        ]);
    }

    /**
     * Get customer rentals.
     */
    public function rentals(Request $request): JsonResponse
    {
        $customerId = $request->user()->customer_id ?? $request->get('customer_id');

        if (!$customerId) {
            return response()->json([
                'success' => false,
                'message' => 'Customer ID is required'
            ], 400);
        }

        $rentals = $this->rentalService->getCustomerRentals($customerId, $request->all());

        return response()->json([
            'success' => true,
            'data' => $rentals,
            'message' => 'Customer rentals retrieved successfully'
        ]);
    }

    /**
     * Get customer invoices.
     */
    public function invoices(Request $request): JsonResponse
    {
        $customerId = $request->user()->customer_id ?? $request->get('customer_id');

        if (!$customerId) {
            return response()->json([
                'success' => false,
                'message' => 'Customer ID is required'
            ], 400);
        }

        $invoices = $this->customerPortalService->getCustomerInvoices($customerId, $request->all());

        return response()->json([
            'success' => true,
            'data' => $invoices,
            'message' => 'Customer invoices retrieved successfully'
        ]);
    }

    /**
     * Get customer payments.
     */
    public function payments(Request $request): JsonResponse
    {
        $customerId = $request->user()->customer_id ?? $request->get('customer_id');

        if (!$customerId) {
            return response()->json([
                'success' => false,
                'message' => 'Customer ID is required'
            ], 400);
        }

        $payments = $this->customerPortalService->getCustomerPayments($customerId, $request->all());

        return response()->json([
            'success' => true,
            'data' => $payments,
            'message' => 'Customer payments retrieved successfully'
        ]);
    }

    /**
     * Get customer profile.
     */
    public function profile(Request $request): JsonResponse
    {
        $customerId = $request->user()->customer_id ?? $request->get('customer_id');

        if (!$customerId) {
            return response()->json([
                'success' => false,
                'message' => 'Customer ID is required'
            ], 400);
        }

        $profile = $this->customerPortalService->getCustomerProfile($customerId);

        return response()->json([
            'success' => true,
            'data' => $profile,
            'message' => 'Customer profile retrieved successfully'
        ]);
    }

    /**
     * Update customer profile.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $customerId = $request->user()->customer_id ?? $request->get('customer_id');

        if (!$customerId) {
            return response()->json([
                'success' => false,
                'message' => 'Customer ID is required'
            ], 400);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string|max:500',
            'city' => 'sometimes|string|max:100',
            'state' => 'sometimes|string|max:100',
            'zip_code' => 'sometimes|string|max:20',
            'country' => 'sometimes|string|max:100'
        ]);

        $profile = $this->customerPortalService->updateCustomerProfile($customerId, $validated);

        return response()->json([
            'success' => true,
            'data' => $profile,
            'message' => 'Customer profile updated successfully'
        ]);
    }

    /**
     * Get customer quotations.
     */
    public function quotations(Request $request): JsonResponse
    {
        $customerId = $request->user()->customer_id ?? $request->get('customer_id');

        if (!$customerId) {
            return response()->json([
                'success' => false,
                'message' => 'Customer ID is required'
            ], 400);
        }

        $quotations = $this->customerPortalService->getCustomerQuotations($customerId, $request->all());

        return response()->json([
            'success' => true,
            'data' => $quotations,
            'message' => 'Customer quotations retrieved successfully'
        ]);
    }

    /**
     * Request new quotation.
     */
    public function requestQuotation(Request $request): JsonResponse
    {
        $customerId = $request->user()->customer_id ?? $request->get('customer_id');

        if (!$customerId) {
            return response()->json([
                'success' => false,
                'message' => 'Customer ID is required'
            ], 400);
        }

        $validated = $request->validate([
            'equipment_type' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'description' => 'nullable|string|max:1000',
            'location' => 'nullable|string|max:255'
        ]);

        $quotation = $this->customerPortalService->requestQuotation($customerId, $validated);

        return response()->json([
            'success' => true,
            'data' => $quotation,
            'message' => 'Quotation request submitted successfully'
        ], 201);
    }

    /**
     * Get customer support tickets.
     */
    public function supportTickets(Request $request): JsonResponse
    {
        $customerId = $request->user()->customer_id ?? $request->get('customer_id');

        if (!$customerId) {
            return response()->json([
                'success' => false,
                'message' => 'Customer ID is required'
            ], 400);
        }

        $tickets = $this->customerPortalService->getCustomerSupportTickets($customerId, $request->all());

        return response()->json([
            'success' => true,
            'data' => $tickets,
            'message' => 'Customer support tickets retrieved successfully'
        ]);
    }

    /**
     * Create support ticket.
     */
    public function createSupportTicket(Request $request): JsonResponse
    {
        $customerId = $request->user()->customer_id ?? $request->get('customer_id');

        if (!$customerId) {
            return response()->json([
                'success' => false,
                'message' => 'Customer ID is required'
            ], 400);
        }

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string|max:2000',
            'priority' => 'required|in:low,medium,high,urgent',
            'category' => 'required|string|max:100'
        ]);

        $ticket = $this->customerPortalService->createSupportTicket($customerId, $validated);

        return response()->json([
            'success' => true,
            'data' => $ticket,
            'message' => 'Support ticket created successfully'
        ], 201);
    }
}
