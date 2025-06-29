<?php

namespace Modules\ProjectManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectRisk;

class ProjectRiskController extends Controller
{
    public function index(Project $project)
    {
        return response()->json($project->risks);
    }

    public function store(Request $request, Project $project)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'probability' => 'required|in:low,medium,high',
            'impact' => 'required|in:low,medium,high',
            'status' => 'required|in:open,mitigated,closed',
            'mitigation_plan' => 'nullable|string',
        ]);
        $risk = $project->risks()->create($data);
        return response()->json($risk, 201);
    }

    public function show(Project $project, ProjectRisk $risk)
    {
        if ($risk->project_id !== $project->id) {
            abort(404);
        }
        return response()->json($risk);
    }

    public function update(Request $request, Project $project, ProjectRisk $risk)
    {
        if ($risk->project_id !== $project->id) {
            abort(404);
        }
        $data = $request->validate([
            'title' => 'sometimes|required|string',
            'description' => 'nullable|string',
            'probability' => 'sometimes|required|in:low,medium,high',
            'impact' => 'sometimes|required|in:low,medium,high',
            'status' => 'sometimes|required|in:open,mitigated,closed',
            'mitigation_plan' => 'nullable|string',
        ]);
        $risk->update($data);
        return response()->json($risk);
    }

    public function destroy(Project $project, ProjectRisk $risk)
    {
        if ($risk->project_id !== $project->id) {
            abort(404);
        }
        $risk->delete();
        return response()->json(['message' => 'Risk deleted']);
    }
}
