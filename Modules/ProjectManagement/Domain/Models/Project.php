<?php

namespace Modules\ProjectManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $fillable = [
        'name',
        'description',
        'start_date',
        'end_date',
        'status',
        'budget',
        'manager_id',
        'client_name',
        'client_contact',
        'priority',
        'progress',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'budget' => 'decimal:2',
        'progress' => 'decimal:2',
    ];

    public function manager(): BelongsTo
    {
        return $this->belongsTo('App\Models\User', 'manager_id');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(ProjectTask::class);
    }

    public function teamMembers(): HasMany
    {
        return $this->hasMany(ProjectTeamMember::class);
    }

    public function manpower(): HasMany
    {
        return $this->hasMany(ProjectManpower::class);
    }

    public function equipment(): HasMany
    {
        return $this->hasMany(ProjectEquipment::class);
    }

    public function materials(): HasMany
    {
        return $this->hasMany(ProjectMaterial::class);
    }

    public function fuel(): HasMany
    {
        return $this->hasMany(ProjectFuel::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(ProjectExpense::class);
    }
}




