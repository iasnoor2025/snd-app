<?php

namespace Modules\TimesheetManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Modules\TimesheetManagement\Http\Controllers\Controller;

class TimesheetCalendarController extends Controller
{
    /**
     * Display a listing of timesheets in calendar format.
     * @return Response
     */
    public function index()
    {
        return response()->json(['message' => 'API route for timesheet calendar']);
    }

    /**
     * Display timesheets for a specific month.
     * @param int $year
     * @param int $month
     * @return Response
     */
    public function month($year, $month)
    {
        return response()->json([
            'message' => 'API route for timesheet calendar for specific month',
            'year' => $year,
            'month' => $month
        ]);
    }
}
