<?php

namespace Modules\ProjectManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\ProjectManagement\Domain\Models\ProjectTimesheet;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class ProjectTimesheetController extends Controller
{
    public function index(Request $request)
    {
        $query = ProjectTimesheet::query();
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        return response()->json($query->with(['employee', 'approver', 'project'])->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'hours_worked' => 'required|numeric',
            'overtime_hours' => 'nullable|numeric',
            'project_id' => 'required|exists:projects,id',
            'description' => 'nullable|string',
            'tasks_completed' => 'nullable|string',
        ]);
        $data['status'] = 'submitted';
        $timesheet = ProjectTimesheet::create($data);
        return response()->json($timesheet->load(['employee', 'project']), 201);
    }

    public function show(ProjectTimesheet $timesheet)
    {
        return response()->json($timesheet->load(['employee', 'approver', 'project']));
    }

    public function update(Request $request, ProjectTimesheet $timesheet)
    {
        $data = $request->validate([
            'hours_worked' => 'sometimes|required|numeric',
            'overtime_hours' => 'nullable|numeric',
            'description' => 'nullable|string',
            'tasks_completed' => 'nullable|string',
            'status' => 'sometimes|required|in:draft,submitted,approved,rejected',
        ]);
        $timesheet->update($data);
        return response()->json($timesheet->fresh(['employee', 'approver', 'project']));
    }

    public function destroy(ProjectTimesheet $timesheet)
    {
        $timesheet->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function approve(ProjectTimesheet $timesheet)
    {
        $timesheet->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => Carbon::now(),
        ]);
        return response()->json($timesheet->fresh(['employee', 'approver', 'project']));
    }

    public function reject(ProjectTimesheet $timesheet)
    {
        $timesheet->update([
            'status' => 'rejected',
            'approved_by' => Auth::id(),
            'approved_at' => Carbon::now(),
        ]);
        return response()->json($timesheet->fresh(['employee', 'approver', 'project']));
    }

    public function projectSummary($projectId)
    {
        $summary = ProjectTimesheet::where('project_id', $projectId)
            ->selectRaw('SUM(hours_worked) as total_hours, SUM(overtime_hours) as total_overtime, COUNT(*) as entries')
            ->first();
        return response()->json($summary);
    }
}
