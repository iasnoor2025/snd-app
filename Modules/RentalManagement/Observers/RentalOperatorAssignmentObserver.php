<?php

namespace Modules\RentalManagement\Observers;

use Modules\RentalManagement\Domain\Models\RentalOperatorAssignment;
use Modules\EmployeeManagement\Domain\Models\EmployeeAssignment;

class RentalOperatorAssignmentObserver
{
    public function created(RentalOperatorAssignment $assignment)
    {
        if ($assignment->employee_id && $assignment->rental_id) {
            EmployeeAssignment::updateOrCreate(
                [
                    'employee_id' => $assignment->employee_id,
                    'rental_id' => $assignment->rental_id,
                    'type' => 'rental',
                ],
                [
                    'name' => $assignment->rental->project_name ?? 'Rental Assignment',
                    'status' => $assignment->status ?? 'active',
                    'location' => $assignment->rental->location->name ?? 'Unknown Location',
                    'start_date' => $assignment->assignment_date,
                    'end_date' => $assignment->end_date,
                    'notes' => $assignment->notes,
                ]
            );
        }
    }

    public function updated(RentalOperatorAssignment $assignment)
    {
        if ($assignment->employee_id && $assignment->rental_id) {
            EmployeeAssignment::updateOrCreate(
                [
                    'employee_id' => $assignment->employee_id,
                    'rental_id' => $assignment->rental_id,
                    'type' => 'rental',
                ],
                [
                    'name' => $assignment->rental->project_name ?? 'Rental Assignment',
                    'status' => $assignment->status ?? 'active',
                    'location' => $assignment->rental->location->name ?? 'Unknown Location',
                    'start_date' => $assignment->assignment_date,
                    'end_date' => $assignment->end_date,
                    'notes' => $assignment->notes,
                ]
            );
        }
    }

    public function deleted(RentalOperatorAssignment $assignment)
    {
        if ($assignment->employee_id && $assignment->rental_id) {
            EmployeeAssignment::where([
                'employee_id' => $assignment->employee_id,
                'rental_id' => $assignment->rental_id,
                'type' => 'rental',
            ])->delete();
        }
    }
}
