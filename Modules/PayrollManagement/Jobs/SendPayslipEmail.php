<?php

namespace Modules\PayrollManagement\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Modules\EmployeeManagement\Models\Employee;
use Illuminate\Support\Facades\Mail;
use Modules\PayrollManagement\Notifications\PayslipGeneratedNotification;

class SendPayslipEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Employee $employee;
    protected string $payslipPath;
    protected string $period;

    /**
     * Create a new job instance.
     */
    public function __construct(Employee $employee, string $payslipPath, string $period)
    {
        $this->employee = $employee;
        $this->payslipPath = $payslipPath;
        $this->period = $period;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $notification = new PayslipGeneratedNotification(
                $this->employee,
                $this->payslipPath,
                $this->period
            );

            Mail::to($this->employee->email)->send($notification);

            // Log successful email
            \Log::info('Payslip email sent successfully', [
                'employee_id' => $this->employee->id,
                'period' => $this->period,
            ]);
        } catch (\Exception $e) {
            // Log error
            \Log::error('Failed to send payslip email', [
                'employee_id' => $this->employee->id,
                'period' => $this->period,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        \Log::error('Payslip email job failed', [
            'employee_id' => $this->employee->id,
            'period' => $this->period,
            'error' => $exception->getMessage(),
        ]);
    }
} 