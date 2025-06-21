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

    /**
     * Generate project report
     */
    public function generateReport(Request $request, Project $project)
    {
        $format = $request->input('format', 'pdf');
        
        $project->load(['manager', 'tasks', 'teamMembers', 'resources']);
        
        $reportData = [
            'project' => $project,
            'summary' => [
                'total_tasks' => $project->tasks->count(),
                'completed_tasks' => $project->tasks->where('status', 'completed')->count(),
                'pending_tasks' => $project->tasks->where('status', 'pending')->count(),
                'in_progress_tasks' => $project->tasks->where('status', 'in_progress')->count(),
                'total_team_members' => $project->teamMembers->count(),
                'budget_utilization' => $project->getSpentAmount(),
                'completion_percentage' => $project->progress ?? 0,
            ],
            'tasks_by_status' => $project->tasks->groupBy('status'),
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];

        if ($format === 'json') {
            return response()->json($reportData);
        }

        // Generate HTML for PDF
        $html = $this->generateProjectReportHTML($reportData);
        
        $filename = "project-report-{$project->id}-" . now()->format('Ymd_His') . ".{$format}";
        
        return response($html, 200, [
            'Content-Type' => $format === 'pdf' ? 'application/pdf' : 'text/html',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ]);
    }

    /**
     * Generate HTML content for project report
     */
    private function generateProjectReportHTML($data)
    {
        $project = $data['project'];
        $summary = $data['summary'];
        
        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Project Report - ' . $project->name . '</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; color: #333; }
        .document-title { font-size: 18px; margin-top: 10px; }
        .section { margin: 20px 0; }
        .section-title { font-size: 16px; font-weight: bold; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 15px; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 8px; border-bottom: 1px solid #ddd; }
        .info-table .label { font-weight: bold; width: 30%; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .stat-box { border: 1px solid #ddd; padding: 15px; text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #2563eb; }
        .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
        .progress-bar { width: 100%; height: 20px; background-color: #f0f0f0; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background-color: #10b981; transition: width 0.3s ease; }
        .task-list { list-style: none; padding: 0; }
        .task-item { padding: 10px; border-bottom: 1px solid #eee; }
        .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-in-progress { background-color: #dbeafe; color: #1e40af; }
        .status-completed { background-color: #d1fae5; color: #065f46; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">' . config('app.name', 'Company Name') . '</div>
        <div class="document-title">PROJECT REPORT</div>
        <div>Project: ' . $project->name . '</div>
        <div>Generated on: ' . $data['generated_at'] . '</div>
    </div>

    <div class="section">
        <div class="section-title">Project Overview</div>
        <table class="info-table">
            <tr>
                <td class="label">Project Name:</td>
                <td>' . $project->name . '</td>
                <td class="label">Manager:</td>
                <td>' . ($project->manager->name ?? 'N/A') . '</td>
            </tr>
            <tr>
                <td class="label">Client:</td>
                <td>' . $project->client_name . '</td>
                <td class="label">Priority:</td>
                <td>' . ucfirst($project->priority) . '</td>
            </tr>
            <tr>
                <td class="label">Start Date:</td>
                <td>' . $project->start_date->format('d/m/Y') . '</td>
                <td class="label">End Date:</td>
                <td>' . ($project->end_date ? $project->end_date->format('d/m/Y') : 'N/A') . '</td>
            </tr>
            <tr>
                <td class="label">Status:</td>
                <td>' . ucfirst($project->status) . '</td>
                <td class="label">Budget:</td>
                <td>$' . number_format($project->budget, 2) . '</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Project Progress</div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ' . $summary['completion_percentage'] . '%"></div>
        </div>
        <p style="text-align: center; margin-top: 10px;">
            <strong>' . $summary['completion_percentage'] . '% Complete</strong>
        </p>
    </div>

    <div class="section">
        <div class="section-title">Project Statistics</div>
        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-number">' . $summary['total_tasks'] . '</div>
                <div class="stat-label">Total Tasks</div>
            </div>
            <div class="stat-box">
                <div class="stat-number">' . $summary['completed_tasks'] . '</div>
                <div class="stat-label">Completed Tasks</div>
            </div>
            <div class="stat-box">
                <div class="stat-number">' . $summary['total_team_members'] . '</div>
                <div class="stat-label">Team Members</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Task Summary</div>
        <table class="info-table">
            <tr>
                <td class="label">Completed Tasks:</td>
                <td>' . $summary['completed_tasks'] . '</td>
            </tr>
            <tr>
                <td class="label">In Progress Tasks:</td>
                <td>' . $summary['in_progress_tasks'] . '</td>
            </tr>
            <tr>
                <td class="label">Pending Tasks:</td>
                <td>' . $summary['pending_tasks'] . '</td>
            </tr>
        </table>
    </div>';

        if ($project->description) {
            $html .= '<div class="section">
                <div class="section-title">Project Description</div>
                <p>' . nl2br(htmlspecialchars($project->description)) . '</p>
            </div>';
        }

        $html .= '<div class="section">
        <div class="section-title">Team Members</div>
        <ul class="task-list">';
        
        foreach ($project->teamMembers as $member) {
            $html .= '<li class="task-item">' . $member->name . ' - ' . ($member->pivot->role ?? 'Team Member') . '</li>';
        }
        
        $html .= '</ul>
    </div>

    <div style="text-align: center; margin-top: 50px; font-size: 12px; color: #666;">
        This report was generated automatically on ' . $data['generated_at'] . '
    </div>
</body>
</html>';

        return $html;
    }
}


