<?php

namespace Modules\PayrollManagement\Events;

use Modules\PayrollManagement\Domain\Models\Payroll;
use Illuminate\Queue\SerializesModels;

class PayrollUpdated
{
    use SerializesModels;
    public $payroll;

    /**
     * Create a new event instance.
     */
    public function __construct(Payroll $payroll)
    {
        $this->payroll = $payroll;
    }
}

