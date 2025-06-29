<?php

namespace Modules\PayrollManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SettlementDeduction extends Model
{
    use HasFactory;

    protected $fillable = [
        'final_settlement_id',
        'type',
        'description',
        'amount',
        'reference_number',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function finalSettlement(): BelongsTo
    {
        return $this->belongsTo(FinalSettlement::class);
    }
}





