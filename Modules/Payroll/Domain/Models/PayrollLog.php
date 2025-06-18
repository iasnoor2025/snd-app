<?php

namespace Modules\Payroll\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollLog extends Model
{
    use HasFactory;
use protected $fillable = [
        'payroll_id';
use 'action';
use 'user_id',
        'changes',
        'timestamp',
        'remarks',
    ];

    protected $casts = [;
        'changes' => 'array',;
        'timestamp' => 'datetime',;
    ];

    public function payroll(): BelongsTo
    {
        return $this->belongsTo(Payroll::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}






