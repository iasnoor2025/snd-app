<?php
namespace Modules\RentalManagement\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Services\PurchaseOrderApprovalService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseOrderApprovalController extends Controller
{
    protected PurchaseOrderApprovalService $approvalService;

    public function __construct(PurchaseOrderApprovalService $approvalService)
    {
        $this->approvalService = $approvalService;
    }

    /**
     * Display pending approvals
     */
    public function index()
    {
        $pendingApprovals = $this->approvalService->getPendingApprovals();
        $pendingCount = $this->approvalService->getPendingApprovalsCount();

        return Inertia::render('PurchaseOrders/Approvals/Index', [
            'pendingApprovals' => $pendingApprovals,
            'pendingCount' => $pendingCount
        ]);
    }

    /**
     * Show approval form
     */
    public function show(PurchaseOrder $purchaseOrder)
    {
        $approvalHistory = $this->approvalService->getApprovalHistory($purchaseOrder);

        return Inertia::render('PurchaseOrders/Approvals/Show', [
            'purchaseOrder' => $purchaseOrder->load(['supplier', 'creator', 'items.inventoryItem']),
            'approvalHistory' => $approvalHistory
        ]);
    }

    /**
     * Approve purchase order
     */
    public function approve(Request $request, PurchaseOrder $purchaseOrder)
    {
        $request->validate([
            'notes' => 'nullable|string|max:500'
        ]);

        try {
            $this->approvalService->approve($purchaseOrder, auth()->user(), $request->notes);

            return redirect()->route('purchase-orders.approvals.index')
                ->with('success', 'Purchase order approved successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Reject purchase order
     */
    public function reject(Request $request, PurchaseOrder $purchaseOrder)
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        try {
            $this->approvalService->reject($purchaseOrder, auth()->user(), $request->reason);

            return redirect()->route('purchase-orders.approvals.index')
                ->with('success', 'Purchase order rejected successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Place purchase order
     */
    public function placeOrder(PurchaseOrder $purchaseOrder)
    {
        try {
            $this->approvalService->placeOrder($purchaseOrder, auth()->user());

            return redirect()->route('purchase-orders.show', $purchaseOrder)
                ->with('success', 'Purchase order placed successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Cancel purchase order
     */
    public function cancel(Request $request, PurchaseOrder $purchaseOrder)
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        try {
            $this->approvalService->cancel($purchaseOrder, auth()->user(), $request->reason);

            return redirect()->route('purchase-orders.show', $purchaseOrder)
                ->with('success', 'Purchase order cancelled successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Get pending approvals count for dashboard
     */
    public function getPendingCount()
    {
        return response()->json([
            'count' => $this->approvalService->getPendingApprovalsCount()
        ]);
    }
}


