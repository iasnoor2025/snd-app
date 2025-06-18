<?php

namespace Modules\LeaveManagement\Repositories;

use Modules\LeaveManagement\Domain\Models\LeaveType;

class LeaveTypeRepository
{
    /**
     * Get all active leave types
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAllActive()
    {
        return LeaveType::active()->get();
    }
}
