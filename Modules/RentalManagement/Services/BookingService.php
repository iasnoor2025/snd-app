<?php

namespace Modules\RentalManagement\Services;

use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Modules\RentalManagement\Models\Booking;
use Modules\RentalManagement\Models\Equipment;
use Modules\RentalManagement\Events\BookingCreatedEvent;
use Modules\RentalManagement\Events\BookingUpdatedEvent;
use Modules\RentalManagement\Events\BookingCancelledEvent;
use Modules\RentalManagement\Exceptions\BookingConflictException;

class BookingService
{
    /**
     * Create a new booking
     */
    public function create(array $data): Booking
    {
        // Check for conflicts before creating
        $this->checkForConflicts(
            $data['equipment_id'],
            Carbon::parse($data['start_date']),
            Carbon::parse($data['end_date']),
            null
        );

        DB::beginTransaction();
        try {
            $booking = Booking::create([
                'equipment_id' => $data['equipment_id'],
                'customer_id' => $data['customer_id'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'status' => $data['status'] ?? 'pending',
                'total_amount' => $data['total_amount'],
                'deposit_amount' => $data['deposit_amount'] ?? null,
                'notes' => $data['notes'] ?? null,
                'terms_accepted' => $data['terms_accepted'] ?? false,
                'is_recurring' => $data['is_recurring'] ?? false,
                'recurrence_pattern' => $data['recurrence_pattern'] ?? null,
                'recurrence_end_date' => $data['recurrence_end_date'] ?? null,
            ]);

            // Create recurring bookings if needed
            if ($booking->is_recurring) {
                $this->createRecurringBookings($booking);
            }

            // Update equipment availability
            $this->updateEquipmentAvailability($booking->equipment_id);

            DB::commit();

            event(new BookingCreatedEvent($booking));

            return $booking;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update an existing booking
     */
    public function update(Booking $booking, array $data): Booking
    {
        // Check for conflicts if dates are being updated
        if (isset($data['start_date']) || isset($data['end_date'])) {
            $this->checkForConflicts(
                $booking->equipment_id,
                Carbon::parse($data['start_date'] ?? $booking->start_date),
                Carbon::parse($data['end_date'] ?? $booking->end_date),
                $booking->id
            );
        }

        DB::beginTransaction();
        try {
            $booking->update($data);

            // Update recurring bookings if pattern changed
            if ($booking->is_recurring && 
                (isset($data['recurrence_pattern']) || isset($data['recurrence_end_date']))) {
                $this->updateRecurringBookings($booking);
            }

            // Update equipment availability
            $this->updateEquipmentAvailability($booking->equipment_id);

            DB::commit();

            event(new BookingUpdatedEvent($booking));

            return $booking->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Cancel a booking
     */
    public function cancel(Booking $booking, string $reason = null): Booking
    {
        DB::beginTransaction();
        try {
            $booking->update([
                'status' => 'cancelled',
                'cancellation_reason' => $reason,
                'cancelled_at' => Carbon::now(),
            ]);

            // Cancel future recurring bookings if applicable
            if ($booking->is_recurring) {
                $this->cancelRecurringBookings($booking);
            }

            // Update equipment availability
            $this->updateEquipmentAvailability($booking->equipment_id);

            DB::commit();

            event(new BookingCancelledEvent($booking));

            return $booking->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get available time slots for equipment
     */
    public function getAvailableSlots(
        int $equipmentId,
        Carbon $startDate,
        Carbon $endDate,
        int $duration = 60 // minutes
    ): array {
        $equipment = Equipment::findOrFail($equipmentId);
        $bookings = $this->getBookingsInRange($equipmentId, $startDate, $endDate);
        
        $slots = [];
        $current = $startDate->copy();

        while ($current <= $endDate) {
            // Skip if outside business hours
            if ($this->isWithinBusinessHours($current)) {
                $slotEnd = $current->copy()->addMinutes($duration);
                
                // Check if slot conflicts with any existing booking
                $hasConflict = $bookings->contains(function ($booking) use ($current, $slotEnd) {
                    return $this->datesOverlap(
                        $current,
                        $slotEnd,
                        $booking->start_date,
                        $booking->end_date
                    );
                });

                if (!$hasConflict) {
                    $slots[] = [
                        'start' => $current->toDateTimeString(),
                        'end' => $slotEnd->toDateTimeString(),
                    ];
                }
            }
            
            $current->addMinutes($duration);
        }

        return $slots;
    }

    /**
     * Get calendar events for equipment
     */
    public function getCalendarEvents(
        int $equipmentId,
        Carbon $startDate,
        Carbon $endDate
    ): array {
        $bookings = $this->getBookingsInRange($equipmentId, $startDate, $endDate);
        
        return $bookings->map(function ($booking) {
            return [
                'id' => $booking->id,
                'title' => "Booking #{$booking->id} - {$booking->customer->name}",
                'start' => $booking->start_date->toDateTimeString(),
                'end' => $booking->end_date->toDateTimeString(),
                'status' => $booking->status,
                'color' => $this->getStatusColor($booking->status),
                'customer' => $booking->customer->only(['id', 'name', 'email']),
                'equipment' => $booking->equipment->only(['id', 'name']),
            ];
        })->toArray();
    }

    /**
     * Check for booking conflicts
     */
    protected function checkForConflicts(
        int $equipmentId,
        Carbon $startDate,
        Carbon $endDate,
        ?int $excludeBookingId = null
    ): void {
        $query = Booking::where('equipment_id', $equipmentId)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function ($query) use ($startDate, $endDate) {
                        $query->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                    });
            });

        if ($excludeBookingId) {
            $query->where('id', '!=', $excludeBookingId);
        }

        if ($query->exists()) {
            throw new BookingConflictException(
                "Equipment is not available for the selected time period"
            );
        }
    }

    /**
     * Create recurring bookings
     */
    protected function createRecurringBookings(Booking $booking): void
    {
        $pattern = $booking->recurrence_pattern;
        $endDate = Carbon::parse($booking->recurrence_end_date);
        $duration = $booking->start_date->diffInMinutes($booking->end_date);

        $dates = $this->generateRecurringDates($booking->start_date, $endDate, $pattern);

        foreach ($dates as $date) {
            // Skip the first date as it's the original booking
            if ($date == $booking->start_date) {
                continue;
            }

            $this->create([
                'equipment_id' => $booking->equipment_id,
                'customer_id' => $booking->customer_id,
                'start_date' => $date,
                'end_date' => $date->copy()->addMinutes($duration),
                'status' => $booking->status,
                'total_amount' => $booking->total_amount,
                'deposit_amount' => $booking->deposit_amount,
                'notes' => $booking->notes,
                'terms_accepted' => $booking->terms_accepted,
                'parent_booking_id' => $booking->id,
            ]);
        }
    }

    /**
     * Update recurring bookings
     */
    protected function updateRecurringBookings(Booking $booking): void
    {
        // Cancel existing recurring bookings
        Booking::where('parent_booking_id', $booking->id)->delete();

        // Create new recurring bookings with updated pattern
        $this->createRecurringBookings($booking);
    }

    /**
     * Cancel recurring bookings
     */
    protected function cancelRecurringBookings(Booking $booking): void
    {
        Booking::where('parent_booking_id', $booking->id)
            ->where('start_date', '>', Carbon::now())
            ->update([
                'status' => 'cancelled',
                'cancellation_reason' => 'Parent booking cancelled',
                'cancelled_at' => Carbon::now(),
            ]);
    }

    /**
     * Generate recurring dates based on pattern
     */
    protected function generateRecurringDates(Carbon $startDate, Carbon $endDate, string $pattern): array
    {
        $dates = [];
        $current = $startDate->copy();

        while ($current <= $endDate) {
            $dates[] = $current->copy();

            switch ($pattern) {
                case 'daily':
                    $current->addDay();
                    break;
                case 'weekly':
                    $current->addWeek();
                    break;
                case 'biweekly':
                    $current->addWeeks(2);
                    break;
                case 'monthly':
                    $current->addMonth();
                    break;
                default:
                    throw new \InvalidArgumentException("Invalid recurrence pattern: {$pattern}");
            }
        }

        return $dates;
    }

    /**
     * Get bookings in date range
     */
    protected function getBookingsInRange(int $equipmentId, Carbon $startDate, Carbon $endDate): Collection
    {
        return Booking::where('equipment_id', $equipmentId)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function ($query) use ($startDate, $endDate) {
                        $query->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                    });
            })
            ->with(['customer', 'equipment'])
            ->get();
    }

    /**
     * Check if time is within business hours
     */
    protected function isWithinBusinessHours(Carbon $dateTime): bool
    {
        // Skip weekends
        if ($dateTime->isWeekend()) {
            return false;
        }

        // Check business hours (9 AM - 5 PM)
        $hour = $dateTime->hour;
        return $hour >= 9 && $hour < 17;
    }

    /**
     * Check if two date ranges overlap
     */
    protected function datesOverlap(Carbon $start1, Carbon $end1, Carbon $start2, Carbon $end2): bool
    {
        return $start1 < $end2 && $end1 > $start2;
    }

    /**
     * Get color for booking status
     */
    protected function getStatusColor(string $status): string
    {
        return match($status) {
            'pending' => '#FFA500',   // Orange
            'confirmed' => '#4CAF50', // Green
            'in_progress' => '#2196F3', // Blue
            'completed' => '#9C27B0', // Purple
            'cancelled' => '#F44336', // Red
            default => '#9E9E9E'      // Grey
        };
    }

    /**
     * Update equipment availability status
     */
    protected function updateEquipmentAvailability(int $equipmentId): void
    {
        $equipment = Equipment::find($equipmentId);
        $hasActiveBookings = Booking::where('equipment_id', $equipmentId)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) {
                $query->where('end_date', '>', Carbon::now())
                    ->orWhere('status', 'in_progress');
            })
            ->exists();

        $equipment->update([
            'availability_status' => $hasActiveBookings ? 'booked' : 'available'
        ]);
    }
} 