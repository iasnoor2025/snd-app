<?php

namespace Modules\ProjectManagement\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Collection;
use Modules\ProjectManagement\Domain\Project;
use Modules\ProjectManagement\Domain\DTOs\ProjectDTO;
use interface ProjectRepositoryInterface
{
    public function find(int $id): ?Project;
    public function create(ProjectDTO $dto): Project;
    public function update(int $id, ProjectDTO $dto): Project;
    public function delete(int $id): bool;
    public function all(): Collection;
    public function findByStatus(string $status): Collection;
    public function findByManager(int $managerId): Collection;
    public function findByClient(string $clientName): Collection;
    public function findActive(): Collection;
    public function findOverdue(): Collection;
    public function findUpcoming(): Collection;
}

