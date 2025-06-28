<?php

namespace Modules\Payroll\Events;

use Modules\Payroll\Domain\Models\Payroll;
use Illuminate\Queue\SerializesModels;

class PayrollCreated
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

