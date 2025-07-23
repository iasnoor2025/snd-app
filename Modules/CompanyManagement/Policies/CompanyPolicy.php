<?php

namespace Modules\CompanyManagement\Policies;

use App\Models\User;
use Modules\CompanyManagement\Models\Company;

class CompanyPolicy
{
    public function update(User $user, Company $company = null)
    {
        return $user->hasRole(['admin', 'manager']);
    }
}
