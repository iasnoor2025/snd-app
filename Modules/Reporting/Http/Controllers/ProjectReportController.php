<?php

namespace Modules\Reporting\Http\Controllers;

use Modules\ProjectManagement\Domain\Models\Project;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Response;

class ProjectReportController extends Controller
{
    /**
     * Generate a PDF report for the specified project.
     *
     * @param Request $request
     * @param Project $project
     * @return \Illuminate\Http\Response;
     */
    public function generate(Request $request, Project $project)
    {
        $validated = $request->validate([
            'include_resources' => 'nullable|boolean',
            'include_tasks' => 'nullable|boolean',
        ]);

        // Load the project with its relationships
        $project->load(['client', 'location']);

        $includeResources = $validated['include_resources'] ?? true;
        $includeTasks = $validated['include_tasks'] ?? true;

        // Load resources if needed
        if ($includeResources) {
            $project->load(['manpower', 'equipment', 'materials', 'fuel', 'expenses']);
        }

        // Load tasks if needed
        if ($includeTasks) {
            $project->load(['tasks' => function($query) {
                $query->with('assignedTo');
            }]);
        }

        // Calculate task statistics
        $taskStats = null;
        if ($includeTasks && $project->tasks->count() > 0) {
            $totalTasks = $project->tasks->count();
            $completedTasks = $project->tasks->where('status', 'completed')->count();
            $inProgressTasks = $project->tasks->where('status', 'in_progress')->count();
            $pendingTasks = $project->tasks->where('status', 'pending')->count();
            $overdueTasks = $project->tasks->where('status', 'overdue')->count();

            // Calculate completion percentage
            $completionPercentage = $totalTasks > 0
                ? round(($completedTasks / $totalTasks) * 100)
                : 0;

            $taskStats = [
                'total' => $totalTasks,
                'completed' => $completedTasks,
                'inProgress' => $inProgressTasks,
                'pending' => $pendingTasks,
                'overdue' => $overdueTasks,
                'percentage' => $completionPercentage,
            ];
        }

        // Calculate resource costs
        $resourceCosts = [
            'manpower' => $project->manpower->sum('amount'),
            'equipment' => $project->equipment->sum('amount'),
            'materials' => $project->materials->sum('amount'),
            'fuel' => $project->fuel->sum('amount'),
            'expenses' => $project->expenses->sum('amount'),
        ];

        $totalResourceCost = array_sum($resourceCosts);

        // Generate PDF
        $pdf = PDF::loadView('pdfs.project-report', [
            'project' => $project,
            'manpower' => $project->manpower ?? [],
            'equipment' => $project->equipment ?? [],
            'materials' => $project->materials ?? [],
            'fuel' => $project->fuel ?? [],
            'expenses' => $project->expenses ?? [],
            'tasks' => $project->tasks ?? [],
            'taskStats' => $taskStats,
            'resourceCosts' => $resourceCosts,
            'totalResourceCost' => $totalResourceCost,
            'includeResources' => $includeResources,
            'includeTasks' => $includeTasks,
        ]);

        return $pdf->download("project-{$project->id}-report.pdf");
    }
}


