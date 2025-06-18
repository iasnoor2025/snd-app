<?php

namespace Modules\AuditCompliance\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Modules\Core\Domain\Models\User;

class GdprDataRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'type',
        'status',
        'subject_email',
        'subject_name',
        'description',
        'requested_data',
        'legal_basis',
        'requested_at',
        'due_date',
        'assigned_to',
        'response_notes',
        'file_path',
        'completed_at',
    ];

    protected $casts = [
        'requested_data' => 'array',
        'requested_at' => 'date',
        'due_date' => 'date',
        'completed_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->request_id)) {
                $model->request_id = 'GDPR-' . strtoupper(Str::random(8));
            }

            if (empty($model->due_date)) {
                $model->due_date = Carbon::parse($model->requested_at)->addDays(30);
            }
        });
    }

    /**
     * Get the user assigned to handle this request.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Scope to filter by request type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to filter by status.
     */
    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get overdue requests.
     */
    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', Carbon::now())
                    ->whereNotIn('status', ['completed', 'cancelled']);
    }

    /**
     * Scope to get pending requests.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get requests for a specific email.
     */
    public function scopeForEmail($query, string $email)
    {
        return $query->where('subject_email', $email);
    }

    /**
     * Check if the request is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->due_date->isPast() && !in_array($this->status, ['completed', 'cancelled']);
    }

    /**
     * Get days until due date.
     */
    public function getDaysUntilDue(): int
    {
        return Carbon::now()->diffInDays($this->due_date, false);
    }

    /**
     * Mark the request as completed.
     */
    public function markAsCompleted(string $responseNotes = null, string $filePath = null): void
    {
        $this->update([
            'status' => 'completed',
            'response_notes' => $responseNotes,
            'file_path' => $filePath,
            'completed_at' => now(),
        ]);
    }

    /**
     * Assign the request to a user.
     */
    public function assignTo(User $user): void
    {
        $this->update([
            'assigned_to' => $user->id,
            'status' => 'in_progress',
        ]);
    }

    /**
     * Reject the request.
     */
    public function reject(string $reason): void
    {
        $this->update([
            'status' => 'rejected',
            'response_notes' => $reason,
        ]);
    }

    /**
     * Get the file download URL.
     */
    public function getFileUrl(): ?string
    {
        if (empty($this->file_path)) {
            return null;
        }

        return route('gdpr.requests.download', $this->id);
    }
}
