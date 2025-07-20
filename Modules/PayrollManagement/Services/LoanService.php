<?php

namespace Modules\PayrollManagement\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Modules\PayrollManagement\Domain\Models\Loan;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Illuminate\Support\Carbon;

class LoanService
{
    /**
     * Get all loans with filtering
     */
    public function getLoans(array $filters = [])
    {
        $query = Loan::with(['employee', 'approver']);

        if (isset($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['amount_min'])) {
            $query->where('amount', '>=', $filters['amount_min']);
        }

        if (isset($filters['amount_max'])) {
            $query->where('amount', '<=', $filters['amount_max']);
        }

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        $perPage = $filters['per_page'] ?? 20;
        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Create a new loan
     */
    public function createLoan(array $data)
    {
        $data['created_by'] = Auth::id();
        $data['status'] = $data['status'] ?? 'pending';
        $data['repaid_amount'] = 0;

        return Loan::create($data);
    }

    /**
     * Update a loan
     */
    public function updateLoan(int $id, array $data)
    {
        $loan = Loan::findOrFail($id);
        $data['updated_by'] = Auth::id();

        $loan->update($data);
        return $loan->fresh(['employee', 'approver']);
    }

    /**
     * Delete a loan
     */
    public function deleteLoan(int $id)
    {
        $loan = Loan::findOrFail($id);
        return $loan->delete();
    }

    /**
     * Get loan by ID
     */
    public function getLoan(int $id)
    {
        return Loan::with(['employee', 'approver'])->findOrFail($id);
    }

    /**
     * Approve a loan
     */
    public function approveLoan(int $id, array $data = [])
    {
        $loan = Loan::findOrFail($id);

        $loan->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => Carbon::now(),
            'approval_notes' => $data['approval_notes'] ?? null,
        ]);

        return $loan->fresh(['employee', 'approver']);
    }

    /**
     * Reject a loan
     */
    public function rejectLoan(int $id, array $data)
    {
        $loan = Loan::findOrFail($id);

        $loan->update([
            'status' => 'rejected',
            'rejected_by' => Auth::id(),
            'rejected_at' => Carbon::now(),
            'rejection_reason' => $data['rejection_reason'] ?? null,
        ]);

        return $loan->fresh(['employee', 'rejecter']);
    }

    /**
     * Process loan repayment
     */
    public function processRepayment(int $id, array $data)
    {
        $loan = Loan::findOrFail($id);

        $repaymentAmount = $data['amount'];
        $newRepaidAmount = $loan->repaid_amount + $repaymentAmount;

        $loan->update([
            'repaid_amount' => $newRepaidAmount,
        ]);

        // Check if loan is fully repaid
        if ($newRepaidAmount >= $loan->amount) {
            $loan->update([
                'status' => 'closed',
                'end_date' => Carbon::now(),
            ]);
        }

        return $loan->fresh(['employee', 'approver']);
    }

    /**
     * Get loan statistics
     */
    public function getLoanStatistics()
    {
        $stats = [
            'total_loans' => Loan::count(),
            'pending_loans' => Loan::where('status', 'pending')->count(),
            'approved_loans' => Loan::where('status', 'approved')->count(),
            'rejected_loans' => Loan::where('status', 'rejected')->count(),
            'closed_loans' => Loan::where('status', 'closed')->count(),
            'total_amount' => Loan::sum('amount'),
            'total_repaid' => Loan::sum('repaid_amount'),
            'outstanding_amount' => Loan::sum('amount') - Loan::sum('repaid_amount'),
        ];

        return $stats;
    }

    /**
     * Get loans for dashboard
     */
    public function getDashboardLoans(int $limit = 5)
    {
        return Loan::with(['employee', 'approver'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get employee loan history
     */
    public function getEmployeeLoanHistory(int $employeeId)
    {
        return Loan::where('employee_id', $employeeId)
            ->with(['employee', 'approver'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Calculate loan interest
     */
    public function calculateInterest(Loan $loan)
    {
        if (!$loan->interest_rate || $loan->interest_rate <= 0) {
            return 0;
        }

        $principal = $loan->amount;
        $rate = $loan->interest_rate / 100;
        $time = $loan->term_months / 12;

        return $principal * $rate * $time;
    }

    /**
     * Get loan payment schedule
     */
    public function getPaymentSchedule(Loan $loan)
    {
        if (!$loan->term_months || $loan->term_months <= 0) {
            return [];
        }

        $monthlyPayment = $loan->amount / $loan->term_months;
        $schedule = [];
        $remainingBalance = $loan->amount;

        for ($month = 1; $month <= $loan->term_months; $month++) {
            $payment = min($monthlyPayment, $remainingBalance);
            $remainingBalance -= $payment;

            $schedule[] = [
                'month' => $month,
                'payment_date' => $loan->created_at->addMonths($month),
                'payment_amount' => $payment,
                'remaining_balance' => $remainingBalance,
                'status' => $remainingBalance <= 0 ? 'completed' : 'pending',
            ];
        }

        return $schedule;
    }

    /**
     * Check loan eligibility
     */
    public function checkLoanEligibility(int $employeeId, float $amount)
    {
        $employee = Employee::findOrFail($employeeId);

        // Get employee's active loans
        $activeLoans = Loan::where('employee_id', $employeeId)
            ->whereIn('status', ['pending', 'approved'])
            ->sum('amount');

        // Get employee's salary (assuming monthly salary)
        $monthlySalary = $employee->salary ?? 0;

        // Calculate debt-to-income ratio
        $debtToIncomeRatio = $activeLoans / max($monthlySalary, 1);

        // Check if new loan would exceed reasonable debt-to-income ratio (e.g., 40%)
        $newDebtToIncomeRatio = ($activeLoans + $amount) / max($monthlySalary, 1);

        return [
            'eligible' => $newDebtToIncomeRatio <= 0.4,
            'current_debt' => $activeLoans,
            'debt_to_income_ratio' => $debtToIncomeRatio,
            'new_debt_to_income_ratio' => $newDebtToIncomeRatio,
            'max_recommended_loan' => ($monthlySalary * 0.4) - $activeLoans,
        ];
    }
}
