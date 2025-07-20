<?php

namespace Modules\EmployeeManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Modules\EmployeeManagement\Domain\Models\SalaryIncrement;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EmployeeManagement\Services\SalaryIncrementService;
use Modules\EmployeeManagement\Http\Requests\CreateSalaryIncrementRequest;
use Modules\EmployeeManagement\Http\Requests\ApproveSalaryIncrementRequest;
use Modules\EmployeeManagement\Http\Requests\RejectSalaryIncrementRequest;
use Modules\Core\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Exception;

class SalaryIncrementController extends Controller
{
    public function __construct(
        private SalaryIncrementService $salaryIncrementService
    ) {}

    /**
     * Display a listing of salary increments
     */
    public function index(Request $request): Response
    {
        $filters = $request->only([
            'employee_id',
            'status',
            'increment_type',
            'effective_date_from',
            'effective_date_to',
            'requested_by',
            'per_page'
        ]);

        $increments = $this->salaryIncrementService->getIncrements($filters);
        $statistics = $this->salaryIncrementService->getStatistics();
        $projectedCostData = $this->salaryIncrementService->calculateProjectedAnnualCost();

        return Inertia::render('EmployeeManagement/SalaryIncrements/Index', [
            'increments' => $increments,
            'statistics' => $statistics,
            'projectedCost' => $projectedCostData['total_annual_increase'],
            'filters' => $filters,
            'employees' => Employee::select('id', 'first_name', 'last_name', 'employee_id')
                ->orderBy('first_name')
                ->get(),
        ]);
    }

    /**
     * Show the form for creating a new salary increment
     */
    public function create(Request $request): Response
    {
        $employeeId = $request->get('employee_id');
        $employee = null;

        if ($employeeId) {
            $employee = Employee::with(['salaries' => function ($query) {
                $query->where('status', 'approved')
                    ->where('effective_from', '<=', now())
                    ->where(function ($q) {
                        $q->whereNull('effective_to')
                            ->orWhere('effective_to', '>=', now());
                    })
                    ->latest('effective_from');
            }])->findOrFail($employeeId);
        }

        // Get all employees with salary data
        $employees = Employee::select(
            'id',
            'first_name',
            'last_name',
            'employee_id',
            'basic_salary as base_salary',
            'food_allowance',
            'housing_allowance',
            'transport_allowance'
        )
        ->with(['department', 'position'])
        ->orderBy('first_name')
        ->get();

        return Inertia::render('EmployeeManagement/SalaryIncrements/Create', [
            'employee' => $employee,
            'employees' => $employees,
            'incrementTypes' => [
                SalaryIncrement::TYPE_PERCENTAGE => 'Percentage Increase',
                SalaryIncrement::TYPE_AMOUNT => 'Fixed Amount Increase',
                SalaryIncrement::TYPE_PROMOTION => 'Promotion',
                SalaryIncrement::TYPE_ANNUAL_REVIEW => 'Annual Review',
                SalaryIncrement::TYPE_PERFORMANCE => 'Performance Based',
                SalaryIncrement::TYPE_MARKET_ADJUSTMENT => 'Market Adjustment',
            ],
        ]);
    }

