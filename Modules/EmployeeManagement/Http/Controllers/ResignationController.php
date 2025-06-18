<?php

namespace Modules\EmployeeManagement\Http\Controllers;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EmployeeManagement\Domain\Models\Resignation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class ResignationController extends Controller
{
    public function index(Request $request)
    {
        $query = Resignation::with(['employee:id,first_name,last_name', 'approver'])
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->employee_id, function ($query, $employeeId) {
                return $query->where('employee_id', $employeeId);
            });

        // If user is not admin/hr, only show their own resignations
        if (!auth()->user()->hasRole(['admin', 'hr'])) {
            $query->where('employee_id', auth()->user()->employee->id);
        }

        $resignations = $query->latest()->paginate(10);

        return Inertia::render('Resignations/Index', [
            'resignations' => $resignations,
            'filters' => $request->only(['status', 'employee_id'])
        ]);
    }

    public function create(Employee $employee)
    {
        return Inertia::render('Resignations/Create', [
            'employee' => $employee,
        ]);
    }

    public function store(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'last_working_day' => 'required|date|after:today',
            'reason' => 'required|string|min:10',
            'notes' => 'nullable|string',
        ]);

        $resignation = $employee->resignations()->create($validated);

        return redirect()
            ->route('employees.show', $employee)
            ->with('success', 'Resignation request submitted successfully.');
    }

    public function show(Resignation $resignation)
    {
        $resignation->load(['employee', 'approver']);

        return Inertia::render('Resignations/Show', [
            'resignation' => $resignation,
        ]);
    }

    public function approve(Request $request, Resignation $resignation)
    {
        $resignation->approve($request->user());

        return back()->with('success', 'Resignation approved successfully.');
    }

    public function reject(Request $request, Resignation $resignation)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|min:10'
        ]);

        $resignation->reject($validated['rejection_reason']);

        return back()->with('success', 'Resignation rejected successfully.');
    }
}


