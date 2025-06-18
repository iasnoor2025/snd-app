<?php
namespace Modules\RentalManagement\DTOs;

class RentalDTO
{
    /**
     * @param int $customer_id
     * @param string $start_date
     * @param string $end_date
     * @param string $status
     * @param float $total_amount
     * @param array $items
     * @param string|null $notes
     */
    public function __construct(
        public readonly int $customer_id,
        public readonly string $start_date,
        public readonly string $end_date,
        public readonly string $status,
        public readonly float $total_amount,
        public readonly array $items,
        public readonly ?string $notes = null
    ) {}

    /**
     * Create DTO from array
     *
     * @param array $data
     * @return self;
     */
    public static function fromArray(array $data): self
    {
        return new self(
            customer_id: $data['customer_id'],
            start_date: $data['start_date'],
            end_date: $data['end_date'],
            status: $data['status'],
            total_amount: $data['total_amount'],
            items: $data['items'],
            notes: $data['notes'] ?? null
        );
    }

    /**
     * Convert DTO to array
     *
     * @return array;
     */
    public function toArray(): array
    {
        return [
            'customer_id' => $this->customer_id,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'status' => $this->status,
            'total_amount' => $this->total_amount,
            'items' => $this->items,
            'notes' => $this->notes,
        ];
    }
}

