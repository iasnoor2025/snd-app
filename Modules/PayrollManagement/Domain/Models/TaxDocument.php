<?php

namespace Modules\PayrollManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Carbon\Carbon;

class TaxDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'tax_year',
        'document_number',
        'gross_income',
        'tax_withheld',
        'net_income',
        'effective_tax_rate',
        'total_deductions',
        'overtime_income',
        'bonus_income',
        'other_income',
        'insurance_deductions',
        'advance_deductions',
        'other_deductions',
        'generated_at',
        'status',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'gross_income' => 'decimal:2',
        'tax_withheld' => 'decimal:2',
        'net_income' => 'decimal:2',
        'effective_tax_rate' => 'decimal:4',
        'total_deductions' => 'decimal:2',
        'overtime_income' => 'decimal:2',
        'bonus_income' => 'decimal:2',
        'other_income' => 'decimal:2',
        'insurance_deductions' => 'decimal:2',
        'advance_deductions' => 'decimal:2',
        'other_deductions' => 'decimal:2',
        'generated_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Get the employee that owns the tax document
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the payrolls associated with this tax document
     */
    public function payrolls(): BelongsToMany
    {
        return $this->belongsToMany(Payroll::class, 'tax_document_payrolls')
            ->withTimestamps();
    }

    /**
     * Generate unique document number
     */
    public static function generateDocumentNumber($employeeId, $taxYear)
    {
        $prefix = 'TAX';
        $sequence = str_pad($employeeId, 4, '0', STR_PAD_LEFT);
        $year = substr($taxYear, -2);

        return "{$prefix}-{$year}-{$sequence}";
    }

    /**
     * Get formatted document number
     */
    public function getFormattedDocumentNumberAttribute()
    {
        return $this->document_number ?: self::generateDocumentNumber($this->employee_id, $this->tax_year);
    }

    /**
     * Get tax year period
     */
    public function getTaxYearPeriodAttribute()
    {
        return "January 1, {$this->tax_year} - December 31, {$this->tax_year}";
    }

    /**
     * Calculate effective tax rate
     */
    public function calculateEffectiveTaxRate()
    {
        if ($this->gross_income > 0) {
            return ($this->tax_withheld / $this->gross_income) * 100;
        }

        return 0;
    }

    /**
     * Get status badge color
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'draft' => 'yellow',
            'generated' => 'blue',
            'sent' => 'green',
            'archived' => 'gray',
            default => 'gray'
        };
    }

    /**
     * Scope to filter by tax year
     */
    public function scopeForTaxYear($query, $year)
    {
        return $query->where('tax_year', $year);
    }

    /**
     * Scope to filter by employee
     */
    public function scopeForEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    /**
     * Scope to filter by status
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Mark document as sent
     */
    public function markAsSent()
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    /**
     * Archive document
     */
    public function archive()
    {
        $this->update([
            'status' => 'archived',
            'archived_at' => now(),
        ]);
    }

    /**
     * Get breakdown of income sources
     */
    public function getIncomeBreakdownAttribute()
    {
        return [
            'base_salary' => $this->gross_income - $this->overtime_income - $this->bonus_income - $this->other_income,
            'overtime' => $this->overtime_income,
            'bonus' => $this->bonus_income,
            'other' => $this->other_income,
        ];
    }

    /**
     * Get breakdown of deductions
     */
    public function getDeductionBreakdownAttribute()
    {
        return [
            'tax' => $this->tax_withheld,
            'insurance' => $this->insurance_deductions,
            'advances' => $this->advance_deductions,
            'other' => $this->other_deductions,
        ];
    }

    /**
     * Get monthly breakdown from metadata
     */
    public function getMonthlyBreakdownAttribute()
    {
        return $this->metadata['monthly_breakdown'] ?? [];
    }

    /**
     * Check if document can be regenerated
     */
    public function canRegenerate()
    {
        return in_array($this->status, ['draft', 'generated']);
    }

    /**
     * Check if document can be sent
     */
    public function canSend()
    {
        return $this->status === 'generated';
    }

    /**
     * Check if document can be archived
     */
    public function canArchive()
    {
        return in_array($this->status, ['generated', 'sent']);
    }
}
