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

    public function approve(ApproveAdvanceRequest $request, int $employeeId, EmployeeAdvance $advance): JsonResponse
    {
        $approvedAdvance = $this->advanceService->approveAdvance(
            $advance->id,
            $request->user(),
            $request->validated('notes')
        );

        return response()->json($approvedAdvance);
    }

    public function reject(RejectAdvanceRequest $request, int $employeeId, EmployeeAdvance $advance): JsonResponse
    {
        $rejectedAdvance = $this->advanceService->rejectAdvance(
            $advance->id,
            $request->user(),
            $request->validated('reason')
        );

        return response()->json($rejectedAdvance);
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
}

