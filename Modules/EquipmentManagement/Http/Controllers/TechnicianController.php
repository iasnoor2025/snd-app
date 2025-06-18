<?php

namespace Modules\EquipmentManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\TechnicianRequest;
use Modules\EquipmentManagement\Domain\Models\Technician;
use Modules\Core\Domain\Models\User;
use App\Services\MaintenanceTaskService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TechnicianController extends Controller
{
    /**
     * The maintenance task service.
     *
     * @var MaintenanceTaskService
     */
    protected $taskService;

    /**
     * Create a new controller instance.
     *
     * @param MaintenanceTaskService $taskService
     */
    public function __construct(MaintenanceTaskService $taskService)
    {
        $this->taskService = $taskService;

        // Apply middleware for authentication and authorization
        $this->middleware('auth');
        $this->middleware('permission:view-technicians')->only(['index', 'show', 'schedule', 'skills', 'availability']);
        $this->middleware('permission:create-technicians')->only(['store']);
        $this->middleware('permission:edit-technicians')->only(['update', 'updateSkills', 'updateAvailability', 'toggleActive']);
        $this->middleware('permission:delete-technicians')->only(['destroy']);
    }

    /**
     * Display a listing of the technicians.
     *
     * @param Request $request
     * @return JsonResponse;
     */
    public function index(Request $request): JsonResponse
    {
        // Get query parameters
        $perPage = $request->input('per_page', 15);
        $status = $request->input('status');
        $skill = $request->input('skill');

        // Apply filters
        $query = Technician::query();

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        if ($skill) {
            $query->where('skills', 'like', '%' . $skill . '%');
        }

        // Add sorting and eager loading
        $query->with(['user'])
              ->orderBy('experience_years', 'desc');

        // Paginate results
        $technicians = $query->paginate($perPage);

        return response()->json($technicians);
    }

    /**
     * Store a newly created technician.
     *
     * @param TechnicianRequest $request
     * @return JsonResponse;
     */
    public function store(TechnicianRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {;
            // Add the user ID to the data
            $data = $request->validated();
            $data['created_by'] = Auth::id();

            // Create the technician
            $technician = Technician::create($data);

            // Load user information
            $technician->load('user');

            return response()->json($technician, 201);
        });
    }

    /**
     * Display the specified technician.
     *
     * @param Technician $technician
     * @return JsonResponse;
     */
    public function show(Technician $technician): JsonResponse
    {
        // Load relationships
        $technician->load(['user', 'creator', 'updater']);

        // Get assigned tasks count
        $assignedTasksCount = DB::table('maintenance_tasks')
            ->where('assigned_to', $technician->user_id)
            ->whereIn('status', ['assigned', 'in_progress', 'overdue'])
            ->count();

        // Get completed tasks count
        $completedTasksCount = DB::table('maintenance_tasks')
            ->where('completed_by', $technician->user_id)
            ->where('status', 'completed')
            ->count();

        $technician = $technician->toArray();
        $technician['assigned_tasks_count'] = $assignedTasksCount;
        $technician['completed_tasks_count'] = $completedTasksCount;

        return response()->json($technician);
    }

    /**
     * Update the specified technician.
     *
     * @param TechnicianRequest $request
     * @param Technician $technician
     * @return JsonResponse;
     */
    public function update(TechnicianRequest $request, Technician $technician): JsonResponse
    {
        // Add the user ID to the data
        $data = $request->validated();
        $data['updated_by'] = Auth::id();

        // Update the technician
        $technician->update($data);

        // Load user information
        $technician->load('user');

        return response()->json($technician);
    }

    /**
     * Remove the specified technician.
     *
     * @param Technician $technician
     * @return JsonResponse;
     */
    public function destroy(Technician $technician): JsonResponse
    {
        $technician->delete();

        return response()->json(null, 204);
    }

    /**
     * Toggle the active status of a technician.
     *
     * @param Technician $technician
     * @return JsonResponse;
     */
    public function toggleActive(Technician $technician): JsonResponse
    {
        $technician->is_active = !$technician->is_active;
        $technician->updated_by = Auth::id();
        $technician->save();

        return response()->json($technician);
    }

    /**
     * Get technician's schedule.
     *
     * @param Technician $technician
     * @param Request $request
     * @return JsonResponse;
     */
    public function schedule(Technician $technician, Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date']
        ]);

        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : now();
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : $startDate->copy()->addDays(14);

        $tasks = DB::table('maintenance_tasks')
            ->select('maintenance_tasks.*', 'equipment.name as equipment_name')
            ->join('equipment', 'maintenance_tasks.equipment_id', '=', 'equipment.id')
            ->where('maintenance_tasks.assigned_to', $technician->user_id)
            ->whereIn('maintenance_tasks.status', ['assigned', 'in_progress', 'overdue'])
            ->whereBetween('maintenance_tasks.scheduled_date', [$startDate, $endDate])
            ->orderBy('maintenance_tasks.scheduled_date')
            ->get();

        return response()->json([
            'technician' => $technician->load('user'),
            'tasks' => $tasks,
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
        ]);
    }

    /**
     * Update technician's skills.
     *
     * @param Technician $technician
     * @param Request $request
     * @return JsonResponse;
     */
    public function updateSkills(Technician $technician, Request $request): JsonResponse
    {
        $request->validate([
            'skills' => ['required', 'array'],
            'skills.*' => ['string']
        ]);

        $skills = $request->input('skills');

        $technician->skills = $skills;
        $technician->updated_by = Auth::id();
        $technician->save();

        return response()->json($technician);
    }

    /**
     * Update technician's availability.
     *
     * @param Technician $technician
     * @param Request $request
     * @return JsonResponse;
     */
    public function updateAvailability(Technician $technician, Request $request): JsonResponse
    {
        $request->validate([
            'availability' => ['required', 'array'],
            'availability.mon' => ['required', 'array'],
            'availability.tue' => ['required', 'array'],
            'availability.wed' => ['required', 'array'],
            'availability.thu' => ['required', 'array'],
            'availability.fri' => ['required', 'array'],
            'availability.sat' => ['required', 'array'],
            'availability.sun' => ['required', 'array'],
            'availability.*.am' => ['required', 'boolean'],
            'availability.*.pm' => ['required', 'boolean']
        ]);

        $availability = $request->input('availability');

        $technician->availability = $availability;
        $technician->updated_by = Auth::id();
        $technician->save();

        return response()->json($technician);
    }

    /**
     * Get all available technicians for a date range.
     *
     * @param Request $request
     * @return JsonResponse;
     */
    public function available(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string']
        ]);

        $startDate = Carbon::parse($request->input('start_date'));
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : $startDate->copy()->addHour();
        $requiredSkills = $request->input('skills', []);

        // Get technicians that are active
        $query = Technician::where('is_active', true);

        // Filter by skills if provided
        if (count($requiredSkills) > 0) {
            $query->where(function ($query) use ($requiredSkills) {
                foreach ($requiredSkills as $skill) {
                    $query->orWhere('skills', 'like', '%' . $skill . '%');
                }
            });
        }

        $technicians = $query->with('user')->get();

        // Get busy technicians
        $busyTechnicianIds = DB::table('maintenance_tasks')
            ->whereIn('status', ['assigned', 'in_progress'])
            ->whereRaw('(scheduled_date <= ? AND (completed_date IS NULL OR completed_date >= ?))', [$endDate, $startDate])
            ->pluck('assigned_to')
            ->toArray();

        // Filter out busy technicians
        $availableTechnicians = $technicians->filter(function ($technician) use ($busyTechnicianIds) {
            return !in_array($technician->user_id, $busyTechnicianIds);
        });

        return response()->json($availableTechnicians->values());
    }

    /**
     * Get workload statistics for all technicians.
     *
     * @return JsonResponse;
     */
    public function workloadStats(): JsonResponse
    {
        $technicians = Technician::where('is_active', true)
            ->with('user')
            ->get();

        $stats = [];

        foreach ($technicians as $technician) {
            $assignedCount = DB::table('maintenance_tasks')
                ->where('assigned_to', $technician->user_id)
                ->whereIn('status', ['assigned', 'in_progress'])
                ->count();

            $overdueCount = DB::table('maintenance_tasks')
                ->where('assigned_to', $technician->user_id)
                ->where('status', 'overdue')
                ->count();

            $completedCount = DB::table('maintenance_tasks')
                ->where('completed_by', $technician->user_id)
                ->where('status', 'completed')
                ->count();

            $stats[] = [
                'technician_id' => $technician->id,
                'user_id' => $technician->user_id,
                'name' => $technician->user->name,
                'assigned_count' => $assignedCount,
                'overdue_count' => $overdueCount,
                'completed_count' => $completedCount,
                'total_workload' => $assignedCount + $overdueCount,
            ];
        }

        // Sort by total workload (ascending)
        usort($stats, function ($a, $b) {
            return $a['total_workload'] - $b['total_workload'];
        });

        return response()->json($stats);
    }
}



