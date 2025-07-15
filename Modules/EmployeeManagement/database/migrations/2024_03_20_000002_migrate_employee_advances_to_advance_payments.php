<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Only run if both tables exist
        if (!Schema::hasTable('employee_advances') || !Schema::hasTable('advance_payments')) {
            return;
        }

        $employeeAdvances = DB::table('employee_advances')->get();
        foreach ($employeeAdvances as $advance) {
            // Check if already migrated (by unique fields: employee_id, amount, reason, created_at)
            $exists = DB::table('advance_payments')->where([
                'employee_id' => $advance->employee_id,
                'amount' => $advance->amount,
                'reason' => $advance->reason,
                'created_at' => $advance->created_at,
            ])->exists();
            if ($exists) continue;

            DB::table('advance_payments')->insert([
                'employee_id' => $advance->employee_id,
                'amount' => $advance->amount,
                'reason' => $advance->reason,
                'purpose' => $advance->reason, // No separate purpose field
                'status' => $advance->status,
                'payment_date' => $advance->payment_date,
                'monthly_deduction' => $advance->deduction_amount,
                'repayment_date' => null, // Not present in old table
                'estimated_months' => null, // Not present in old table
                'rejection_reason' => $advance->rejection_reason,
                'approved_by' => $advance->approved_by,
                'approved_at' => $advance->approved_at,
                'rejected_by' => $advance->rejected_by,
                'rejected_at' => $advance->rejected_at,
                'repaid_amount' => $advance->repaid_amount ?? 0,
                'created_at' => $advance->created_at,
                'updated_at' => $advance->updated_at,
                'deleted_at' => $advance->deleted_at,
            ]);
        }
    }

    public function down(): void
    {
        // Optionally, remove migrated records (by created_at and employee_id)
        if (!Schema::hasTable('employee_advances') || !Schema::hasTable('advance_payments')) {
            return;
        }
        $employeeAdvances = DB::table('employee_advances')->get();
        foreach ($employeeAdvances as $advance) {
            DB::table('advance_payments')
                ->where('employee_id', $advance->employee_id)
                ->where('amount', $advance->amount)
                ->where('reason', $advance->reason)
                ->where('created_at', $advance->created_at)
                ->delete();
        }
    }
};
