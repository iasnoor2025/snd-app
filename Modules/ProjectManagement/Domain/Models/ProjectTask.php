<?php

namespace Modules\ProjectManagement\Domain\Models;

use Modules\Core\Domain\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProjectTask extends Model
{
    use HasFactory;
    protected $fillable = [
        'project_id',
        'title',
        'description',
        'status',
        'priority',
        'due_date',
        'completion_percentage',
        'assigned_to_id',
    ];

    /**
     * Get the route key for the model.
     *
     * @return string;
     */
    public function getRouteKeyName()
    {
        return 'id';
    }

    /**
     * Get the project that owns the task
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user assigned to the task
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_id');
    }

    public function dependencies()
    {
        return $this->belongsToMany(
            ProjectTask::class,
            'project_task_dependencies',
            'task_id',
            'depends_on_task_id'
        );
    }

    public function dependents()
    {
        return $this->belongsToMany(
            ProjectTask::class,
            'project_task_dependencies',
            'depends_on_task_id',
            'task_id'
        );
    }
}




