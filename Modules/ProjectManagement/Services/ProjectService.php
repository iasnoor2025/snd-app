<?php

namespace Modules\ProjectManagement\Services;

use Illuminate\Database\Eloquent\Collection;
use Modules\ProjectManagement\Domain\Project;
use Modules\ProjectManagement\Domain\DTOs\ProjectDTO;
use Modules\ProjectManagement\Repositories\Interfaces\ProjectRepositoryInterface;

class ProjectService
{
    public function __construct(
        protected ProjectRepositoryInterface $repository
    ) {}

    public function getProject(int $id): ?Project
    {
        return $this->repository->find($id);
    }

    public function createProject(ProjectDTO $dto): Project
    {
        return $this->repository->create($dto);
    }

    public function updateProject(int $id, ProjectDTO $dto): Project
    {
        return $this->repository->update($id, $dto);
    }

    public function deleteProject(int $id): bool
    {
        return $this->repository->delete($id);
    }

    public function getAllProjects(): Collection
    {
        return $this->repository->all();
    }

    public function getProjectsByStatus(string $status): Collection
    {
        return $this->repository->findByStatus($status);
    }

    public function getProjectsByManager(int $managerId): Collection
    {
        return $this->repository->findByManager($managerId);
    }

    public function getProjectsByClient(string $clientName): Collection
    {
        return $this->repository->findByClient($clientName);
    }

    public function getActiveProjects(): Collection
    {
        return $this->repository->findActive();
    }

    public function getOverdueProjects(): Collection
    {
        return $this->repository->findOverdue();
    }

    public function getUpcomingProjects(): Collection
    {
        return $this->repository->findUpcoming();
    }

    public function calculateProjectProgress(Project $project): float
    {
        $totalTasks = $project->tasks()->count();
        if ($totalTasks === 0) {
            return 0.0;
        }

        $completedTasks = $project->tasks()->where('status', 'completed')->count();
        return ($completedTasks / $totalTasks) * 100;
    }

    public function updateProjectProgress(Project $project): Project
    {
        $progress = $this->calculateProjectProgress($project);
        $project->update(['progress' => $progress]);
        return $project;
    }
}

