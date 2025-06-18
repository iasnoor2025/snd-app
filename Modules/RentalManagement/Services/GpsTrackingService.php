<?php

namespace Modules\RentalManagement\Services;

use Illuminate\Support\Collection;
use Modules\RentalManagement\Repositories\RentalRepository;
use Modules\RentalManagement\Repositories\RentalItemRepository;
use Carbon\Carbon;

class GpsTrackingService
{
    public function __construct(
        private readonly RentalRepository $rentalRepository,
        private readonly RentalItemRepository $rentalItemRepository
    ) {}

    /**
     * Get GPS tracking analytics for equipment
     */
    public function getEquipmentTrackingAnalytics(): array
    {
        $activeRentals = $this->rentalRepository->getActive();

        return [
            'active_tracking' => $this->getActiveTrackingCount($activeRentals),
            'location_history' => $this->getLocationHistory($activeRentals),
            'movement_alerts' => $this->getMovementAlerts($activeRentals),
            'geofence_violations' => $this->getGeofenceViolations($activeRentals),
        ];
    }

    /**
     * Get GPS tracking data for a specific rental
     */
    public function getRentalTrackingData(int $rentalId): array
    {
        $rental = $this->rentalRepository->find($rentalId);
        if (!$rental) {
            return [];
        }

        return [
            'current_location' => $this->getCurrentLocation($rental),
            'movement_history' => $this->getMovementHistory($rental),
            'geofence_status' => $this->getGeofenceStatus($rental),
            'alerts' => $this->getRentalAlerts($rental),
        ];
    }

    /**
     * Get real-time tracking data
     */
    public function getRealTimeTrackingData(): array
    {
        $activeRentals = $this->rentalRepository->getActive();

        return [
            'active_equipment' => $this->getActiveEquipmentLocations($activeRentals),
            'recent_movements' => $this->getRecentMovements($activeRentals),
            'active_alerts' => $this->getActiveAlerts($activeRentals),
        ];
    }

    private function getActiveTrackingCount(Collection $rentals): int
    {
        return $rentals->filter(fn($rental) =>
            $rental->rentalItems->some(fn($item) => $item->has_gps_tracking)
        )->count();
    }

    private function getLocationHistory(Collection $rentals): array
    {
        return $rentals->flatMap(fn($rental) =>
            $rental->rentalItems->flatMap(fn($item) =>
                $item->gpsLocations->map(fn($location) => [
                    'equipment_id' => $item->equipment_id,
                    'latitude' => $location->latitude,
                    'longitude' => $location->longitude,
                    'timestamp' => $location->timestamp,
                ])
            )
        )->toArray();
    }

    private function getMovementAlerts(Collection $rentals): array
    {
        return $rentals->flatMap(fn($rental) =>
            $rental->rentalItems->flatMap(fn($item) =>
                $item->movementAlerts->map(fn($alert) => [
                    'equipment_id' => $item->equipment_id,
                    'type' => $alert->type,
                    'message' => $alert->message,
                    'timestamp' => $alert->timestamp,
                ])
            )
        )->toArray();
    }

    private function getGeofenceViolations(Collection $rentals): array
    {
        return $rentals->flatMap(fn($rental) =>
            $rental->rentalItems->flatMap(fn($item) =>
                $item->geofenceViolations->map(fn($violation) => [
                    'equipment_id' => $item->equipment_id,
                    'geofence_id' => $violation->geofence_id,
                    'violation_type' => $violation->type,
                    'timestamp' => $violation->timestamp,
                ])
            )
        )->toArray();
    }

    private function getCurrentLocation($rental): ?array
    {
        $latestLocation = $rental->rentalItems
            ->flatMap(fn($item) => $item->gpsLocations)
            ->sortByDesc('timestamp')
            ->first();

        return $latestLocation ? [
            'latitude' => $latestLocation->latitude,
            'longitude' => $latestLocation->longitude,
            'timestamp' => $latestLocation->timestamp,
        ] : null;
    }

    private function getMovementHistory($rental): array
    {
        return $rental->rentalItems
            ->flatMap(fn($item) => $item->gpsLocations)
            ->sortBy('timestamp')
            ->map(fn($location) => [
                'latitude' => $location->latitude,
                'longitude' => $location->longitude,
                'timestamp' => $location->timestamp,
            ])
            ->toArray();
    }

    private function getGeofenceStatus($rental): array
    {
        return $rental->rentalItems
            ->flatMap(fn($item) => $item->geofences)
            ->map(fn($geofence) => [
                'id' => $geofence->id,
                'name' => $geofence->name,
                'status' => $geofence->status,
                'last_check' => $geofence->last_check,
            ])
            ->toArray();
    }

    private function getRentalAlerts($rental): array
    {
        return $rental->rentalItems
            ->flatMap(fn($item) => $item->alerts)
            ->sortByDesc('timestamp')
            ->map(fn($alert) => [
                'type' => $alert->type,
                'message' => $alert->message,
                'timestamp' => $alert->timestamp,
                'status' => $alert->status,
            ])
            ->toArray();
    }

    private function getActiveEquipmentLocations(Collection $rentals): array
    {
        return $rentals->flatMap(fn($rental) =>
            $rental->rentalItems->map(fn($item) => [
                'equipment_id' => $item->equipment_id,
                'name' => $item->equipment->name,
                'latitude' => $item->current_location->latitude,
                'longitude' => $item->current_location->longitude,
                'last_update' => $item->current_location->timestamp,
            ])
        )->toArray();
    }

    private function getRecentMovements(Collection $rentals): array
    {
        return $rentals->flatMap(fn($rental) =>
            $rental->rentalItems->flatMap(fn($item) =>
                $item->recentMovements->map(fn($movement) => [
                    'equipment_id' => $item->equipment_id,
                    'name' => $item->equipment->name,
                    'from' => [
                        'latitude' => $movement->from_latitude,
                        'longitude' => $movement->from_longitude,
                    ],
                    'to' => [
                        'latitude' => $movement->to_latitude,
                        'longitude' => $movement->to_longitude,
                    ],
                    'timestamp' => $movement->timestamp,
                ])
            )
        )->sortByDesc('timestamp')
        ->take(10)
        ->toArray();
    }

    private function getActiveAlerts(Collection $rentals): array
    {
        return $rentals->flatMap(fn($rental) =>
            $rental->rentalItems->flatMap(fn($item) =>
                $item->activeAlerts->map(fn($alert) => [
                    'equipment_id' => $item->equipment_id,
                    'name' => $item->equipment->name,
                    'type' => $alert->type,
                    'message' => $alert->message,
                    'timestamp' => $alert->timestamp,
                ])
            )
        )->sortByDesc('timestamp')
        ->toArray();
    }
}


