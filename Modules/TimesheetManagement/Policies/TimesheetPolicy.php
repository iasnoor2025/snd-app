<?php

namespace Modules\TimesheetManagement\Policies;

use Illuminate\Auth\Access\HandlesAuthorization;
use Modules\Core\Domain\Models\User;
use Modules\TimesheetManagement\Domain\Models\Timesheet;

class TimesheetPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any timesheets.
     */
    public function viewAny(User $user): bool
    {
        // Everyone with access to the module can view the timesheet list
        return true;
    }

    /**
     * Determine whether the user can view the timesheet.
     */
    public function view(User $user, Timesheet $timesheet): bool
    {
        // Users can view their own timesheets
        if ($user->employee && $timesheet->employee_id === $user->employee->id) {
            return true;
        }

        // Admins, HR, and managers can view all timesheets
        return $user->hasRole(['admin', 'hr', 'manager']);
    }

    /**
     * Determine whether the user can create timesheets.
     */
    public function create(User $user): bool
    {
        // Users can create their own timesheets, admins and HR can create for anyone
        return $user->employee || $user->hasRole(['admin', 'hr']);
    }

    /**
     * Determine whether the user can update the timesheet.
     */
    public function update(User $user, Timesheet $timesheet): bool
    {
        // Can only update if timesheet is in draft or rejected status
        if (!$timesheet->canBeEdited()) {
            return false;
        }

        // Users can update their own timesheets
        if ($user->employee && $timesheet->employee_id === $user->employee->id) {
            return true;
        }

        // Admins and HR can update any timesheet
        return $user->hasRole(['admin', 'hr']);
    }

    /**
     * Determine whether the user can delete the timesheet.
     */
    public function delete(User $user, Timesheet $timesheet): bool
    {
        // Can only delete if timesheet is in draft status
        if ($timesheet->status !== Timesheet::STATUS_DRAFT) {
            return false;
        }

        // Users can delete their own draft timesheets
        if ($user->employee && $timesheet->employee_id === $user->employee->id) {
            return true;
        }

        // Admins and HR can delete any draft timesheet
        return $user->hasRole(['admin', 'hr']);
    }

    /**
     * Determine whether the user can submit the timesheet.
     */
    public function submit(User $user, Timesheet $timesheet): bool
    {
        // Can only submit if timesheet is in draft or rejected status
        if (!$timesheet->canBeSubmitted()) {
            return false;
        }

        // Users can submit their own timesheets
        if ($user->employee && $timesheet->employee_id === $user->employee->id) {
            return true;
        }

        // Admins and HR can submit any timesheet
        return $user->hasRole(['admin', 'hr']);
    }

    /**
     * Determine whether the user can approve timesheets as a foreman.
     */
    public function approveAsForeman(User $user, Timesheet $timesheet): bool
    {
        // Can only approve if timesheet is in submitted status
        if (!$timesheet->canBeApprovedByForeman()) {
            return false;
        }

        // Check if user has foreman role
        return $user->hasRole(['foreman', 'admin', 'hr']);
    }

    /**
     * Determine whether the user can approve timesheets as a timesheet incharge.
     */
    public function approveAsIncharge(User $user, Timesheet $timesheet): bool
    {
        // Can only approve if timesheet is in foreman approved status
        if (!$timesheet->canBeApprovedByIncharge()) {
            return false;
        }

        // Check if user has incharge role
        return $user->hasRole(['timesheet_incharge', 'admin', 'hr']);
    }

    /**
     * Determine whether the user can approve timesheets as a checking incharge.
     */
    public function approveAsChecking(User $user, Timesheet $timesheet): bool
    {
        // Can only approve if timesheet is in incharge approved status
        if (!$timesheet->canBeApprovedByChecking()) {
            return false;
        }

        // Check if user has checking role
        return $user->hasRole(['timesheet_checking', 'admin', 'hr']);
    }

    /**
     * Determine whether the user can approve timesheets as a manager.
     */
    public function approveAsManager(User $user, Timesheet $timesheet): bool
    {
        // Can only approve if timesheet is in checking approved status
        if (!$timesheet->canBeApprovedByManager()) {
            return false;
        }

        // Check if user has manager role
        return $user->hasRole(['manager', 'admin', 'hr']);
    }

    /**
     * Determine whether the user can reject timesheets.
     */
    public function reject(User $user, Timesheet $timesheet): bool
    {
        // Cannot reject already rejected or fully approved timesheets
        if ($timesheet->status === Timesheet::STATUS_REJECTED || $timesheet->status === Timesheet::STATUS_MANAGER_APPROVED) {
            return false;
        }

        // Check user role based on current timesheet status
        switch ($timesheet->status) {
            case Timesheet::STATUS_SUBMITTED:
                return $user->hasRole(['foreman', 'admin', 'hr']);
            case Timesheet::STATUS_FOREMAN_APPROVED:
                return $user->hasRole(['timesheet_incharge', 'admin', 'hr']);
            case Timesheet::STATUS_INCHARGE_APPROVED:
                return $user->hasRole(['timesheet_checking', 'admin', 'hr']);
            case Timesheet::STATUS_CHECKING_APPROVED:
                return $user->hasRole(['manager', 'admin', 'hr']);
            default:
                return false;
        }
    }

    /**
     * Determine whether the user can view reports.
     */
    public function viewReports(User $user): bool
    {
        // Admins, HR, and managers can view reports
        return $user->hasRole(['admin', 'hr', 'manager']);
    }

    /**
     * Determine whether the user can export timesheets.
     */
    public function export(User $user): bool
    {
        // Admins, HR, and managers can export timesheets
        return $user->hasRole(['admin', 'hr', 'manager']);
    }

    /**
     * Determine whether the user can view all employees' timesheets.
     */
    public function viewAllEmployees(User $user): bool
    {
        // Admins and HR can view all employees' timesheets
        return $user->hasRole(['admin', 'hr']);
    }
}

