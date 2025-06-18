<?php

namespace Modules\ProjectManagement\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Modules\ProjectManagement\Domain\Project;
use Modules\ProjectManagement\Services\ProjectService;

class UpdateProjectProgressJob implements ShouldQueue
{
    use Dispatchable;
use InteractsWithQueue;
use Queueable;
use SerializesModels;

    public function __construct(
        protected Project $project
    ) {}

    public function handle(ProjectService $projectService): void
    {
        $projectService->updateProjectProgress($this->project);
    }
}



