<?php

namespace Modules\PayrollManagement\Domain\Models;

use Modules\Core\Domain\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PayrollRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'run_by',
        'status',
        'total_employees',
        'run_date',
        'notes',
        'completed_at'
    ];

    protected $casts = [
        'run_date' => 'date',
        'completed_at' => 'datetime',
        'total_employees' => 'integer',
    ];

    public function runBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'run_by');
    }

    public function payrolls(): HasMany
    {
        return $this->hasMany(Payroll::class, 'batch_id', 'batch_id');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function complete(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now()
        ]);
    }

    public function reject(string $notes): void
    {
        $this->update([
            'status' => 'rejected',
            'notes' => $notes
        ]);
    }
}






