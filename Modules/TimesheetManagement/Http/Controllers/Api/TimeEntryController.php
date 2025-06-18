<?php

namespace Modules\TimesheetManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Modules\TimesheetManagement\Http\Controllers\Controller;

class TimeEntryController extends Controller
{
    /**
     * Display a listing of the resource.
     * @return Response
     */
    public function index()
    {
        return response()->json(['message' => 'API route for time entries index']);
    }

    /**
     * Store a newly created resource in storage.
     * @param Request $request
     * @return Response
     */
    public function store(Request $request)
    {
        return response()->json(['message' => 'API route for storing time entry']);
    }

    /**
     * Store multiple time entries at once.
     * @param Request $request
     * @return Response
     */
    public function bulkStore(Request $request)
    {
        return response()->json(['message' => 'API route for bulk storing time entries']);
    }

    /**
     * Show the specified resource.
     * @param int $id
     * @return Response
     */
    public function show($id)
    {
        return response()->json(['message' => 'API route for showing time entry', 'id' => $id]);
    }

    /**
     * Update the specified resource in storage.
     * @param Request $request
     * @param int $id
     * @return Response
     */
    public function update(Request $request, $id)
    {
        return response()->json(['message' => 'API route for updating time entry', 'id' => $id]);
    }

    /**
     * Remove the specified resource from storage.
     * @param int $id
     * @return Response
     */
    public function destroy($id)
    {
        return response()->json(['message' => 'API route for deleting time entry', 'id' => $id]);
    }
}
