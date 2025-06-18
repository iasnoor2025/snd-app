<?php

namespace Modules\TimesheetManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Modules\TimesheetManagement\Http\Controllers\Controller;

class TimesheetProjectController extends Controller
{
    /**
     * Display a listing of projects available for timesheets.
     * @return Response
     */
    public function index()
    {
        return response()->json(['message' => 'API route for projects available for timesheets']);
    }
}