    /**
     * Store a newly created salary increment
     */
    public function store(CreateSalaryIncrementRequest $request): RedirectResponse
    {
        try {
            $increment = $this->salaryIncrementService->createIncrement(
                $request->validated(),
                $request->user()
            );

            return redirect()
                ->route('salary-increments.show', $increment)
                ->with('success', 'Salary increment request created successfully.');
        } catch (Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create salary increment: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified salary increment
     */
    public function show(SalaryIncrement $salaryIncrement): Response
    {
        $salaryIncrement->load([
            'employee.department',
            'employee.position',
            'requestedBy',
            'approvedBy',
            'rejectedBy'
        ]);

        return Inertia::render('EmployeeManagement/SalaryIncrements/Show', [
            'increment' => $salaryIncrement,
            'canApprove' => $salaryIncrement->canBeApproved(),
            'canReject' => $salaryIncrement->canBeRejected(),
            'canApply' => $salaryIncrement->canBeApplied(),
        ]);
    }

    /**
     * Show the form for editing the specified salary increment
     */
    public function edit(SalaryIncrement $salaryIncrement): Response
    {
        if (!$salaryIncrement->isPending()) {
            abort(403, 'Only pending salary increments can be edited.');
        }

        $salaryIncrement->load('employee');

        return Inertia::render('EmployeeManagement/SalaryIncrements/Edit', [
            'increment' => $salaryIncrement,
            'employees' => Employee::select('id', 'first_name', 'last_name', 'employee_id', 'basic_salary as base_salary', 'food_allowance', 'housing_allowance', 'transport_allowance')
                ->with(['department', 'position'])
                ->orderBy('first_name')
                ->get(),
            'incrementTypes' => [
                SalaryIncrement::TYPE_PERCENTAGE => 'Percentage Increase',
                SalaryIncrement::TYPE_AMOUNT => 'Fixed Amount Increase',
                SalaryIncrement::TYPE_PROMOTION => 'Promotion',
                SalaryIncrement::TYPE_ANNUAL_REVIEW => 'Annual Review',
                SalaryIncrement::TYPE_PERFORMANCE => 'Performance Based',
                SalaryIncrement::TYPE_MARKET_ADJUSTMENT => 'Market Adjustment',
            ],
        ]);
    }

    /**
     * Update the specified salary increment
     */
    public function update(CreateSalaryIncrementRequest $request, SalaryIncrement $salaryIncrement): RedirectResponse
    {
        if (!$salaryIncrement->isPending()) {
            return back()->withErrors(['error' => 'Only pending salary increments can be updated.']);
        }

        try {
            $salaryIncrement->update($request->validated());

            return redirect()
                ->route('salary-increments.show', $salaryIncrement)
                ->with('success', 'Salary increment updated successfully.');
        } catch (Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update salary increment: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified salary increment
     */
    public function destroy(SalaryIncrement $salaryIncrement): RedirectResponse
    {
        if (!$salaryIncrement->isPending()) {
            return back()->withErrors(['error' => 'Only pending salary increments can be deleted.']);
        }

        try {
            $salaryIncrement->delete();

            return redirect()
                ->route('salary-increments.index')
                ->with('success', 'Salary increment deleted successfully.');
        } catch (Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete salary increment: ' . $e->getMessage()]);
        }
    }

    /**
     * Approve a salary increment
     */
    public function approve(ApproveSalaryIncrementRequest $request, SalaryIncrement $salaryIncrement): RedirectResponse
    {
        try {
            $this->salaryIncrementService->approveIncrement($salaryIncrement, $request->user());

            return back()->with('success', 'Salary increment approved successfully.');
        } catch (Exception $e) {
            return back()->withErrors(['error' => 'Failed to approve salary increment: ' . $e->getMessage()]);
        }
    }

    /**
     * Reject a salary increment
     */
    public function reject(RejectSalaryIncrementRequest $request, SalaryIncrement $salaryIncrement): RedirectResponse
    {
        try {
            $this->salaryIncrementService->rejectIncrement(
                $salaryIncrement,
                $request->user(),
                $request->input('rejection_reason')
            );

            return back()->with('success', 'Salary increment rejected.');
        } catch (Exception $e) {
            return back()->withErrors(['error' => 'Failed to reject salary increment: ' . $e->getMessage()]);
        }
    }

    /**
     * Apply a salary increment manually
     */
    public function apply(SalaryIncrement $salaryIncrement): RedirectResponse
    {
        try {
            $this->salaryIncrementService->applyIncrement($salaryIncrement);

            return back()->with('success', 'Salary increment applied successfully.');
        } catch (Exception $e) {
            return back()->withErrors(['error' => 'Failed to apply salary increment: ' . $e->getMessage()]);
        }
    }

    /**
     * Get salary increments for API
     */
    public function apiIndex(Request $request): JsonResponse
    {
        $filters = $request->only([
            'employee_id',
            'status',
            'increment_type',
            'effective_date_from',
            'effective_date_to',
            'requested_by',
            'per_page'
        ]);

        $increments = $this->salaryIncrementService->getIncrements($filters);

        return response()->json($increments);
    }

    /**
     * Get salary increment statistics for API
     */
    public function apiStatistics(Request $request): JsonResponse
    {
        $filters = $request->only(['from_date', 'to_date']);
        $statistics = $this->salaryIncrementService->getStatistics($filters);

        return response()->json($statistics);
    }

    /**
     * Get employee salary history including increments
     */
    public function employeeSalaryHistory(Employee $employee): JsonResponse
    {
        $history = $this->salaryIncrementService->getEmployeeSalaryHistory($employee);

        return response()->json($history);
    }

    /**
     * Apply due salary increments (for scheduled jobs)
     */
    public function applyDueIncrements(): JsonResponse
    {
        try {
            $appliedIncrements = $this->salaryIncrementService->applyDueIncrements();

            return response()->json([
                'success' => true,
                'message' => "Applied {$appliedIncrements->count()} salary increments.",
                'applied_increments' => $appliedIncrements,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to apply due increments: ' . $e->getMessage(),
            ], 500);
        }
    }
}
