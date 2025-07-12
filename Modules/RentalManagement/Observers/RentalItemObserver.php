<?php

namespace Modules\RentalManagement\Observers;

use Modules\RentalManagement\Domain\Models\RentalItem;
use Modules\EmployeeManagement\Domain\Models\EmployeeAssignment;

class RentalItemObserver
{
    public function saved(RentalItem $item)
    {
        // Single operator_id
        if ($item->operator_id) {
            EmployeeAssignment::updateOrCreate(
                [
                    'employee_id' => $item->operator_id,
                    'rental_id' => $item->rental_id,
                    'type' => 'rental_item',
                ],
                [
                    'name' => $item->rental->customer->name ?? 'Rental Item Assignment',
                    'status' => $item->rental->status ?? 'active',
                    'location' => $item->rental->location->name ?? 'Unknown Location',
                    'start_date' => $item->start_date,
                    'end_date' => $item->end_date,
                    'notes' => $item->notes,
                ]
            );
        }
        // Many-to-many operators
        if (method_exists($item, 'operators')) {
            foreach ($item->operators as $operator) {
                EmployeeAssignment::updateOrCreate(
                    [
                        'employee_id' => $operator->id,
                        'rental_id' => $item->rental_id,
                        'type' => 'rental_item',
                    ],
                    [
                        'name' => $item->rental->customer->name ?? 'Rental Item Assignment',
                        'status' => $item->rental->status ?? 'active',
                        'location' => $item->rental->location->name ?? 'Unknown Location',
                        'start_date' => $item->start_date,
                        'end_date' => $item->end_date,
                        'notes' => $item->notes,
                    ]
                );
            }
        }
    }

    public function deleted(RentalItem $item)
    {
        // Remove all related assignments
        EmployeeAssignment::where('rental_id', $item->rental_id)
            ->where('type', 'rental_item')
            ->where(function($q) use ($item) {
                if ($item->operator_id) {
                    $q->orWhere('employee_id', $item->operator_id);
                }
                if (method_exists($item, 'operators')) {
                    foreach ($item->operators as $operator) {
                        $q->orWhere('employee_id', $operator->id);
                    }
                }
            })->delete();
    }
}
