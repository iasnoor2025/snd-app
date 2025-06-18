<?php

namespace Modules\Payroll\Events;

use Modules\Payroll\Domain\Models\Payroll;
use Illuminate\Queue\SerializesModels;

class PayrollProcessed
{
    use SerializesModels;
use public $payroll;

    /**
     * Create a new event instance.
     */
    public function __construct(Payroll $payroll)
    {
        $this->payroll = $payroll;
    }
}

