<?php

namespace Modules\RentalManagement\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Modules\RentalManagement\Repositories\Interfaces\PaymentRepositoryInterface;

class PaymentService
{
    public function __construct(
        private readonly PaymentRepositoryInterface $repository
    ) {}

    public function getAllPayments(): Collection
    {
        return $this->repository->all();
    }

    public function getPaginatedPayments(int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginate($perPage);
    }

    public function getPaymentById(int $id): ?Model
    {
        return $this->repository->find($id);
    }

    public function findById(int $id): ?Model
    {
        return $this->getPaymentById($id);
    }

    public function create(array $data): Model
    {
        return $this->repository->create($data);
    }

    public function update(int $id, array $data): Model
    {
        $payment = $this->repository->find($id);
        if (!$payment) {
            throw new \RuntimeException("Payment not found");
        }
        return $this->repository->update($id, $data) ?? $payment;
    }

    public function delete(int $id): bool
    {
        return (bool) $this->repository->delete($id);
    }

    public function getByRentalId(int $rentalId): Collection
    {
        return $this->repository->where('rental_id', $rentalId)->get();
    }
}
