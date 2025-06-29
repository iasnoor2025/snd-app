<?php

namespace Modules\ProjectManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\Milestone;

class MilestoneController extends Controller
{
    public function index(Project $project)
    {
        $milestones = $project->milestones()->orderBy('due_date')->get();
        return response()->json(['milestones' => $milestones]);
    }

    public function store(Request $request, Project $project)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'due_date' => 'required|date',
        ]);
        $data['project_id'] = $project->id;
        $milestone = Milestone::create($data);
        return response()->json($milestone, 201);
    }

    public function update(Request $request, Project $project, Milestone $milestone)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string',
            'description' => 'nullable|string',
            'due_date' => 'sometimes|required|date',
            'status' => 'sometimes|required|string',
        ]);
        $milestone->update($data);
        return response()->json($milestone);
    }

    public function complete(Project $project, Milestone $milestone)
    {
        $milestone->status = 'completed';
        $milestone->completed_at = now();
        $milestone->save();
        return response()->json($milestone);
    }

    public function destroy(Project $project, Milestone $milestone)
    {
        $milestone->delete();
        return response()->json(['success' => true]);
    }
}
