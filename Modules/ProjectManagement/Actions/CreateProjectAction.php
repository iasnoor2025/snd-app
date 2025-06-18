<?php

namespace Modules\ProjectManagement\Actions;

use Modules\ProjectManagement\Domain\DTOs\ProjectDTO;
use Modules\ProjectManagement\Services\ProjectService;
use Modules\ProjectManagement\Events\ProjectCreated;

class CreateProjectAction
{
    public function __construct(
        protected ProjectService $projectService
    ) {}

    public function execute(ProjectDTO $dto): void
    {
        $project = $this->projectService->createProject($dto);

        // Dispatch event
        event(new ProjectCreated($project));

        // Calculate initial progress
        $this->projectService->updateProjectProgress($project);
    }
}

