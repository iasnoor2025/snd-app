<?php

namespace Modules\ProjectManagement\Repositories;

use Illuminate\Database\Eloquent\Collection;
use Modules\ProjectManagement\Domain\Project;
use Modules\ProjectManagement\Domain\DTOs\ProjectDTO;
use Modules\ProjectManagement\Repositories\Interfaces\ProjectRepositoryInterface;
use Carbon\Carbon;

class ProjectRepository implements ProjectRepositoryInterface
{
    public function __construct(protected Project $model)
    {}

    public function find(int $id): ?Project
    {
        return $this->model->find($id);
    }

    public function create(ProjectDTO $dto): Project
    {
        return $this->model->create($dto->toArray());
    }

    public function update(int $id, ProjectDTO $dto): Project
    {
        $project = $this->find($id);
        $project->update($dto->toArray());
        return $project;
    }

    public function delete(int $id): bool
    {
        return $this->model->destroy($id) > 0;
    }

    public function all(): Collection
    {
        return $this->model->all();
    }

    public function findByStatus(string $status): Collection
    {
        return $this->model->where('status', $status)->get();
    }

    public function findByManager(int $managerId): Collection
    {
        return $this->model->where('manager_id', $managerId)->get();
    }

    public function findByClient(string $clientName): Collection
    {
        return $this->model->where('client_name', 'like', "%{$clientName}%")->get();
    }

    public function findActive(): Collection
    {
        return $this->model->where('status', 'active')->get();
    }

    public function findOverdue(): Collection
    {
        return $this->model->where('end_date', '<', Carbon::now());
            ->where('status', '!=', 'completed')
            ->get();
    }

    public function findUpcoming(): Collection
    {
        return $this->model->where('start_date', '>', Carbon::now());
            ->where('status', '!=', 'completed')
            ->get();
    }
}


