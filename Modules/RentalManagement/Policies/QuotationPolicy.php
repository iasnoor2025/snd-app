<?php

namespace Modules\RentalManagement\Policies;

use Modules\Core\Domain\Models\User;
use Modules\RentalManagement\Domain\Models\Quotation;

class QuotationPolicy
{
    /**
     * Determine whether the user can view the quotation.
     */
    public function view(User $user, Quotation $quotation): bool
    {
        // Admins can always view
        if ($user->hasRole('admin')) {
            return true;
        }
        // Users with quotations.view permission can view
        return $user->can('quotations.view');
    }

    /**
     * Determine whether the user can approve the quotation.
     */
    public function approve(User $user, Quotation $quotation): bool
    {
        // Admins can always approve
        if ($user->hasRole('admin')) {
            return true;
        }
        // Users with quotations.approve permission can approve
        return $user->can('quotations.approve');
    }
}
