<?php

namespace Modules\EmployeeManagement\Observers;

use Modules\EmployeeManagement\Domain\Models\AdvancePayment;
use Illuminate\Support\Facades\Log;

class AdvancePaymentObserver
{
    /**
     * Handle the AdvancePayment "created" event.
     */
    public function created(AdvancePayment $advancePayment): void
    {
        Log::info('Advance payment created', [
            'id' => $advancePayment->id,
            'employee_id' => $advancePayment->employee_id,
            'amount' => $advancePayment->amount,
            'status' => $advancePayment->status
        ]);
    }

    /**
     * Handle the AdvancePayment "updated" event.
     */
    public function updated(AdvancePayment $advancePayment): void
    {
        Log::info('Advance payment updated', [
            'id' => $advancePayment->id,
            'employee_id' => $advancePayment->employee_id,
            'amount' => $advancePayment->amount,
            'status' => $advancePayment->status,
            'repaid_amount' => $advancePayment->repaid_amount
        ]);
    }

    /**
     * Handle the AdvancePayment "deleted" event.
     */
    public function deleted(AdvancePayment $advancePayment): void
    {
        Log::info('Advance payment deleted', [
            'id' => $advancePayment->id,
            'employee_id' => $advancePayment->employee_id,
            'amount' => $advancePayment->amount
        ]);
    }

    /**
     * Handle the AdvancePayment "restored" event.
     */
    public function restored(AdvancePayment $advancePayment): void
    {
        Log::info('Advance payment restored', [
            'id' => $advancePayment->id,
            'employee_id' => $advancePayment->employee_id,
            'amount' => $advancePayment->amount
        ]);
    }

    /**
     * Handle the AdvancePayment "force deleted" event.
     */
    public function forceDeleted(AdvancePayment $advancePayment): void
    {
        Log::info('Advance payment force deleted', [
            'id' => $advancePayment->id,
            'employee_id' => $advancePayment->employee_id,
            'amount' => $advancePayment->amount
        ]);
    }
}

