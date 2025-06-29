<?php

namespace Modules\PayrollManagement\Console\Commands;

use Illuminate\Console\Command;
use Modules\PayrollManagement\Services\PayrollService;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AutomatePayrollProcessing extends Command
{
    protected $signature = 'payroll:process-automated {--month=}';
    protected $description = 'Automatically process payroll for all employees for the given or current month';

    public function handle(PayrollService $payrollService)
    {
        $month = $this->option('month') ?: Carbon::now()->format('Y-m');
        $this->info("Starting automated payroll processing for month: $month");
        try {
            $payrollService->generatePayrollRun($month, null); // null for system user
            $this->info('Payroll processing completed successfully.');
            Log::info('Automated payroll processing completed', ['month' => $month]);
        } catch (\Exception $e) {
            $this->error('Payroll processing failed: ' . $e->getMessage());
            Log::error('Automated payroll processing failed', ['error' => $e->getMessage(), 'month' => $month]);
        }
    }
}
