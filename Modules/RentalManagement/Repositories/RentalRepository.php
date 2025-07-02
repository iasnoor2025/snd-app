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
    public function paginateWithFilters(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        \Log::debug('RentalRepository@paginateWithFilters - Input:', [
            'perPage' => $perPage,
            'filters' => $filters
        ]);

        try {
            $query = $this->model->newQuery()
                ->with([
                    'customer:id,name,email',
                    'rentalItems.equipment:id,name,model_number,manufacturer',
                    'rentalItems' => function ($query) {
                        $query->select([
                            'id',
                            'rental_id',
                            'equipment_id',
                            'rate',
                            'rate_type',
                            'days',
                            'created_at'
                        ]);
                    }
                ])
                ->select([
                    'rentals.*',
                    'customers.name as customer_name',
                    'customers.email as customer_email',
                    DB::raw('COALESCE(rentals.actual_end_date, rentals.expected_end_date) as end_date'),
                    DB::raw('CASE
                        WHEN rentals.status = \'completed\' THEN \'completed\'
                        WHEN rentals.status = \'pending\' THEN \'pending\'
                        WHEN rentals.status = \'active\' AND rentals.expected_end_date < NOW() AND rentals.actual_end_date IS NULL THEN \'overdue\'
                        ELSE rentals.status
                    END as calculated_status')
                ])
                ->leftJoin('customers', 'rentals.customer_id', '=', 'customers.id');

            \Log::debug('RentalRepository@paginateWithFilters - Initial query built');

            if (isset($filters['search']) && $filters['search'] !== null) {
                $search = $filters['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('rental_number', 'like', '%' . $search . '%')
                      ->orWhere('customers.name', 'like', '%' . $search . '%')
                      ->orWhere('customers.email', 'like', '%' . $search . '%');
                });
                \Log::debug('RentalRepository@paginateWithFilters - Search filter applied:', ['search' => $search]);
            }

            if (isset($filters['status']) && $filters['status'] !== null && $filters['status'] !== 'all') {
                if ($filters['status'] === 'overdue') {
                    $query->where('rentals.status', 'active')
                          ->whereDate('rentals.expected_end_date', '<', now())
                          ->whereNull('rentals.actual_end_date');
                } else {
                    $query->where('rentals.status', $filters['status']);
                }
                \Log::debug('RentalRepository@paginateWithFilters - Status filter applied:', ['status' => $filters['status']]);
            }

            if (isset($filters['start_date']) && $filters['start_date'] !== null) {
                $query->whereDate('rentals.start_date', '>=', $filters['start_date']);
                \Log::debug('RentalRepository@paginateWithFilters - Start date filter applied:', ['start_date' => $filters['start_date']]);
            }

            if (isset($filters['end_date']) && $filters['end_date'] !== null) {
                $query->whereDate('rentals.expected_end_date', '<=', $filters['end_date']);
                \Log::debug('RentalRepository@paginateWithFilters - End date filter applied:', ['end_date' => $filters['end_date']]);
            }

            $result = $query->orderBy('rentals.created_at', 'desc')->paginate($perPage, ['*'], 'page', $filters['page'] ?? 1);

            // Transform the data to match the frontend expectations
            $result->getCollection()->transform(function ($rental) {
                $rental->status = $rental->calculated_status;
                unset($rental->calculated_status);

                // Transform rental items to include equipment name
                if ($rental->rentalItems) {
                    $rental->rental_items = $rental->rentalItems->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'equipment_id' => $item->equipment_id,
                            'equipment_name' => $item->equipment->name ?? 'Unknown Equipment',
                            'rate' => $item->rate,
                            'rate_type' => $item->rate_type,
                            'days' => $item->days
                        ];
                    });
                }

                unset($rental->rentalItems);
                return $rental;
            });

            \Log::debug('RentalRepository@paginateWithFilters - Result:', [
                'count' => $result->count(),
                'total' => $result->total(),
                'currentPage' => $result->currentPage(),
                'lastPage' => $result->lastPage(),
                'hasMorePages' => $result->hasMorePages(),
                'firstItem' => $result->firstItem(),
                'lastItem' => $result->lastItem(),
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings(),
                'first_item' => $result->count() > 0 ? $result->items()[0] : null
            ]);

            return $result;
        } catch (\Exception $e) {
            \Log::error('RentalRepository@paginateWithFilters - Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
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

