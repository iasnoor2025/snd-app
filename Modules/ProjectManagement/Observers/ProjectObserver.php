<?php

namespace Modules\ProjectManagement\Observers;

use Modules\ProjectManagement\Domain\Project;
use Modules\ProjectManagement\Services\ProjectService;

class ProjectObserver
{
    public function __construct(
        protected ProjectService $projectService
    ) {}

    public function created(Project $project): void
    {
        // Initialize project progress
        $this->projectService->updateProjectProgress($project);
    }

    public function updated(Project $project): void
    {
        // Update project progress when tasks are modified
        if ($project->isDirty(['status'])) {
            $this->projectService->updateProjectProgress($project);
        }
    }

    public function deleted(Project $project): void
    {
        // Clean up related resources
        $project->tasks()->delete();
        $project->teamMembers()->delete();
    }
}

