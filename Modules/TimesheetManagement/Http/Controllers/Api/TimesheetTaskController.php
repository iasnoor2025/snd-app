<?php

namespace Modules\TimesheetManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Modules\TimesheetManagement\Http\Controllers\Controller;

class TimesheetTaskController extends Controller
{
    /**
     * Display a listing of tasks available for timesheets.
     * @return Response
     */
    public function index()
    {
        return response()->json(['message' => 'API route for tasks available for timesheets']);
    }

    /**
     * Display a listing of tasks for a specific project.
     * @param int $projectId
     * @return Response
     */
    public function tasksForProject($projectId)
    {
        return response()->json([
            'message' => 'API route for tasks of a specific project',
            'project_id' => $projectId
        ]);
    }
}
