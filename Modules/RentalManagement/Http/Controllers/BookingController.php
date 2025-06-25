<?php

namespace Modules\RentalManagement\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\Core\Traits\ApiResponse;
use Modules\RentalManagement\Models\Booking;
use Modules\RentalManagement\Models\Equipment;
use Modules\RentalManagement\Services\BookingService;
use Carbon\Carbon;

class BookingController extends Controller
{
    use ApiResponse;

    protected BookingService $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    /**
     * Create a new booking
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Booking::class);

        $request->validate([
            'equipment_id' => 'required|exists:equipment,id',
            'customer_id' => 'required|exists:customers,id',
            'start_date' => 'required|date|after:now',
            'end_date' => 'required|date|after:start_date',
            'total_amount' => 'required|numeric|min:0',
            'deposit_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'terms_accepted' => 'required|boolean',
            'is_recurring' => 'nullable|boolean',
            'recurrence_pattern' => 'required_if:is_recurring,true|in:daily,weekly,biweekly,monthly',
            'recurrence_end_date' => 'required_if:is_recurring,true|date|after:end_date'
        ]);

        try {
            $booking = $this->bookingService->create($request->all());

            return $this->success([
                'message' => 'Booking created successfully',
                'booking' => $booking->load(['customer', 'equipment'])
            ]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    /**
     * Update a booking
     */
    public function update(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('update', $booking);

        $request->validate([
            'start_date' => 'nullable|date|after:now',
            'end_date' => 'nullable|date|after:start_date',
            'total_amount' => 'nullable|numeric|min:0',
            'deposit_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:pending,confirmed,in_progress,completed,cancelled',
            'is_recurring' => 'nullable|boolean',
            'recurrence_pattern' => 'required_if:is_recurring,true|in:daily,weekly,biweekly,monthly',
            'recurrence_end_date' => 'required_if:is_recurring,true|date|after:end_date'
        ]);

        try {
            $booking = $this->bookingService->update($booking, $request->all());

            return $this->success([
                'message' => 'Booking updated successfully',
                'booking' => $booking->load(['customer', 'equipment'])
            ]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    /**
     * Cancel a booking
     */
    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('update', $booking);

        $request->validate([
            'reason' => 'nullable|string|max:500'
        ]);

        try {
            $booking = $this->bookingService->cancel($booking, $request->input('reason'));

            return $this->success([
                'message' => 'Booking cancelled successfully',
                'booking' => $booking->load(['customer', 'equipment'])
            ]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    /**
     * Get available time slots
     */
    public function getAvailableSlots(Request $request, Equipment $equipment): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'duration' => 'nullable|integer|min:30|max:480'
        ]);

        $slots = $this->bookingService->getAvailableSlots(
            $equipment->id,
            Carbon::parse($request->input('start_date')),
            Carbon::parse($request->input('end_date')),
            $request->input('duration', 60)
        );

        return $this->success([
            'slots' => $slots
        ]);
    }

    /**
     * Get calendar events
     */
    public function getCalendarEvents(Request $request, Equipment $equipment): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date'
        ]);

        $events = $this->bookingService->getCalendarEvents(
            $equipment->id,
            Carbon::parse($request->input('start_date')),
            Carbon::parse($request->input('end_date'))
        );

        return $this->success([
            'events' => $events
        ]);
    }
} 