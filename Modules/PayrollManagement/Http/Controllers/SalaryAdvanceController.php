<?php

namespace Modules\PayrollManagement\Http\Controllers;

use Modules\PayrollManagement\Domain\Models\SalaryAdvance;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class SalaryAdvanceController extends Controller
{
    /**
     * Display a listing of salary advances
     */
    public function index(Request $request)
    {
        $query = SalaryAdvance::with(['employee:id,first_name,last_name', 'approver'])
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->employee_id, function ($query, $employeeId) {
                return $query->where('employee_id', $employeeId);
            });

        // If user is not admin/hr, only show their own advances
        if (!auth()->user()->hasRole(['admin', 'hr'])) {
            $query->where('employee_id', auth()->user()->employee->id);
        }

        $salaryAdvances = $query->latest()->paginate(10);

        return Inertia::render('SalaryAdvance/Index', [
            'salaryAdvances' => $salaryAdvances,
            'filters' => $request->only(['status', 'employee_id'])
        ]);
    }

    /**
     * Show the form for creating a new salary advance
     */
    public function create()
    {
        $employees = auth()->user()->hasRole(['admin', 'hr'])
            ? Employee::active()->get()
            : collect([auth()->user()->employee]);

        return Inertia::render('SalaryAdvance/Create', [
            'employees' => $employees,
        ]);
    }

    /**
     * Store a newly created salary advance
     */
    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'amount' => 'required|numeric|min:0',
            'advance_date' => 'required|date',
            'deduction_start_date' => 'required|date|after:advance_date',
            'reason' => 'required|string|max:500',
        ]);

        // Check if user has permission to create for other employees
        if ($request->employee_id !== auth()->user()->employee->id &&
            !auth()->user()->hasRole(['admin', 'hr'])) {
            return back()->with('error', 'You do not have permission to create salary advances for other employees.');
        }

        $salaryAdvance = SalaryAdvance::create([
            'employee_id' => $request->employee_id,
            'amount' => $request->amount,
            'advance_date' => $request->advance_date,
            'deduction_start_date' => $request->deduction_start_date,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return redirect()->route('salary-advances.show', $salaryAdvance)
            ->with('success', 'Salary advance request submitted successfully.');
    }

    /**
     * Display the specified salary advance
     */
    public function show(SalaryAdvance $salaryAdvance)
    {
        // Check if user has permission to view this advance
        if ($salaryAdvance->employee_id !== auth()->user()->employee->id &&
            !auth()->user()->hasRole(['admin', 'hr'])) {
            abort(403);
        }

        $salaryAdvance->load(['employee', 'approver']);

        return Inertia::render('SalaryAdvance/Show', [
            'salaryAdvance' => $salaryAdvance,
        ]);
    }

    /**
     * Approve the specified salary advance
     */
    public function approve(SalaryAdvance $salaryAdvance)
    {
        if (!auth()->user()->hasRole(['admin', 'hr'])) {
            abort(403);
        }

        $salaryAdvance->approve(auth()->user());

        return back()->with('success', 'Salary advance approved successfully.');
    }

    /**
     * Reject the specified salary advance
     */
    public function reject(SalaryAdvance $salaryAdvance)
    {
        if (!auth()->user()->hasRole(['admin', 'hr'])) {
            abort(403);
        }

        $salaryAdvance->reject();

        return back()->with('success', 'Salary advance rejected successfully.');
    }
}


