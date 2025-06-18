<?php

namespace Modules\RentalManagement\Services;

use Modules\Core\Services\BaseService;
use Modules\RentalManagement\Repositories\RentalItemRepository;

class RentalItemService extends BaseService
{
    /**
     * Create a new service instance.
     */
    public function __construct(RentalItemRepository $repository)
    {
        parent::__construct($repository);
    }

    /**
     * Get all rental items for a specific rental.
     */
    public function getByRentalId(int $rentalId)
    {
        return $this->repository->getByRentalId($rentalId);
    }

    /**
     * Get rental items with their related equipment and operator.
     */
    public function getWithRelations(int $rentalId)
    {
        return $this->repository->getWithRelations($rentalId);
    }

    /**
     * Create multiple rental items.
     */
    public function createMany(array $items)
    {
        return $this->repository->createMany($items);
    }

    /**
     * Update multiple rental items.
     */
    public function updateMany(array $items)
    {
        return $this->repository->updateMany($items);
    }

    /**
     * Delete all rental items for a specific rental.
     */
    public function deleteByRentalId(int $rentalId)
    {
        return $this->repository->deleteByRentalId($rentalId);
    }

    /**
     * Calculate total amount for rental items.
     */
    public function calculateTotalAmount(array $items): float
    {
        $total = 0;
        foreach ($items as $item) {
            $baseAmount = $item['rate'] * $item['days'];
            $discountAmount = $baseAmount * ($item['discount_percentage'] / 100);
            $total += $baseAmount - $discountAmount;
        }
        return $total;
    }
}

