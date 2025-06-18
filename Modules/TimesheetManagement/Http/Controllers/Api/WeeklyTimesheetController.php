<?php

namespace Modules\TimesheetManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Modules\TimesheetManagement\Http\Controllers\Controller;

class WeeklyTimesheetController extends Controller
{
    /**
     * Display a listing of the resource.
     * @return Response
     */
    public function index()
    {
        return response()->json(['message' => 'API route for weekly timesheets index']);
    }

    /**
     * Get the current weekly timesheet.
     * @return Response
     */
    public function current()
    {
        return response()->json(['message' => 'API route for current weekly timesheet']);
    }

    /**
     * Store a newly created resource in storage.
     * @param Request $request
     * @return Response
     */
    public function store(Request $request)
    {
        return response()->json(['message' => 'API route for storing weekly timesheet']);
    }

    /**
     * Show the specified resource.
     * @param int $id
     * @return Response
     */
    public function show($id)
    {
        return response()->json(['message' => 'API route for showing weekly timesheet', 'id' => $id]);
    }

    /**
     * Update the specified resource in storage.
     * @param Request $request
     * @param int $id
     * @return Response
     */
    public function update(Request $request, $id)
    {
        return response()->json(['message' => 'API route for updating weekly timesheet', 'id' => $id]);
    }

    /**
     * Submit the timesheet for approval.
     * @param int $id
     * @return Response
     */
    public function submit($id)
    {
        return response()->json(['message' => 'API route for submitting weekly timesheet', 'id' => $id]);
    }
}
