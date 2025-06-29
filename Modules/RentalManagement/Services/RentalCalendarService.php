<?php

namespace Modules\RentalManagement\Services;

use Modules\RentalManagement\Domain\Models\Rental;

class RentalCalendarService
{
    public function getBookingsForEquipment($equipmentId, $start, $end)
    {
        return Rental::where('equipment_id', $equipmentId)
            ->where(function ($q) use ($start, $end) {
                $q->whereBetween('start_date', [$start, $end])
                  ->orWhereBetween('end_date', [$start, $end]);
            })
            ->with('customer')
            ->get()
            ->map(function ($rental) {
                return [
                    'id' => $rental->id,
                    'start_date' => $rental->start_date,
                    'end_date' => $rental->end_date,
                    'customer_name' => $rental->customer_name,
                ];
            });
    }

    public function hasConflict($equipmentId, $start, $end)
    {
        return Rental::where('equipment_id', $equipmentId)
            ->where(function ($q) use ($start, $end) {
                $q->whereBetween('start_date', [$start, $end])
                  ->orWhereBetween('end_date', [$start, $end]);
            })
            ->exists();
    }
}
