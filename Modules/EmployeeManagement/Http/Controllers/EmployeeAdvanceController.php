<?php

namespace Modules\EmployeeManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\EmployeeManagement\Http\Requests\ApproveAdvanceRequest;
use Modules\EmployeeManagement\Http\Requests\ProcessDeductionRequest;
use Modules\EmployeeManagement\Http\Requests\RejectAdvanceRequest;
use Modules\EmployeeManagement\Http\Requests\StoreEmployeeAdvanceRequest;
use Modules\EmployeeManagement\Services\EmployeeAdvanceService;
use Modules\EmployeeManagement\Domain\Models\EmployeeAdvance;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class EmployeeAdvanceController extends Controller
{
    private EmployeeAdvanceService $advanceService;

    public function __construct(EmployeeAdvanceService $advanceService)
    {
        $this->advanceService = $advanceService;
    }

    public function index(int $employeeId): JsonResponse
    {
        $advances = $this->advanceService->getEmployeeAdvances($employeeId);
        return response()->json($advances);
    }

    public function store(StoreEmployeeAdvanceRequest $request, int $employeeId): JsonResponse
    {
        $advance = $this->advanceService->requestAdvance($employeeId, $request->validated());
        return response()->json($advance, 201);
    }

    public function show(int $employeeId, EmployeeAdvance $advance): JsonResponse
    {
        return response()->json($advance);
    }

    public function approve(int $employeeId, EmployeeAdvance $advance)
    {
        try {
            $this->advanceService->approveAdvance($advance->id, auth()->user(), null);
            return redirect()->route('employees.advances.web.index', ['employee' => $employeeId]);
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Failed to approve advance: ' . $e->getMessage());
        }
    }

    public function reject(int $employeeId, EmployeeAdvance $advance)
    {
        try {
            $this->advanceService->rejectAdvance($advance->id, auth()->user(), 'Rejected by admin');
            return redirect()->route('employees.advances.web.index', ['employee' => $employeeId]);
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Failed to reject advance: ' . $e->getMessage());
        }
    }

    public function processDeduction(ProcessDeductionRequest $request, int $employeeId, EmployeeAdvance $advance): JsonResponse
    {
        $deductedAdvance = $this->advanceService->processDeduction(
            $advance->id,
            $request->validated('amount'),
            $request->validated('notes')
        );

        return response()->json($deductedAdvance);
    }

    public function pending(): JsonResponse
    {
        $advances = $this->advanceService->getPendingAdvances();
        return response()->json($advances);
    }

    public function active(): JsonResponse
    {
        $advances = $this->advanceService->getActiveAdvances();
        return response()->json($advances);
    }

    public function upcomingDeductions(): JsonResponse
    {
        $advances = $this->advanceService->getUpcomingDeductions();
        return response()->json($advances);
    }

    public function overdueDeductions(): JsonResponse
    {
        $advances = $this->advanceService->getOverdueDeductions();
        return response()->json($advances);
    }

    public function deductionSchedule(int $employeeId, EmployeeAdvance $advance): JsonResponse
    {
        $schedule = $this->advanceService->calculateDeductionSchedule($advance);
        return response()->json($schedule);
    }

    public function repayment(\Illuminate\Http\Request $request, $employeeId, \Modules\EmployeeManagement\Domain\Models\EmployeeAdvance $advance)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);
        try {
            $amount = $request->input('amount');
            if ($amount > $advance->remaining_amount) {
                return redirect()->back()->with('error', 'Repayment amount exceeds remaining balance.');
            }
            $advance->remaining_amount -= $amount;
            $advance->repaid_amount = ($advance->repaid_amount ?? 0) + $amount;
            $advance->save();
            // If repayments relation exists, create a repayment record
            if (method_exists($advance, 'repayments')) {
                $advance->repayments()->create([
                    'amount' => $amount,
                    'payment_date' => $request->input('payment_date'),
                    'notes' => $request->input('notes'),
                ]);
            }
            return redirect()->back()->with('success', 'Repayment recorded successfully.');
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Failed to record repayment: ' . $e->getMessage());
        }
    }
}

