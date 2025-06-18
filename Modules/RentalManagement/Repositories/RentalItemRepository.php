<?php

namespace Modules\RentalManagement\Repositories;

use Modules\Core\Repositories\BaseRepository;
use Modules\RentalManagement\Domain\Models\RentalItem;

class RentalItemRepository extends BaseRepository
{
    /**
     * Create a new repository instance.
     */
    public function __construct(RentalItem $model)
    {
        parent::__construct($model);
    }

    /**
     * Get all rental items for a specific rental.
     */
    public function getByRentalId(int $rentalId)
    {
        return $this->model->where('rental_id', $rentalId)->get();
    }

    /**
     * Get rental items with their related equipment and operator.
     */
    public function getWithRelations(int $rentalId)
    {
        return $this->model
            ->with(['equipment', 'operator'])
            ->where('rental_id', $rentalId)
            ->get();
    }

    /**
     * Create multiple rental items.
     */
    public function createMany(array $items)
    {
        return $this->model->insert($items);
    }

    /**
     * Update multiple rental items.
     */
    public function updateMany(array $items)
    {
        foreach ($items as $item) {
            $this->update($item['id'], $item);
        }
    }

    /**
     * Delete all rental items for a specific rental.
     */
    public function deleteByRentalId(int $rentalId)
    {
        return $this->model->where('rental_id', $rentalId)->delete();
    }
}


