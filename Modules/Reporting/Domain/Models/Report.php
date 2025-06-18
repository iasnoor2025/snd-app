<?php

namespace Modules\Reporting\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    use HasFactory;
use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'user_id',
        'report_template_id',
        'parameters',
        'schedule',
        'status',
        'next_run_at',
        'last_run_at',
        'results',
        'format',
        'recipients',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'parameters' => 'array',
        'schedule' => 'array',
        'results' => 'array',
        'recipients' => 'array',
        'next_run_at' => 'datetime',
        'last_run_at' => 'datetime',
    ];

    /**
     * Get the user that owns the report
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the template that this report is based on
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(ReportTemplate::class, 'report_template_id');
    }

    /**
     * Scope a query to only include reports with a specific status
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include reports due for execution
     */
    public function scopeDue($query)
    {
        return $query->where('status', 'scheduled')
            ->where('next_run_at', '<=', now());
    }

    /**
     * Mark the report as completed
     */
    public function markAsCompleted(array $results = null): self
    {
        $this->update([
            'status' => 'completed',
            'last_run_at' => now(),
            'results' => $results,
        ]);

        return $this;
    }

    /**
     * Mark the report as failed
     */
    public function markAsFailed(string $errorMessage = null): self
    {
        $this->update([
            'status' => 'failed',
            'last_run_at' => now(),
            'results' => ['error' => $errorMessage]
        ]);

        return $this;
    }

    /**
     * Reschedule the report based on its schedule
     */
    public function reschedule(): self
    {
        if (empty($this->schedule)) {
            return $this;
        }

        $frequency = $this->schedule['frequency'] ?? null;
        $time = $this->schedule['time'] ?? '00:00';
        $dayOfWeek = $this->schedule['day_of_week'] ?? null;
        $dayOfMonth = $this->schedule['day_of_month'] ?? null;

        $now = now();

        switch ($frequency) {
            case 'daily':
                $nextRun = $now->copy()->addDay()->setTimeFromTimeString($time);
                break;
            case 'weekly':
                if ($dayOfWeek !== null) {
                    $nextRun = $now->copy()->next((int)$dayOfWeek)->setTimeFromTimeString($time);
                } else {
                    $nextRun = $now->copy()->addWeek()->setTimeFromTimeString($time);
                }
                break;
            case 'monthly':
                if ($dayOfMonth !== null) {
                    $nextMonth = $now->copy()->addMonth()->setTimeFromTimeString($time);
                    $daysInMonth = $nextMonth->daysInMonth;
                    $day = min((int)$dayOfMonth, $daysInMonth);
                    $nextRun = $nextMonth->setDay($day);
                } else {
                    $nextRun = $now->copy()->addMonth()->setTimeFromTimeString($time);
                }
                break;
            default:
                return $this; // No valid frequency;
        }

        $this->update([
            'status' => 'scheduled',
            'next_run_at' => $nextRun,
        ]);

        return $this;
    }
}




