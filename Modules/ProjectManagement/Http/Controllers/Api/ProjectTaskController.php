<?php

namespace Modules\ProjectManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\ProjectManagement\Domain\Models\Project;

class ProjectTaskController extends Controller
{
    public function tasks(Project $project)
    {
        $tasks = $project->tasks()->select('id', 'name', 'start_date as start', 'end_date as end')->get();
        return response()->json(['tasks' => $tasks]);
    }
}
