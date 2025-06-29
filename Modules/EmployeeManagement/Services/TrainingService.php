<?php

namespace Modules\EmployeeManagement\Services;

use Modules\EmployeeManagement\Domain\Models\Training;
use Modules\EmployeeManagement\Domain\Models\Employee;

class TrainingService
{
    public function getAllTrainings()
    {
        return Training::orderByDesc('start_date')->get();
    }

    public function createTraining(array $data): Training
    {
        return Training::create($data);
    }

    public function updateTraining(Training $training, array $data): Training
    {
        $training->update($data);
        return $training->fresh();
    }

    public function deleteTraining(Training $training): void
    {
        $training->delete();
    }

    public function assignEmployee(Training $training, Employee $employee, string $status = 'assigned')
    {
        $training->employees()->syncWithoutDetaching([
            $employee->id => [
                'status' => $status,
            ],
        ]);
    }

    public function markCompleted(Training $training, Employee $employee, $certificateUrl = null)
    {
        $training->employees()->updateExistingPivot($employee->id, [
            'status' => 'completed',
            'completed_at' => now(),
            'certificate_url' => $certificateUrl,
        ]);
    }

    public function getEmployeeTrainings(Employee $employee)
    {
        return $employee->trainings()->withPivot('status', 'completed_at', 'certificate_url')->get();
    }
}
