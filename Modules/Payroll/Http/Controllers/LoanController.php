<?php

namespace Modules\Payroll\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\Payroll\Domain\Models\Loan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        $query = Loan::query();
        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }
        return response()->json($query->with(['employee', 'approver'])->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'amount' => 'required|numeric',
            'interest_rate' => 'nullable|numeric',
            'term_months' => 'required|integer',
            'notes' => 'nullable|string',
        ]);
        $loan = Loan::create($data);
        return response()->json($loan->load(['employee']), 201);
    }

    public function show(Loan $loan)
    {
        return response()->json($loan->load(['employee', 'approver']));
    }

    public function update(Request $request, Loan $loan)
    {
        $data = $request->validate([
            'amount' => 'sometimes|required|numeric',
            'interest_rate' => 'nullable|numeric',
            'term_months' => 'sometimes|required|integer',
            'notes' => 'nullable|string',
        ]);
        $loan->update($data);
        return response()->json($loan->fresh(['employee', 'approver']));
    }

    public function destroy(Loan $loan)
    {
        $loan->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function approve(Loan $loan)
    {
        $loan->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => Carbon::now(),
        ]);
        return response()->json($loan->fresh(['employee', 'approver']));
    }

    public function repay(Request $request, Loan $loan)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);
        $loan->repaid_amount += $data['amount'];
        if ($loan->repaid_amount >= $loan->amount) {
            $loan->status = 'closed';
            $loan->end_date = Carbon::now();
        }
        $loan->save();
        return response()->json($loan->fresh(['employee', 'approver']));
    }
}
