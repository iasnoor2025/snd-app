<?php

namespace Modules\EquipmentManagement\Services;

use Modules\EquipmentManagement\Domain\Models\Reservation;

class ReservationService
{
    public function getReservationsForEquipment($equipmentId)
    {
        return Reservation::where('equipment_id', $equipmentId)->orderByDesc('reserved_from')->get();
    }

    public function createReservation(array $data): Reservation
    {
        return Reservation::create($data);
    }

    public function updateReservation(Reservation $reservation, array $data): Reservation
    {
        $reservation->update($data);
        return $reservation->fresh();
    }

    public function deleteReservation(Reservation $reservation): void
    {
        $reservation->delete();
    }
}
