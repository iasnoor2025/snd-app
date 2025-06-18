<?php

namespace Modules\ProjectManagement\Http\Controllers;

use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectTask;
use Modules\Core\Domain\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TaskController extends Controller
{
    /**
     * Display a listing of the tasks for a project.
     */
    public function index(Request $request, Project $project)
    {
        // Log that this method is being called
        Log::info('TaskController@index called for project: ' . $project->id);

        // Load project tasks with assigned users
        $tasks = $project->tasks()->with('assignedTo')->get();

        // Log the task count
        Log::info('Tasks found: ' . $tasks->count());

        // Return JSON response if requested
        if ($request->wantsJson()) {
            return response()->json($tasks);
        }

        // Return a redirect to the resources page with tab parameter
        return redirect()->route('projects.resources', [
            'project' => $project->id,
            'tab' => 'tasks'
        ]);
    }

    /**
     * Store a newly created task for the project.
     */
    public function store(Request $request, Project $project)
    {
        // Log that this method is being called
        Log::info('TaskController@store called for project: ' . $project->id);

        // Validate the request
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => ['required', Rule::in(['pending', 'in_progress', 'completed', 'cancelled'])],
            'priority' => ['required', Rule::in(['low', 'medium', 'high'])],
            'due_date' => 'nullable|date',
            'completion_percentage' => 'nullable|integer|min:0|max:100',
            'assigned_to_id' => 'nullable|exists:users,id',
        ]);

        // Ensure completion percentage is set to 0 if not provided
        if (!isset($validated['completion_percentage'])) {
            $validated['completion_percentage'] = 0;
        }

        // If status is completed, set completion_percentage to 100
        if ($validated['status'] === 'completed' && $validated['completion_percentage'] < 100) {
            $validated['completion_percentage'] = 100;
        }

        // Create the task
        $task = $project->tasks()->create($validated);

        // Load the assigned user
        if ($task->assigned_to_id) {
            $task->load('assignedTo');
        }

        // Return JSON response if requested
        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Task created successfully',
                'task' => $task
            ], 201);
        }

        // Redirect to resources page with success message
        return redirect()->route('projects.resources', [
            'project' => $project->id,
            'tab' => 'tasks'
        ])->with('success', 'Task created successfully.');
    }

    /**
     * Update an existing task.
     */
    public function update(Request $request, Project $project, ProjectTask $task)
    {
        // Log that this method is being called
        Log::info('TaskController@update called for task: ' . $task->id);

        // Check if the task belongs to the project
        if ($task->project_id !== $project->id) {
            return response()->json(['message' => 'Task does not belong to this project'], 403);
        }

        // Validate the request
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => ['sometimes', 'required', Rule::in(['pending', 'in_progress', 'completed', 'cancelled'])],
            'priority' => ['sometimes', 'required', Rule::in(['low', 'medium', 'high'])],
            'due_date' => 'nullable|date',
            'completion_percentage' => 'nullable|integer|min:0|max:100',
            'assigned_to_id' => 'nullable|exists:users,id',
        ]);

        // If status is completed, set completion_percentage to 100
        if (isset($validated['status']) && $validated['status'] === 'completed' &&
            (!isset($validated['completion_percentage']) || $validated['completion_percentage'] < 100)) {
            $validated['completion_percentage'] = 100;
        }

        // Update the task
        $task->update($validated);

        // Load the assigned user
        if ($task->assigned_to_id) {
            $task->load('assignedTo');
        }

        // Return JSON response if requested
        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Task updated successfully',
                'task' => $task
            ]);
        }

        // Redirect to resources page with success message
        return redirect()->route('projects.resources', [
            'project' => $project->id,
            'tab' => 'tasks'
        ])->with('success', 'Task updated successfully.');
    }

    /**
     * Delete a task.
     */
    public function destroy(Request $request, Project $project, ProjectTask $task)
    {
        // Log that this method is being called
        Log::info('TaskController@destroy called for task: ' . $task->id);

        // Check if the task belongs to the project
        if ($task->project_id !== $project->id) {
            return response()->json(['message' => 'Task does not belong to this project'], 403);
        }

        // Delete the task
        $task->delete();

        // Return JSON response if requested
        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Task deleted successfully'
            ]);
        }

        // Redirect to resources page with success message
            return redirect()->route('projects.resources', [
            'project' => $project->id,
            'tab' => 'tasks'
        ])->with('success', 'Task deleted successfully.');
    }

    /**
     * Update the status of a task.
     */
    public function updateStatus(Request $request, Project $project, ProjectTask $task)
    {
        // Log that this method is being called
        Log::info('TaskController@updateStatus called for task: ' . $task->id);

        // Check if the task belongs to the project
        if ($task->project_id !== $project->id) {
            return response()->json(['message' => 'Task does not belong to this project'], 403);
        }

        // Validate the request
        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'in_progress', 'completed', 'cancelled'])]
        ]);

        // Update the task status
        $task->update($validated);

        // If status is completed, set completion_percentage to 100
        if ($validated['status'] === 'completed' && $task->completion_percentage < 100) {
            $task->update(['completion_percentage' => 100]);
        }

        // Load the assigned user
        if ($task->assigned_to_id) {
            $task->load('assignedTo');
        }

        // Return JSON response if requested
        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Task status updated successfully',
                'task' => $task
            ]);
        }

        // Redirect to resources page with success message
        return redirect()->route('projects.resources', [
            'project' => $project->id,
            'tab' => 'tasks'
        ])->with('success', 'Task status updated successfully.');
    }
}


