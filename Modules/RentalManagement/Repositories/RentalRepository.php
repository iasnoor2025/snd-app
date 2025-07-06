<?php
namespace Modules\RentalManagement\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Repositories\Interfaces\RentalRepositoryInterface;
use Illuminate\Support\Facades\DB;

class RentalRepository implements RentalRepositoryInterface
{
    protected Rental $model;

    public function __construct(Rental $model)
    {
        $this->model = $model;
    }

    /**
     * {@inheritdoc}
     */
    public function all(): Collection
    {
        return $this->model->all();
    }

    /**
     * {@inheritdoc}
     */
    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->newQuery()->paginate($perPage);
    }

    /**
     * {@inheritdoc}
     */
    public function paginateWithFilters(int $perPage = 15, array $filters = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        $query = $this->model->newQuery()->with(['customer', 'rentalItems']);
        $result = $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $filters['page'] ?? 1);
        // Map to expected structure
        $result->getCollection()->transform(function ($rental) {
            return [
                'id' => $rental->id,
                'rental_number' => $rental->rental_number,
                'customer_name' => $rental->customer ? ($rental->customer->company_name ?? $rental->customer->name ?? $rental->customer->contact_person ?? 'Unknown') : 'Unknown',
                'customer_email' => $rental->customer->email ?? '',
                'start_date' => $rental->start_date,
                'expected_end_date' => $rental->expected_end_date,
                'actual_end_date' => $rental->actual_end_date,
                'status' => $rental->status,
                'has_operators' => $rental->has_operators,
                'total_amount' => $rental->total_amount,
                'rental_items' => $rental->rentalItems ? $rental->rentalItems->map(function ($item) {
                    $equipmentName = '';
                    if ($item->equipment && $item->equipment->name) {
                        if (is_array($item->equipment->name)) {
                            $equipmentName = $item->equipment->name['en'] ?? $item->equipment->name[array_key_first($item->equipment->name)] ?? '';
                        } else {
                            $equipmentName = $item->equipment->name;
                        }
                    }
                    return [
                        'id' => $item->id,
                        'equipment_id' => $item->equipment_id,
                        'equipment_name' => $equipmentName,
                        'rate' => $item->rate,
                        'rate_type' => $item->rate_type,
                        'days' => $item->days,
                    ];
                })->toArray() : [],
            ];
        });
        return $result;
    }

    /**
     * {@inheritdoc}
     */
    public function find(int $id): ?Model
    {
        return $this->model->find($id);
    }

    /**
     * {@inheritdoc}
     */
    public function findOrFail(int $id): Model
    {
        return $this->model->findOrFail($id);
    }

    /**
     * {@inheritdoc}
     */
    public function create(array $payload): Model
    {
        return $this->model->create($payload);
    }

    /**
     * {@inheritdoc}
     */
    public function update(int $id, array $payload): Model
    {
        $model = $this->model->findOrFail($id);
        $model->update($payload);
        return $model;
    }

    /**
     * {@inheritdoc}
     */
    public function delete(int $id): bool
    {
        return $this->model->destroy($id) > 0;
    }

    /**
     * {@inheritdoc}
     */
    public function getActive(): Collection
    {
        return $this->model->where('status', 'active')->get();
    }

    /**
     * {@inheritdoc}
     */
    public function getCompleted(): Collection
    {
        return $this->model->where('status', 'completed')->get();
    }

    /**
     * {@inheritdoc}
     */
    public function getByStatus(string $status): Collection
    {
        return $this->model->where('status', $status)->get();
    }

    public function getSummary(): array
    {
        $total = $this->model->count();
        $active = $this->model->where('status', 'active')->count();
        $overdue = $this->model->where('status', 'overdue')->count();
        return [
            'total' => $total,
            'active' => $active,
            'overdue' => $overdue,
        ];
    }

    public function getTopRentals(int $limit = 3): array
    {
        return $this->model->orderByDesc('created_at')->limit($limit)->get()->all();
    }
}

