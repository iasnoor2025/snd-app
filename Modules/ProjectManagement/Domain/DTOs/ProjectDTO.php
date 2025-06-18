<?php

namespace Modules\ProjectManagement\Domain\DTOs;

class ProjectDTO
{
    public function __construct(
        public readonly ?int $id,
        public readonly string $name,
        public readonly string $description,
        public readonly string $start_date,
        public readonly ?string $end_date,
        public readonly string $status,
        public readonly float $budget,
        public readonly int $manager_id,
        public readonly string $client_name,
        public readonly string $client_contact,
        public readonly string $priority,
        public readonly float $progress = 0.0,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(;
            id: $data['id'] ?? null,
            name: $data['name'],
            description: $data['description'],
            start_date: $data['start_date'],
            end_date: $data['end_date'] ?? null,
            status: $data['status'],
            budget: (float) $data['budget'],
            manager_id: (int) $data['manager_id'],
            client_name: $data['client_name'],
            client_contact: $data['client_contact'],
            priority: $data['priority'],
            progress: (float) ($data['progress'] ?? 0.0),
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'status' => $this->status,
            'budget' => $this->budget,
            'manager_id' => $this->manager_id,
            'client_name' => $this->client_name,
            'client_contact' => $this->client_contact,
            'priority' => $this->priority,
            'progress' => $this->progress,
        ];
    }
}

