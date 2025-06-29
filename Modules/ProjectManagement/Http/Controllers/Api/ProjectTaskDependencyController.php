<?php

namespace Modules\ProjectManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\ProjectManagement\Domain\Models\ProjectTask;
use Modules\ProjectManagement\Domain\Models\ProjectTaskDependency;

class ProjectTaskDependencyController extends Controller
{
    public function index(ProjectTask $task)
    {
        return response()->json($task->dependencies()->get());
    }

    public function store(Request $request, ProjectTask $task)
    {
        $data = $request->validate([
            'depends_on_task_id' => 'required|exists:project_tasks,id',
        ]);
        if ($task->id === (int)$data['depends_on_task_id']) {
            return response()->json(['error' => 'A task cannot depend on itself.'], 422);
        }
        $task->dependencies()->syncWithoutDetaching([$data['depends_on_task_id']]);
        return response()->json($task->dependencies()->get());
    }

    public function destroy(ProjectTask $task, $dependsOnId)
    {
        $task->dependencies()->detach($dependsOnId);
        return response()->json(['message' => 'Dependency removed']);
    }
}
