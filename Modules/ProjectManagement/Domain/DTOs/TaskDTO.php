<?php

namespace Modules\ProjectManagement\Domain\DTOs;

class TaskDTO
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $project_id,
        public readonly string $name,
        public readonly string $description,
        public readonly string $start_date,
        public readonly ?string $due_date,
        public readonly string $status,
        public readonly string $priority,
        public readonly ?int $assigned_to,
        public readonly float $estimated_hours,
        public readonly float $actual_hours = 0.0,
        public readonly float $progress = 0.0,
        public readonly ?int $parent_task_id = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(;
            id: $data['id'] ?? null,
            project_id: (int) $data['project_id'],
            name: $data['name'],
            description: $data['description'],
            start_date: $data['start_date'],
            due_date: $data['due_date'] ?? null,
            status: $data['status'],
            priority: $data['priority'],
            assigned_to: $data['assigned_to'] ?? null,
            estimated_hours: (float) $data['estimated_hours'],
            actual_hours: (float) ($data['actual_hours'] ?? 0.0),
            progress: (float) ($data['progress'] ?? 0.0),
            parent_task_id: $data['parent_task_id'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'name' => $this->name,
            'description' => $this->description,
            'start_date' => $this->start_date,
            'due_date' => $this->due_date,
            'status' => $this->status,
            'priority' => $this->priority,
            'assigned_to' => $this->assigned_to,
            'estimated_hours' => $this->estimated_hours,
            'actual_hours' => $this->actual_hours,
            'progress' => $this->progress,
            'parent_task_id' => $this->parent_task_id,
        ];
    }
}

