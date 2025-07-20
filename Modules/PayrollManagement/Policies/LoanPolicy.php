<?php

namespace Modules\PayrollManagement\Policies;

use Illuminate\Auth\Access\HandlesAuthorization;
use App\Models\User;
use Modules\PayrollManagement\Domain\Models\Loan;

class LoanPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any loans.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('loans.view');
    }

    /**
     * Determine whether the user can view the loan.
     */
    public function view(User $user, Loan $loan): bool
    {
        return $user->hasPermissionTo('loans.view') ||
               $user->id === $loan->employee_id;
    }

    /**
     * Determine whether the user can create loans.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('loans.create');
    }

    /**
     * Determine whether the user can update the loan.
     */
    public function update(User $user, Loan $loan): bool
    {
        return $user->hasPermissionTo('loans.edit') ||
               $user->id === $loan->employee_id;
    }

    /**
     * Determine whether the user can delete the loan.
     */
    public function delete(User $user, Loan $loan): bool
    {
        return $user->hasPermissionTo('loans.delete');
    }

    /**
     * Determine whether the user can approve the loan.
     */
    public function approve(User $user, Loan $loan): bool
    {
        return $user->hasPermissionTo('loans.edit') &&
               $loan->status === 'pending';
    }

    /**
     * Determine whether the user can process loan repayment.
     */
    public function repay(User $user, Loan $loan): bool
    {
        return $user->hasPermissionTo('loans.edit') &&
               $loan->status === 'approved';
    }

    /**
     * Determine whether the user can view their own loans.
     */
    public function viewOwn(User $user): bool
    {
        return true; // Users can always view their own loans
    }
}
