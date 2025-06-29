<?php

namespace Modules\PayrollManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\SoftDeletes;

class FinalSettlement extends Model implements HasMedia
{
    use HasFactory;
use InteractsWithMedia;
use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'employee_id',
        'resignation_id',
        'last_working_day',
        'unpaid_salary',
        'unpaid_overtime',
        'leave_encashment',
        'other_allowances',
        'deductions',
        'total_amount',
        'status',
        'notes',
        'agreement_terms',
        'approved_by',
        'approved_at',
        'completed_at',
        'settlement_date',
        'overtime_amount',
        'bonus_amount',
        'deduction_amount',
        'final_amount',
        'paid_by',
        'paid_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'last_working_day' => 'date',
        'unpaid_salary' => 'decimal:2',
        'unpaid_overtime' => 'decimal:2',
        'leave_encashment' => 'decimal:2',
        'other_allowances' => 'decimal:2',
        'deductions' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'approved_at' => 'datetime',
        'completed_at' => 'datetime',
        'settlement_date' => 'date',
        'overtime_amount' => 'decimal:2',
        'bonus_amount' => 'decimal:2',
        'deduction_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    /**
     * Get the employee that owns the final settlement
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the resignation that owns the final settlement
     */
    public function resignation(): BelongsTo
    {
        return $this->belongsTo(Resignation::class);
    }

    /**
     * Get the user who approved the final settlement
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(FinalSettlementItem::class);
    }

    /**
     * Calculate the total payable amount
     */
    public function calculateTotalPayable(): float
    {
        return $this->leave_encashment +
            $this->unpaid_salary +
            $this->unpaid_overtime +
            $this->other_allowances -
            $this->deductions;
    }

    /**
     * Calculate all components and update total
     */
    public function calculateAll(): void
    {
        $this->calculateTotalPayable();
    }

