<?php

namespace Modules\PayrollManagement\Http\Controllers;

use Modules\PayrollManagement\Domain\Models\AdvanceSalary;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\PayrollManagement\Domain\Models\Payroll;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class AdvanceSalaryController extends Controller
{
    public function store(Request $request, $employeeId)
    {
        $employee = Employee::findOrFail($employeeId);

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0',
            'remarks' => 'nullable|string',
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2000'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if amount is within limit (50% of base salary)
        if ($request->amount > ($employee->base_salary * 0.5)) {
            return response()->json([
                'message' => 'Advance amount cannot exceed 50% of base salary'
            ], 422);
        }

        $advanceSalary = AdvanceSalary::create([
            'employee_id' => $employeeId,
            'request_date' => now(),
            'amount' => $request->amount,
            'remarks' => $request->remarks,
            'month' => $request->month,
            'year' => $request->year,
            'status' => 'pending'
        ]);

        return response()->json($advanceSalary, 201);
    }

    public function index(Request $request)
    {
        $query = AdvanceSalary::with(['employee:id,first_name,last_name', 'approver'])
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->employee_id, function ($query, $employeeId) {
                return $query->where('employee_id', $employeeId);
            })
            ->when($request->date_range, function ($query, $dateRange) {
                $dates = explode(' to ', $dateRange);
                return $query->whereBetween('request_date', [
                    Carbon::parse($dates[0])->startOfDay(),
                    Carbon::parse($dates[1])->endOfDay()
                ]);
            });

        $advances = $query->latest()->paginate(10);

        return Inertia::render('AdvanceSalary/Index', [
            'advances' => $advances,
            'filters' => $request->only(['status', 'employee_id', 'date_range']),
            'employees' => Employee::select('id', 'first_name', 'last_name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('AdvanceSalary/Create', [
            'employees' => Employee::select('id', 'name', 'base_salary')->get(),
        ]);
    }

    public function show(AdvanceSalary $advanceSalary)
    {
        $advanceSalary->load(['employee', 'approver']);

        return Inertia::render('AdvanceSalary/Show', [
            'advance' => $advanceSalary,
        ]);
    }

    public function approve(AdvanceSalary $advanceSalary)
    {
        if (!$advanceSalary->isPending()) {
            return back()->withErrors([
                'message' => 'Only pending advance salary requests can be approved.',
            ]);
        }

        $advanceSalary->approve(auth()->user());

        return back()->with('success', 'Advance salary request approved successfully.');
    }

    public function reject(AdvanceSalary $advanceSalary)
    {
        if (!$advanceSalary->isPending()) {
            return back()->withErrors([
                'message' => 'Only pending advance salary requests can be rejected.',
            ]);
        }

        $advanceSalary->reject();

        return back()->with('success', 'Advance salary request rejected successfully.');
    }

    public function markAsDeducted(AdvanceSalary $advanceSalary)
    {
        if (!$advanceSalary->isApproved()) {
            return back()->withErrors([
                'message' => 'Only approved advance salary requests can be marked as deducted.',
            ]);
        }

        $advanceSalary->markAsDeducted();

        return back()->with('success', 'Advance salary marked as deducted successfully.');
    }

    public function employeeView()
    {
        return Inertia::render('AdvanceSalary/EmployeeView');
    }

    public function adminView()
    {
        return Inertia::render('AdvanceSalary/AdminView');
    }

    /**
     * Toggle advance salary eligibility for an employee
     */
    public function toggleEligibility(Request $request, Employee $employee)
    {
        $request->validate([
            'eligible' => 'required|boolean'
        ]);

        $employee->update([
            'advance_salary_eligible' => $request->eligible
        ]);

        return response()->json([
            'message' => 'Advance salary eligibility updated successfully',
            'employee' => $employee
        ]);
    }

    /**
     * Toggle advance salary approval for current month
     */
    public function toggleApproval(Request $request, Employee $employee)
    {
        $request->validate([
            'approved' => 'required|boolean'
        ]);

        DB::transaction(function () use ($request, $employee) {
            $employee->update([
                'advance_salary_approved_this_month' => $request->approved
            ]);

            if ($request->approved) {
                // Generate payroll for current month
                $currentMonth = Carbon::now();

                Payroll::create([
                    'employee_id' => $employee->id,
                    'salary_month' => $currentMonth,
                    'base_salary' => $employee->basic_salary,
                    'overtime_hours' => 0,
                    'overtime_amount' => 0,
                    'bonus' => 0,
                    'deduction' => 0,
                    'net_salary' => $employee->basic_salary + $employee->total_allowances,
                    'generated_at' => now(),
                    'is_advance_salary' => true
                ]);
            }
        });

        return response()->json([
            'message' => 'Advance salary approval updated successfully',
            'employee' => $employee
        ]);
    }

    /**
     * Get list of employees eligible for advance salary
     */
    public function getEligibleEmployees()
    {
        $employees = Employee::where('advance_salary_eligible', true)
            ->where('status', 'active')
            ->with(['designation', 'user'])
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->full_name,
                    'position' => $employee->designation->name ?? 'N/A',
                    'basic_salary' => $employee->basic_salary,
                    'total_allowances' => $employee->total_allowances,
                    'advance_approved' => $employee->advance_salary_approved_this_month
                ];
            });

        return response()->json($employees);
    }
}


