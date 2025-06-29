<?php

namespace Modules\ProjectManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\ProjectManagement\Domain\Models\Project;

class BudgetController extends Controller
{
    public function show(Project $project)
    {
        return response()->json([
            'initial_budget' => $project->initial_budget,
            'current_budget' => $project->current_budget,
            'budget_status' => $project->budget_status,
            'budget_notes' => $project->budget_notes,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $data = $request->validate([
            'initial_budget' => 'nullable|numeric|min:0',
            'current_budget' => 'nullable|numeric|min:0',
            'budget_status' => 'nullable|string',
            'budget_notes' => 'nullable|string',
        ]);
        $project->update($data);
        return response()->json($project);
    }
}
