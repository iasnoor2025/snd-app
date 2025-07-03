<?php
namespace Modules\RentalManagement\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Services\PurchaseOrderDeliveryService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PurchaseOrderDeliveryController extends Controller
{
    protected PurchaseOrderDeliveryService $deliveryService;

    public function __construct(PurchaseOrderDeliveryService $deliveryService)
    {
        $this->deliveryService = $deliveryService;
    }

    /**
     * Display delivery status
     */
    public function show(PurchaseOrder $purchaseOrder)
    {
        $deliveryStatus = $this->deliveryService->getDeliveryStatus($purchaseOrder);

        return Inertia::render('PurchaseOrders/Delivery/Show', [
            'purchaseOrder' => $purchaseOrder->load(['supplier', 'items.inventoryItem']),
            'deliveryStatus' => $deliveryStatus
        ]);
    }

    /**
     * Receive items
     */
    public function receiveItems(Request $request, PurchaseOrder $purchaseOrder)
    {
        $request->validate([
            'received_items' => 'required|array',
            'received_items.*.purchase_order_item_id' => 'required|exists:purchase_order_items,id',
            'received_items.*.quantity' => 'required|integer|min:1'
        ]);

        try {
            $this->deliveryService->receiveItems($purchaseOrder, $request->received_items, auth()->user());

            return redirect()->route('purchase-orders.delivery.show', $purchaseOrder)
                ->with('success', 'Items received successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Update expected delivery date
     */
    public function updateDeliveryDate(Request $request, PurchaseOrder $purchaseOrder)
    {
        $request->validate([
            'expected_delivery_date' => 'required|date|after:today'
        ]);

        try {
            $this->deliveryService->updateExpectedDeliveryDate(
                $purchaseOrder,
                Carbon::parse($request->expected_delivery_date),
                auth()->user()
            );

            return redirect()->route('purchase-orders.delivery.show', $purchaseOrder)
                ->with('success', 'Delivery date updated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Get overdue purchase orders
     */
    public function getOverdue()
    {
        $overdueOrders = $this->deliveryService->getOverduePurchaseOrders();

        return Inertia::render('PurchaseOrders/Delivery/Overdue', [
            'overdueOrders' => $overdueOrders
        ]);
    }

    /**
     * Get upcoming deliveries
     */
    public function getUpcoming(Request $request)
    {
        $days = $request->input('days', 7);
        $upcomingDeliveries = $this->deliveryService->getUpcomingDeliveries($days);

        return Inertia::render('PurchaseOrders/Delivery/Upcoming', [
            'upcomingDeliveries' => $upcomingDeliveries,
            'days' => $days
        ]);
    }

    /**
     * Get delivery status for dashboard
     */
    public function getDeliveryStatus(PurchaseOrder $purchaseOrder)
    {
        $status = $this->deliveryService->getDeliveryStatus($purchaseOrder);

        return response()->json($status);
    }

    /**
     * Get overdue count for dashboard
     */
    public function getOverdueCount()
    {
        $overdueOrders = $this->deliveryService->getOverduePurchaseOrders();

        return response()->json([
            'count' => count($overdueOrders)
        ]);
    }
}


