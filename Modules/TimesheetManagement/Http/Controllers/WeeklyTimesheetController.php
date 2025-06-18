<?php

namespace Modules\TimesheetManagement\Http\Controllers;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Modules\TimesheetManagement\Repositories\WeeklyTimesheetRepository;
use Modules\TimesheetManagement\Repositories\TimeEntryRepository;
use Modules\TimesheetManagement\Http\Requests\WeeklyTimesheetRequest;
use Modules\TimesheetManagement\Actions\CreateTimesheetAction;
use Modules\TimesheetManagement\Actions\UpdateTimesheetAction;
use Modules\TimesheetManagement\Actions\SubmitTimesheetAction;
use Modules\Project\Repositories\ProjectRepository;

class WeeklyTimesheetController extends Controller
{
    protected $weeklyTimesheetRepository;
    protected $timeEntryRepository;
    protected $projectRepository;
    protected $createTimesheetAction;
    protected $updateTimesheetAction;
    protected $submitTimesheetAction;

    /**
     * Constructor
     */
    public function __construct(
        WeeklyTimesheetRepository $weeklyTimesheetRepository,
        TimeEntryRepository $timeEntryRepository,
        ProjectRepository $projectRepository,
        CreateTimesheetAction $createTimesheetAction,
        UpdateTimesheetAction $updateTimesheetAction,
        SubmitTimesheetAction $submitTimesheetAction
    ) {
        $this->weeklyTimesheetRepository = $weeklyTimesheetRepository;
        $this->timeEntryRepository = $timeEntryRepository;
        $this->projectRepository = $projectRepository;
        $this->createTimesheetAction = $createTimesheetAction;
        $this->updateTimesheetAction = $updateTimesheetAction;
        $this->submitTimesheetAction = $submitTimesheetAction;
    }

    /**
     * Display a listing of the resource.
     * @param Request $request
     * @return Renderable;
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $employeeId = $user->employee?->id;

        if (!$employeeId) {
            // Handle case where user doesn't have an employee record
            return Inertia::render('TimesheetManagement::NoEmployeeRecord');
        }

        // Get filters from request
        $filters = $request->only(['status', 'start_date', 'end_date', 'year']);

        // Get employee timesheets
        $timesheets = $this->weeklyTimesheetRepository->getEmployeeTimesheets($employeeId, $filters);

        // Get current timesheet
        $currentTimesheet = $this->weeklyTimesheetRepository->getCurrentTimesheet($employeeId);

        // Get counts for different statuses
        $counts = $this->weeklyTimesheetRepository->countTimesheetsByStatus(['employee_id' => $employeeId]);

        return Inertia::render('TimesheetManagement::Weekly/Index', [
            'timesheets' => $timesheets,
            'currentTimesheet' => $currentTimesheet,
            'counts' => $counts,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     * @return Renderable;
     */
    public function create()
    {
        $user = Auth::user();
        $employeeId = $user->employee?->id;

        if (!$employeeId) {
            // Handle case where user doesn't have an employee record
            return Inertia::render('TimesheetManagement::NoEmployeeRecord');
        }

        // Get active projects for dropdown
        $projects = $this->projectRepository->getActiveProjects();

        return Inertia::render('TimesheetManagement::Weekly/Create', [
            'projects' => $projects,
            'defaultWorkingHours' => config('timesheetmanagement.default_working_hours', 8),
            'workDays' => config('timesheetmanagement.work_days', [1, 2, 3, 4, 5])
        ]);
    }

    /**
     * Store a newly created resource in storage.
     * @param WeeklyTimesheetRequest $request
     * @return \Illuminate\Http\RedirectResponse;
     */
    public function store(WeeklyTimesheetRequest $request)
    {
        $timesheet = $this->createTimesheetAction->execute($request->validated());

        return redirect()->route('timesheets.weekly.edit', $timesheet->id)
            ->with('success', 'Timesheet created successfully.');
    }

    /**
     * Show the specified resource.
     * @param int $id
     * @return Renderable;
     */
    public function show($id)
    {
        $timesheet = $this->weeklyTimesheetRepository->findOrFail($id);

        // Load time entries grouped by date
        $timeEntries = $this->timeEntryRepository->getEntriesForTimesheet($timesheet->id, true);

        return Inertia::render('TimesheetManagement::Weekly/Show', [
            'timesheet' => $timesheet->load(['employee', 'approver', 'rejector']),
            'timeEntries' => $timeEntries,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     * @param int $id
     * @return Renderable;
     */
    public function edit($id)
    {
        $timesheet = $this->weeklyTimesheetRepository->findOrFail($id);

        // Check if timesheet is editable
        if (!$timesheet->isEditable()) {
            return redirect()->route('timesheets.weekly.show', $id)
                ->with('error', 'This timesheet cannot be edited.');
        }

        // Load time entries grouped by date
        $timeEntries = $this->timeEntryRepository->getEntriesForTimesheet($timesheet->id, true);

        // Get active projects for dropdown
        $projects = $this->projectRepository->getActiveProjects();

        return Inertia::render('TimesheetManagement::Weekly/Edit', [
            'timesheet' => $timesheet,
            'timeEntries' => $timeEntries,
            'projects' => $projects,
            'defaultWorkingHours' => config('timesheetmanagement.default_working_hours', 8),
            'workDays' => config('timesheetmanagement.work_days', [1, 2, 3, 4, 5])
        ]);
    }

    /**
     * Update the specified resource in storage.
     * @param WeeklyTimesheetRequest $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse;
     */
    public function update(WeeklyTimesheetRequest $request, $id)
    {
        $this->updateTimesheetAction->execute($id, $request->validated());

        return redirect()->route('timesheets.weekly.edit', $id)
            ->with('success', 'Timesheet updated successfully.');
    }

    /**
     * Submit the timesheet for approval.
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse;
     */
    public function submit(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            $this->submitTimesheetAction->execute($id, $request->notes);
            return redirect()->route('timesheets.weekly.show', $id)
                ->with('success', 'Timesheet submitted successfully for approval.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['message' => $e->getMessage()]);
        }
    }
}


