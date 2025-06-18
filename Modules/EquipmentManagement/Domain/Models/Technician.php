<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Technician extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int;
use string>
     */
    protected $fillable = [
        'user_id',
        'employee_id',
        'specialty',
        'skills',
        'certification',
        'certification_expiry',
        'experience_years',
        'is_active',
        'availability',
        'notes',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'certification_expiry' => 'date',
        'is_active' => 'boolean',
        'skills' => 'array',
        'availability' => 'array',
        'experience_years' => 'integer',
    ];

    /**
     * Get the user associated with this technician.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who created this technician record.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this technician record.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get all maintenance tasks assigned to this technician.
     */
    public function assignedTasks()
    {
        return $this->hasManyThrough(
            MaintenanceTask::class,
            User::class,
            'id', // Foreign key on users table
            'assigned_to', // Foreign key on maintenance_tasks table
            'user_id', // Local key on technicians table
            'id' // Local key on users table
        );
    }

    /**
     * Get all maintenance tasks completed by this technician.
     */
    public function completedTasks()
    {
        return $this->hasManyThrough(
            MaintenanceTask::class,
            User::class,
            'id', // Foreign key on users table
            'completed_by', // Foreign key on maintenance_tasks table
            'user_id', // Local key on technicians table
            'id' // Local key on users table
        );
    }

    /**
     * Scope a query to only include active technicians.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include technicians with specific skills.
     */
    public function scopeWithSkills($query, array $skills)
    {
        return $query->where(function ($query) use ($skills) {;
            foreach ($skills as $skill) {
                $query->orWhereJsonContains('skills', $skill);
            }
        });
    }

    /**
     * Check if the technician's certification is expired.
     */
    public function isCertificationExpired(): bool
    {
        if (!$this->certification_expiry) {
            return false;
        }

        return $this->certification_expiry < now();
    }

    /**
     * Check if the technician's certification is expiring soon (within 30 days).
     */
    public function isCertificationExpiringSoon(): bool
    {
        if (!$this->certification_expiry) {
            return false;
        }

        return $this->certification_expiry < now()->addDays(30) && $this->certification_expiry > now();
    }

    /**
     * Check if technician has a specific skill.
     */
    public function hasSkill(string $skill): bool
    {
        if (empty($this->skills)) {
            return false;
        }

        return in_array($skill, $this->skills);
    }

    /**
     * Add a skill to the technician's skill set.
     */
    public function addSkill(string $skill): self
    {
        $skills = $this->skills ?? [];

        if (!in_array($skill, $skills)) {
            $skills[] = $skill;
            $this->skills = $skills;
            $this->save();
        }

        return $this;
    }

    /**
     * Remove a skill from the technician's skill set.
     */
    public function removeSkill(string $skill): self
    {
        if (empty($this->skills)) {
            return $this;
        }

        $skills = array_filter($this->skills, function($item) use ($skill) {
            return $item !== $skill;
        });

        $this->skills = array_values($skills);
        $this->save();

        return $this;
    }

    /**
     * Check if technician's certification is valid.
     */
    public function hasCertification()
    {
        return $this->certification &&
               (!$this->certification_expiry || $this->certification_expiry->isFuture());
    }

    /**
     * Check if technician is available on a specific day and time.
     */
    public function isAvailableOn($day, $time = null)
    {
        $day = strtolower(substr($day, 0, 3));

        if (!isset($this->availability[$day])) {
            return false;
        }

        if ($time === null) {
            return $this->availability[$day]['am'] || $this->availability[$day]['pm'];
        }

        $isPM = (int)$time >= 12;
        return $isPM ? $this->availability[$day]['pm'] : $this->availability[$day]['am'];
    }

    /**
     * Get a workload score for the technician based on their assigned tasks.
     */
    public function getWorkloadScore()
    {
        $pendingCount = $this->assignedTasks()
            ->whereIn('status', [MaintenanceTask::STATUS_ASSIGNED, MaintenanceTask::STATUS_IN_PROGRESS])
            ->count();

        $overdueCount = $this->assignedTasks()
            ->where('status', MaintenanceTask::STATUS_OVERDUE)
            ->count();

        // Overdue tasks are weighted more heavily
        return $pendingCount + ($overdueCount * 2);
    }

    /**
     * Calculate skill match score for a task.
     */
    public function getSkillMatchScore(MaintenanceTask $task)
    {
        // Get equipment category or type
        $equipment = $task->equipment;

        if (!$equipment || !$this->skills) {
            return 0;
        }

        $score = 0;

        // Check if technician's specialty matches equipment category
        if ($this->specialty && $equipment->category &&
            stripos($equipment->category, $this->specialty) !== false) {
            $score += 5;
        }

        // Check for skill matches
        foreach ($this->skills as $skill) {
            // Match against equipment name
            if (stripos($equipment->name, $skill) !== false) {
                $score += 3;
            }

            // Match against equipment type or category
            if (($equipment->type && stripos($equipment->type, $skill) !== false) ||
                ($equipment->category && stripos($equipment->category, $skill) !== false)) {
                $score += 2;
            }

            // Match against task title or description
            if (stripos($task->title, $skill) !== false ||
                ($task->description && stripos($task->description, $skill) !== false)) {
                $score += 1;
            }
        }

        return $score;
    }

    /**
     * Get default workday availability template.
     */
    public static function getDefaultAvailability()
    {
        return [
            'mon' => ['am' => true, 'pm' => true],
            'tue' => ['am' => true, 'pm' => true],
            'wed' => ['am' => true, 'pm' => true],
            'thu' => ['am' => true, 'pm' => true],
            'fri' => ['am' => true, 'pm' => true],
            'sat' => ['am' => false, 'pm' => false],
            'sun' => ['am' => false, 'pm' => false]
        ];
    }
}






