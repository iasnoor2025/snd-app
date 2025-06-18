<?php

namespace Modules\EmployeeManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\EmployeeManagement\Http\Requests\ApproveAdvanceRequest;
use Modules\EmployeeManagement\Http\Requests\ProcessDeductionRequest;
use Modules\EmployeeManagement\Http\Requests\RejectAdvanceRequest;
use Modules\EmployeeManagement\Http\Requests\StoreEmployeeAdvanceRequest;
use Modules\EmployeeManagement\Services\EmployeeAdvanceService;

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

    public function show(int $employeeId, int $advanceId): JsonResponse
    {
        $advance = $this->advanceService->getAdvance($advanceId);
        return response()->json($advance);
    }

    public function approve(ApproveAdvanceRequest $request, int $employeeId, int $advanceId): JsonResponse
    {
        $advance = $this->advanceService->approveAdvance(
            $advanceId,
            $request->user(),
            $request->validated('notes')
        );

        return response()->json($advance);
    }

    public function reject(RejectAdvanceRequest $request, int $employeeId, int $advanceId): JsonResponse
    {
        $advance = $this->advanceService->rejectAdvance(
            $advanceId,
            $request->user(),
            $request->validated('reason')
        );

        return response()->json($advance);
    }

    public function processDeduction(ProcessDeductionRequest $request, int $employeeId, int $advanceId): JsonResponse
    {
        $advance = $this->advanceService->processDeduction(
            $advanceId,
            $request->validated('amount'),
            $request->validated('notes')
        );

        return response()->json($advance);
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

    public function deductionSchedule(int $employeeId, int $advanceId): JsonResponse
    {
        $advance = $this->advanceService->getAdvance($advanceId);
        $schedule = $this->advanceService->calculateDeductionSchedule($advance);
        return response()->json($schedule);
    }
}

