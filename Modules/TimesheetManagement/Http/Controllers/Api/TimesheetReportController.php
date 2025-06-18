<?php

namespace Modules\TimesheetManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Modules\TimesheetManagement\Http\Controllers\Controller;

class TimesheetReportController extends Controller
{
    /**
     * Display a summary of timesheet data.
     * @return Response
     */
    public function summary()
    {
        return response()->json(['message' => 'API route for timesheet report summary']);
    }

    /**
     * Generate a custom report based on provided parameters.
     * @param Request $request
     * @return Response
     */
    public function generate(Request $request)
    {
        return response()->json(['message' => 'API route for generating custom timesheet report']);
    }
}
