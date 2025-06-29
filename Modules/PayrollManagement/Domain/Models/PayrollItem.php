<?php

namespace Modules\PayrollManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PayrollItem extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'payroll_id',
        'type',
        'description',
        'amount',
        'is_taxable',
        'tax_rate',
        'order',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_taxable' => 'boolean',
        'tax_rate' => 'decimal:4',
        'order' => 'integer',
        'metadata' => 'array',
    ];

    public function payroll(): BelongsTo
    {
        return $this->belongsTo(Payroll::class);
    }

    public function scopeOvertime($query)
    {
        return $query->where('type', 'overtime');
    }

    public function scopeBonus($query)
    {
        return $query->where('type', 'bonus');
    }

    public function scopeDeduction($query)
    {
        return $query->where('type', 'deduction');
    }

    public function scopeAdvance($query)
    {
        return $query->where('type', 'advance');
    }

    public function scopeBenefit($query)
    {
        return $query->where('type', 'benefits');
    }

    public function isEarning(): bool
    {
        return $this->type === 'earnings';
    }

    public function isDeduction(): bool
    {
        return $this->type === 'deductions';
    }

    public function isTax(): bool
    {
        return $this->type === 'taxes';
    }

    public function isBenefit(): bool
    {
        return $this->type === 'benefits';
    }

    public function calculateTaxAmount(): float
    {
        if (!$this->is_taxable) {
            return 0;
        }

        return $this->amount * ($this->tax_rate / 100);
    }

    public static function types(): array
    {
        return [
            'overtime' => 'Overtime',
            'bonus' => 'Bonus',
            'deduction' => 'Deduction',
            'advance' => 'Advance Salary',
            'earnings' => 'Earnings',
            'taxes' => 'Taxes',
            'benefits' => 'Benefits'
        ];
    }

    /**
     * Supported types: overtime, bonus, deduction, advance, earnings, taxes, benefits
     */
}






