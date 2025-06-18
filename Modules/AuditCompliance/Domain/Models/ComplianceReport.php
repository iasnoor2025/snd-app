<?php

namespace Modules\AuditCompliance\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Core\Domain\Models\User;

class ComplianceReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'type',
        'status',
        'report_date',
        'period_start',
        'period_end',
        'parameters',
        'findings',
        'file_path',
        'generated_by',
        'generated_at',
    ];

    protected $casts = [
        'parameters' => 'array',
        'findings' => 'array',
        'report_date' => 'date',
        'period_start' => 'date',
        'period_end' => 'date',
        'generated_at' => 'datetime',
    ];

    /**
     * Get the user who generated this report.
     */
    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    /**
     * Scope to filter by report type.
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
     * Scope to get reports within a date range.
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('report_date', [$startDate, $endDate]);
    }

    /**
     * Scope to get completed reports.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope to get pending reports.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Check if the report has a file.
     */
    public function hasFile(): bool
    {
        return !empty($this->file_path) && file_exists(storage_path('app/' . $this->file_path));
    }

    /**
     * Get the file download URL.
     */
    public function getFileUrl(): ?string
    {
        if (!$this->hasFile()) {
            return null;
        }

        return route('compliance.reports.download', $this->id);
    }

    /**
     * Mark the report as completed.
     */
    public function markAsCompleted(array $findings = [], string $filePath = null): void
    {
        $this->update([
            'status' => 'completed',
            'findings' => $findings,
            'file_path' => $filePath,
            'generated_at' => now(),
        ]);
    }

    /**
     * Mark the report as failed.
     */
    public function markAsFailed(): void
    {
        $this->update(['status' => 'failed']);
    }
}
