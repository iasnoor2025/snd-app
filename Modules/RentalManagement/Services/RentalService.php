<?php
namespace Modules\RentalManagement\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Modules\RentalManagement\DTOs\RentalDTO;
use Modules\RentalManagement\Repositories\Interfaces\RentalRepositoryInterface;
use Modules\RentalManagement\Events\RentalCreated;
use Modules\RentalManagement\Events\RentalUpdated;
use Modules\RentalManagement\Events\RentalDeleted;

class RentalService
{
    /**
     * @param RentalRepositoryInterface $repository
     */
    public function __construct(
        private readonly RentalRepositoryInterface $repository
    ) {}

    /**
     * Get all rentals
     *
     * @return Collection;
     */
    public function getAllRentals(): Collection
    {
        return $this->repository->all();
    }

    /**
     * Get paginated rentals
     *
     * @param int $perPage
     * @return LengthAwarePaginator;
     */
    public function getPaginatedRentals(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        \Log::debug('RentalService@getPaginatedRentals - Input:', [
            'perPage' => $perPage,
            'filters' => $filters
        ]);

        try {
            $result = $this->repository->paginateWithFilters($perPage, $filters);

            \Log::debug('RentalService@getPaginatedRentals - Result:', [
                'count' => $result->count(),
                'total' => $result->total(),
                'currentPage' => $result->currentPage(),
                'lastPage' => $result->lastPage(),
                'hasMorePages' => $result->hasMorePages(),
                'firstItem' => $result->firstItem(),
                'lastItem' => $result->lastItem()
            ]);

            return $result;
        } catch (\Exception $e) {
            \Log::error('RentalService@getPaginatedRentals - Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Get rental by ID
     *
     * @param int $id
     * @return Model|null;
     */
    public function getRentalById(int $id): ?Model
    {
        return $this->repository->find($id);
    }

    /**
     * Find rental by ID
     *
     * @param int $id
     * @return Model|null;
     */
    public function findById(int $id): ?Model
    {
        return $this->getRentalById($id);
    }

    /**
     * Create new rental
     *
     * @param array $data
     * @return Model;
     */
    public function create(array $data): Model
    {
        $rental = $this->repository->create($data);

        event(new RentalCreated($rental));

        return $rental;
    }

    /**
     * Create new rental with DTO
     *
     * @param RentalDTO $dto
     * @return Model;
     */
    public function createRental(RentalDTO $dto): Model
    {
        $rental = $this->repository->create($dto->toArray());

        event(new RentalCreated($rental));

        return $rental;
    }

    /**
     * Update rental
     *
     * @param int $id
     * @param RentalDTO $dto
     * @return Model;
     */
    public function updateRental(int $id, RentalDTO $dto): Model
    {
        $rental = $this->repository->update($id, $dto->toArray());

        event(new RentalUpdated($rental));

        return $rental;
    }

    /**
     * Delete rental
     *
     * @param int $id
     * @return bool;
     */
    public function deleteRental(int $id): bool
    {
        $rental = $this->repository->findOrFail($id);
        $result = $this->repository->delete($id);

        if ($result) {
            event(new RentalDeleted($rental));
        }

        return $result;
    }

    /**
     * Get active rentals
     *
     * @return Collection;
     */
    public function getActiveRentals(): Collection
    {
        return $this->repository->getActive();
    }

    /**
     * Get completed rentals
     *
     * @return Collection;
     */
    public function getCompletedRentals(): Collection
    {
        return $this->repository->getCompleted();
    }

    /**
     * Get rentals by status
     *
     * @param string $status
     * @return Collection;
     */
    public function getRentalsByStatus(string $status): Collection
    {
        return $this->repository->getByStatus($status);
    }

    public function getRentalSummary(): array
    {
        $summary = $this->repository->getSummary();
        $topRentals = $this->repository->getTopRentals(3);
        return [
            'total' => $summary['total'],
            'active' => $summary['active'],
            'overdue' => $summary['overdue'],
            'topRentals' => array_map(function ($rental) {
                return [
                    'id' => $rental->id,
                    'name' => $rental->name ?? $rental->reference ?? ('Rental #' . $rental->id),
                    'status' => ucfirst($rental->status),
                ];
            }, $topRentals),
        ];
    }
}


