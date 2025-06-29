<?php

namespace Modules\ProjectManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;
use Modules\ProjectManagement\Domain\Models\Project;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $projects = Project::with(['manager', 'tasks', 'teamMembers'])->get();

        return response()->json(['data' => $projects]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|string|in:pending,active,completed,cancelled',
            'budget' => 'required|numeric|min:0',
            'initial_budget' => 'nullable|numeric|min:0',
            'current_budget' => 'nullable|numeric|min:0',
            'budget_status' => 'nullable|string|max:255',
            'budget_notes' => 'nullable|string',
            'manager_id' => 'required|exists:users,id',
            'client_name' => 'required|string|max:255',
            'client_contact' => 'required|string|max:255',
            'priority' => 'required|string|in:low,medium,high',
            'progress' => 'nullable|numeric|min:0|max:100',
        ]);

        $project = Project::create($validated);

        return response()->json([
            'message' => 'Project created successfully',
            'data' => $project
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        $project->load(['manager', 'tasks', 'teamMembers']);

        return response()->json(['data' => $project]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'sometimes|required|string|in:pending,active,completed,cancelled',
            'budget' => 'sometimes|required|numeric|min:0',
            'initial_budget' => 'nullable|numeric|min:0',
            'current_budget' => 'nullable|numeric|min:0',
            'budget_status' => 'nullable|string|max:255',
            'budget_notes' => 'nullable|string',
            'manager_id' => 'sometimes|required|exists:users,id',
            'client_name' => 'sometimes|required|string|max:255',
            'client_contact' => 'sometimes|required|string|max:255',
            'priority' => 'sometimes|required|string|in:low,medium,high',
            'progress' => 'nullable|numeric|min:0|max:100',
        ]);

        $project->update($validated);

        return response()->json([
            'message' => 'Project updated successfully',
            'data' => $project
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully'
        ]);
    }
}