    /**
     * Approve the final settlement
     */
    public function approve(User $user): void
    {
        if ($this->status !== 'pending') {
            throw new \Exception('Only pending settlements can be approved.');
        }

        $this->update([
            'status' => 'approved',
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);
    }

    /**
     * Reject the final settlement
     */
    public function reject(): void
    {
        if ($this->status !== 'pending') {
            throw new \Exception('Only pending settlements can be rejected.');
        }

        $this->update([
            'status' => 'rejected'
        ]);
    }

    /**
     * Get the latest final settlement for an employee
     */
    public static function getLatestForEmployee(int $employeeId): ?self
    {
        return self::where('employee_id', $employeeId)
            ->latest()
            ->first();
    }

    /**
     * Get all final settlements for an employee
     */
    public static function getAllForEmployee(int $employeeId): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('employee_id', $employeeId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function calculateUnpaidSalary(): float
    {
        // Get the last payroll record
        $lastPayroll = Payroll::where('employee_id', $this->employee_id)
            ->where('month', '<', $this->last_working_day)
            ->latest('month')
            ->first();

        if (!$lastPayroll) {
            return 0;
        }

        // Calculate daily rate
        $dailyRate = $lastPayroll->base_salary / 22; // Assuming 22 working days per month

        // Calculate days from last payroll to last working day
        $days = $this->last_working_day->diffInDays($lastPayroll->month->endOfMonth());
        if ($days > 0) {
            return $dailyRate * $days;
        }

        return 0;
    }

    public function calculateUnpaidOvertime(): float
    {
        // Get unpaid overtime from payroll records
        return Payroll::where('employee_id', $this->employee_id)
            ->where('month', '<', $this->last_working_day)
            ->where('is_paid', false)
            ->sum('overtime_amount');
    }

    public function calculateLeaveEncashment(): float
    {
        // Get employee's leave balance
        $leaveBalance = $this->employee->leave_balance;
        if ($leaveBalance <= 0) {
            return 0;
        }

        // Get the last payroll record for daily rate calculation
        $lastPayroll = Payroll::where('employee_id', $this->employee_id)
            ->where('month', '<', $this->last_working_day)
            ->latest('month')
            ->first();

        if (!$lastPayroll) {
            return 0;
        }

        // Calculate daily rate
        $dailyRate = $lastPayroll->base_salary / 22; // Assuming 22 working days per month

        return $leaveBalance * $dailyRate;
    }

    public function calculateOtherAllowances(): float
    {
        // Implement other allowances calculation
        return 0;
    }

    public function calculateDeductions(): float
    {
        return $this->deductions()->sum('amount');
    }

    public function calculateTotalAmount(): float
    {
        return $this->unpaid_salary +
            $this->unpaid_overtime +
            $this->leave_encashment +
            $this->other_allowances -
            $this->deductions;
    }

    public function generateSettlement(): void
    {
        $this->unpaid_salary = $this->calculateUnpaidSalary();
        $this->unpaid_overtime = $this->calculateUnpaidOvertime();
        $this->leave_encashment = $this->calculateLeaveEncashment();
        $this->other_allowances = $this->calculateOtherAllowances();
        $this->total_amount = $this->calculateTotalAmount();
        $this->save();
    }

    public function complete(): void
    {
        if ($this->status !== 'approved') {
            throw new \Exception('Only approved settlements can be completed.');
        }

        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Mark employee as inactive
        $this->employee->update([
            'status' => 'inactive'
        ]);
    }

    public function payer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function markAsPaid(User $user)
    {
        $this->update([
            'status' => 'paid',
            'paid_by' => $user->id,
            'paid_at' => now(),
        ]);
    }

    public function cancel()
    {
        $this->update(['status' => 'cancelled']);
    }

    public function calculateFinalAmount()
    {
        $this->final_amount = $this->unpaid_salary +
            $this->overtime_amount +
            $this->bonus_amount +
            $this->leave_encashment -
            $this->deduction_amount;

        return $this;
    }

    public function generateSettlementReport()
    {
        // Generate PDF report for final settlement
        $data = [
            'settlement' => $this,
            'employee' => $this->employee,
            'company_name' => config('app.name', 'Company Name'),
            'generated_at' => now(),
            'settlement_breakdown' => [
                'unpaid_salary' => $this->unpaid_salary,
                'overtime_amount' => $this->overtime_amount,
                'bonus_amount' => $this->bonus_amount,
                'deduction_amount' => $this->deduction_amount,
                'leave_encashment' => $this->leave_encashment,
                'final_amount' => $this->final_amount,
            ],
            'details' => [
                'employee_name' => $this->employee->full_name,
                'employee_id' => $this->employee->employee_id,
                'settlement_date' => $this->settlement_date->format('Y-m-d'),
                'last_working_day' => $this->last_working_day->format('Y-m-d'),
                'status' => ucfirst($this->status),
                'department' => $this->employee->department ?? 'N/A',
                'position' => $this->employee->position ?? 'N/A',
            ]
        ];

        try {
            // Generate PDF using DomPDF
            $pdf = app('dompdf.wrapper');
            $html = view('payroll::settlements.pdf', $data)->render();
            $pdf->loadHTML($html);
            $pdf->setPaper('A4', 'portrait');

            // Save PDF to storage
            $filename = "final_settlement_{$this->employee->employee_id}_{$this->id}.pdf";
            $path = storage_path("app/settlements/{$filename}");

            if (!file_exists(dirname($path))) {
                mkdir(dirname($path), 0755, true);
            }

            file_put_contents($path, $pdf->output());

            return [
                'success' => true,
                'filename' => $filename,
                'path' => $path,
                'data' => $data,
                'download_url' => route('settlements.download', ['settlement' => $this->id])
            ];

        } catch (\Exception $e) {
            \Log::error('Final Settlement PDF Generation Error: ' . $e->getMessage());

            return [
                'success' => false,
                'error' => 'Failed to generate PDF report: ' . $e->getMessage(),
                'data' => $data
            ];
        }
    }

    /**
     * Download settlement report as PDF
     */
    public function downloadReport()
    {
        $report = $this->generateSettlementReport();

        if (!$report['success']) {
            throw new \Exception($report['error']);
        }

        $pdf = app('dompdf.wrapper');
        $html = view('payroll::settlements.pdf', $report['data'])->render();
        $pdf->loadHTML($html);
        $pdf->setPaper('A4', 'portrait');

        $filename = "final_settlement_{$this->employee->employee_id}_{$this->id}.pdf";

        return $pdf->download($filename);
    }

    /**
     * Generate PDF settlement report
     */
    public function generatePdfReport()
    {
        $data = [
            'settlement' => $this,
            'employee' => $this->employee,
            'company_name' => config('app.name', 'Company Name'),
            'generated_at' => now(),
            'settlement_breakdown' => [
                'unpaid_salary' => $this->unpaid_salary,
                'overtime_amount' => $this->overtime_amount,
                'bonus_amount' => $this->bonus_amount,
                'deduction_amount' => $this->deduction_amount,
                'leave_encashment' => $this->leave_encashment,
                'final_amount' => $this->final_amount,
            ],
        ];

        try {
            $pdf = app('dompdf.wrapper');
            $html = view('payroll::settlements.pdf', $data)->render();
            $pdf->loadHTML($html);
            $pdf->setPaper('A4', 'portrait');

            $filename = "final_settlement_{$this->employee->employee_id}_{$this->id}.pdf";

            return $pdf->download($filename);

        } catch (\Exception $e) {
            \Log::error('Final Settlement PDF Generation Error: ' . $e->getMessage());
            throw new \Exception('Failed to generate PDF report: ' . $e->getMessage());
        }
    }
}





