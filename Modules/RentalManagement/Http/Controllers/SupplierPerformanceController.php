<?php
namespace Modules\RentalManagement\Http\Controllers;

use App\Models\Supplier;
use App\Services\SupplierPerformanceService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierPerformanceController extends Controller
{
    protected SupplierPerformanceService $performanceService;

    public function __construct(SupplierPerformanceService $performanceService)
    {
        $this->performanceService = $performanceService;
    }

    /**
     * Display supplier performance history
     */
    public function index(Request $request, Supplier $supplier)
    {
        $months = $request->input('months', 12);
        $history = $this->performanceService->getPerformanceHistory($supplier, $months);
        $summary = $this->performanceService->getPerformanceSummary($supplier);

        return Inertia::render('Suppliers/Performance/Index', [;
            'supplier' => $supplier,
            'history' => $history,
            'summary' => $summary,
            'months' => $months,
        ]);
    }

    /**
     * Manually trigger performance evaluation
     */
    public function evaluate(Supplier $supplier)
    {
        $performance = $this->performanceService->evaluateSupplier($supplier);

        return redirect()->route('suppliers.performance.index', $supplier);
            ->with('success', 'Supplier performance evaluated successfully.');
    }

    /**
     * Get performance summary for dashboard
     */
    public function getSummary(Supplier $supplier)
    {
        $summary = $this->performanceService->getPerformanceSummary($supplier);

        return response()->json($summary);
    }

    /**
     * Get performance history for charts
     */
    public function getHistory(Supplier $supplier, Request $request)
    {
        $months = $request->input('months', 12);
        $history = $this->performanceService->getPerformanceHistory($supplier, $months);

        return response()->json($history);
    }
}


