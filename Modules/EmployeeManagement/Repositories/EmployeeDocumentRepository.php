<?php

namespace Modules\EmployeeManagement\Repositories;

use Carbon\Carbon;
use Modules\Core\Repositories\BaseRepository;
use Modules\EmployeeManagement\Domain\Models\EmployeeDocument;

class EmployeeDocumentRepository extends BaseRepository implements EmployeeDocumentRepositoryInterface
{
    public function __construct(EmployeeDocument $model)
    {
        parent::__construct($model);
    }

    public function findByEmployee(int $employeeId): array
    {
        return $this->model
            ->where('employee_id', $employeeId)
            ->with(['employee', 'verifier'])
            ->get()
            ->toArray();
    }

    public function findExpiring(int $daysThreshold = 30): array
    {
        $thresholdDate = Carbon::now()->addDays($daysThreshold);

        return $this->model
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<=', $thresholdDate)
            ->where('expiry_date', '>', Carbon::now())
            ->where('status', '!=', 'expired')
            ->with(['employee', 'verifier'])
            ->get()
            ->toArray();
    }

    public function findExpired(): array
    {
        return $this->model
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<', Carbon::now())
            ->where('status', '!=', 'expired')
            ->with(['employee', 'verifier'])
            ->get()
            ->toArray();
    }

    public function findPendingVerification(): array
    {
        return $this->model
            ->where('status', 'pending')
            ->with(['employee', 'verifier'])
            ->get()
            ->toArray();
    }

    public function findById(int $id): ?EmployeeDocument
    {
        return $this->model
            ->with(['employee', 'verifier'])
            ->find($id);
    }

    public function create(array $data): EmployeeDocument
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): EmployeeDocument
    {
        $document = $this->model->findOrFail($id);
        $document->update($data);
        return $document;
    }

    public function delete(int $id): bool
    {
        return $this->model->destroy($id) > 0;
    }
}


