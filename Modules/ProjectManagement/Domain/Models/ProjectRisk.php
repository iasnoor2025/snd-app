<?php

namespace Modules\ProjectManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectRisk extends Model
{
    protected $fillable = [
        'project_id',
        'title',
        'description',
        'probability',
        'impact',
        'status',
        'mitigation_plan',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
