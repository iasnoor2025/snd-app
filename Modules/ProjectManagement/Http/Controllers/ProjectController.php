<?php

namespace Modules\ProjectManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\CustomerManagement\Domain\Models\Customer;
use Modules\Core\Domain\Models\Location;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $projects = Project::with(['manager', 'tasks', 'teamMembers'])->get();
        return Inertia::render('Modules/ProjectManagement/resources/js/pages/Index', [
            'projects' => $projects,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $customers = Customer::all();
        $locations = Location::all();
        return Inertia::render('Modules/ProjectManagement/resources/js/pages/Create', [
            'customers' => $customers,
            'locations' => $locations,
        ]);
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
            'manager_id' => 'required|exists:users,id',
            'client_name' => 'required|string|max:255',
            'client_contact' => 'required|string|max:255',
            'priority' => 'required|string|in:low,medium,high',
            'progress' => 'nullable|numeric|min:0|max:100',
        ]);

        $project = Project::create($validated);

        return redirect()->route('projects.index')
            ->with('success', 'Project created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        $project->load(['manager', 'tasks', 'teamMembers']);

        return Inertia::render('Modules/ProjectManagement/resources/js/pages/Show', [
            'project' => $project,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project)
    {
        return Inertia::render('Modules/ProjectManagement/resources/js/pages/Edit', [
            'project' => $project,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|string|in:pending,active,completed,cancelled',
            'budget' => 'required|numeric|min:0',
            'manager_id' => 'required|exists:users,id',
            'client_name' => 'required|string|max:255',
            'client_contact' => 'required|string|max:255',
            'priority' => 'required|string|in:low,medium,high',
            'progress' => 'nullable|numeric|min:0|max:100',
        ]);

        $project->update($validated);

        return redirect()->route('projects.index')
            ->with('success', 'Project updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        $project->delete();

        return redirect()->route('projects.index')
            ->with('success', 'Project deleted successfully.');
    }
}


