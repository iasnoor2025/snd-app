<?php

namespace Modules\RentalManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\RentalManagement\Services\RentalCalendarService;

class RentalCalendarController extends Controller
{
    protected $calendarService;

    public function __construct(RentalCalendarService $calendarService)
    {
        $this->calendarService = $calendarService;
    }

    public function index($equipmentId, Request $request)
    {
        $start = $request->query('start', now()->startOfMonth()->toDateString());
        $end = $request->query('end', now()->endOfMonth()->toDateString());
        $bookings = $this->calendarService->getBookingsForEquipment($equipmentId, $start, $end);
        return response()->json(['data' => $bookings]);
    }

    public function conflict($equipmentId, Request $request)
    {
        $start = $request->query('start');
        $end = $request->query('end');
        $conflict = $this->calendarService->hasConflict($equipmentId, $start, $end);
        return response()->json(['conflict' => $conflict]);
    }
}
