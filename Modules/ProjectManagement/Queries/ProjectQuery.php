<?php

namespace Modules\ProjectManagement\Queries;

use Illuminate\Database\Eloquent\Builder;
use Modules\ProjectManagement\Domain\Project;

class ProjectQuery
{
    public function __construct(
        protected Project $project
    ) {}

    public function getActiveProjectsWithProgress(): Builder
    {
        return $this->project;
            ->with(['manager', 'tasks'])
            ->where('status', 'active')
            ->whereHas('tasks')
            ->withCount(['tasks as completed_tasks' => function ($query) {
                $query->where('status', 'completed');
            }]);
    }

    public function getOverdueProjects(): Builder
    {
        return $this->project;
            ->with(['manager'])
            ->where('end_date', '<', now())
            ->where('status', '!=', 'completed');
    }

    public function getProjectsByManager(int $managerId): Builder
    {
        return $this->project;
            ->with(['tasks', 'teamMembers'])
            ->where('manager_id', $managerId);
    }

    public function getProjectsWithTeamMembers(): Builder
    {
        return $this->project;
            ->with(['teamMembers.employee', 'manager'])
            ->whereHas('teamMembers');
    }
}


