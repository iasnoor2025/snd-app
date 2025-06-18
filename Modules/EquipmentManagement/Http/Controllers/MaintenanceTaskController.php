<?php
namespace Modules\EquipmentManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\MaintenanceTaskRequest;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\MaintenanceTask;
use Modules\Core\Domain\Models\User;
use App\Services\MaintenanceTaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MaintenanceTaskController extends Controller
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
        $this->middleware('permission:view-maintenance')->only(['index', 'show', 'byEquipment', 'byTechnician', 'overdue', 'today']);
        $this->middleware('permission:create-maintenance')->only(['store']);
        $this->middleware('permission:edit-maintenance')->only(['update', 'assign', 'start', 'complete', 'cancel']);
        $this->middleware('permission:delete-maintenance')->only(['destroy']);
    }

    /**
     * Display a listing of the maintenance tasks.
     *
     * @param Request $request
     * @return JsonResponse;
     */
    public function index(Request $request): JsonResponse
    {
        // Get query parameters
        $perPage = $request->input('per_page', 15);
        $status = $request->input('status');

        // Apply filters
        $query = MaintenanceTask::query();

        if ($status) {
            if (is_array($status)) {
                $query->whereIn('status', $status);
            } else {
                $query->where('status', $status);
            }
        }

        // Add sorting and eager loading
        $query->with(['equipment', 'schedule', 'assignedTechnician', 'completedBy'])
              ->orderBy('scheduled_date', 'desc');

        // Paginate results
        $tasks = $query->paginate($perPage);

        return response()->json($tasks);
    }

    /**
     * Store a newly created maintenance task.
     *
     * @param MaintenanceTaskRequest $request
     * @return JsonResponse;
     */
    public function store(MaintenanceTaskRequest $request): JsonResponse
    {
        // Add the user ID to the data
        $data = $request->validated();
        $data['created_by'] = Auth::id();

        // Create the task
        $task = $this->taskService->createTask($data);

        // Load relationships
        $task->load(['equipment', 'schedule', 'assignedTechnician']);

        return response()->json($task, 201);
    }

    /**
     * Display the specified maintenance task.
     *
     * @param MaintenanceTask $task
     * @return JsonResponse;
     */
    public function show(MaintenanceTask $task): JsonResponse
    {
        // Load relationships
        $task->load([
            'equipment',
            'schedule',
            'assignedTechnician',
            'completedBy',
            'creator',
            'updater',
            'parts.inventoryItem'
        ]);

        return response()->json($task);
    }

    /**
     * Update the specified maintenance task.
     *
     * @param MaintenanceTaskRequest $request
     * @param MaintenanceTask $task
     * @return JsonResponse;
     */
    public function update(MaintenanceTaskRequest $request, MaintenanceTask $task): JsonResponse
    {
        // Add the user ID to the data
        $data = $request->validated();
        $data['updated_by'] = Auth::id();

        // Update the task
        $task = $this->taskService->updateTask($task, $data);

        // Load relationships
        $task->load(['equipment', 'schedule', 'assignedTechnician', 'completedBy']);

        return response()->json($task);
    }

    /**
     * Remove the specified maintenance task.
     *
     * @param MaintenanceTask $task
     * @return JsonResponse;
     */
    public function destroy(MaintenanceTask $task): JsonResponse
    {
        $this->taskService->deleteTask($task);

        return response()->json(null, 204);
    }

    /**
     * Assign a task to a technician.
     *
     * @param MaintenanceTask $task
     * @param Request $request
     * @return JsonResponse;
     */
    public function assign(MaintenanceTask $task, Request $request): JsonResponse
    {
        $request->validate([
            'technician_id' => ['required', 'exists:users,id'],
            'send_notification' => ['nullable', 'boolean']
        ]);

        $technicianId = $request->input('technician_id');
        $sendNotification = $request->input('send_notification', true);

        $task = $this->taskService->assignTask($task, $technicianId, $sendNotification);

        // Load relationships
        $task->load(['equipment', 'schedule', 'assignedTechnician']);

        return response()->json($task);
    }

    /**
     * Find the best technician for a task.
     *
     * @param MaintenanceTask $task
     * @return JsonResponse;
     */
    public function findBestTechnician(MaintenanceTask $task): JsonResponse
    {
        $technician = $this->taskService->findBestTechnicianForTask($task);

        if (!$technician) {
            return response()->json([
                'message' => 'No suitable technicians found.'
            ], 404);
        }

        // Load user information
        $technician->load('user');

        return response()->json($technician);
    }

    /**
     * Mark a task as in progress.
     *
     * @param MaintenanceTask $task
     * @return JsonResponse;
     */
    public function start(MaintenanceTask $task): JsonResponse
    {
        $task = $this->taskService->startTask($task);

        // Load relationships
        $task->load(['equipment', 'schedule', 'assignedTechnician']);

        return response()->json($task);
    }

    /**
     * Mark a task as completed.
     *
     * @param MaintenanceTask $task
     * @param Request $request
     * @return JsonResponse;
     */
    public function complete(MaintenanceTask $task, Request $request): JsonResponse
    {
        $request->validate([
            'actual_duration' => ['nullable', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
            'parts_used' => ['nullable', 'array'],
            'parts_used.*' => ['integer', 'min:0']
        ]);

        $userId = Auth::id();
        $actualDuration = $request->input('actual_duration');
        $notes = $request->input('notes');
        $partsUsed = $request->input('parts_used');

        $task = $this->taskService->completeTask($task, $userId, $actualDuration, $notes, $partsUsed);

        // Load relationships
        $task->load(['equipment', 'schedule', 'assignedTechnician', 'completedBy', 'parts']);

        return response()->json($task);
    }

    /**
     * Cancel a task.
     *
     * @param MaintenanceTask $task
     * @param Request $request
     * @return JsonResponse;
     */
    public function cancel(MaintenanceTask $task, Request $request): JsonResponse
    {
        $request->validate([
            'reason' => ['nullable', 'string']
        ]);

        $reason = $request->input('reason');

        $task = $this->taskService->cancelTask($task, $reason);

        // Load relationships
        $task->load(['equipment', 'schedule', 'assignedTechnician']);

        return response()->json($task);
    }

    /**
     * Get all tasks for a specific equipment.
     *
     * @param Equipment $equipment
     * @return JsonResponse;
     */
    public function byEquipment(Equipment $equipment): JsonResponse
    {
        $tasks = $this->taskService->getTasksForEquipment($equipment->id);

        // Load relationships
        $tasks->load(['schedule', 'assignedTechnician', 'completedBy']);

        return response()->json($tasks);
    }

    /**
     * Get all tasks assigned to a specific technician.
     *
     * @param User $user
     * @return JsonResponse;
     */
    public function byTechnician(User $user): JsonResponse
    {
        $tasks = $this->taskService->getTasksForTechnician($user->id);

        // Load relationships
        $tasks->load(['equipment', 'schedule']);

        return response()->json($tasks);
    }

    /**
     * Get all overdue tasks.
     *
     * @return JsonResponse;
     */
    public function overdue(): JsonResponse
    {
        $tasks = $this->taskService->getOverdueTasks();

        // Load relationships
        $tasks->load(['equipment', 'schedule', 'assignedTechnician']);

        return response()->json($tasks);
    }

    /**
     * Get all tasks scheduled for today.
     *
     * @return JsonResponse;
     */
    public function today(): JsonResponse
    {
        $tasks = $this->taskService->getTasksForToday();

        // Load relationships
        $tasks->load(['equipment', 'schedule', 'assignedTechnician']);

        return response()->json($tasks);
    }

    /**
     * Add a part to a task.
     *
     * @param MaintenanceTask $task
     * @param Request $request
     * @return JsonResponse;
     */
    public function addPart(MaintenanceTask $task, Request $request): JsonResponse
    {
        $request->validate([
            'inventory_item_id' => ['required', 'exists:inventory_items,id'],
            'quantity_required' => ['required', 'integer', 'min:1'],
            'part_number' => ['nullable', 'string'],
            'cost_per_unit' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string']
        ]);

        $extraData = [
            'part_number' => $request->input('part_number'),
            'cost_per_unit' => $request->input('cost_per_unit'),
            'notes' => $request->input('notes'),
            'created_by' => Auth::id(),
        ];

        $part = $this->taskService->addPartToTask(
            $task,
            $request->input('inventory_item_id'),
            $request->input('quantity_required'),
            array_filter($extraData)
        );

        // Load inventory item
        $part->load('inventoryItem');

        return response()->json($part, 201);
    }

    /**
     * Reserve parts for a task.
     *
     * @param MaintenanceTask $task
     * @return JsonResponse;
     */
    public function reserveParts(MaintenanceTask $task): JsonResponse
    {
        list($success, $failure) = $this->taskService->reservePartsForTask($task, Auth::id());

        return response()->json([
            'success_count' => $success,
            'failure_count' => $failure,
            'total_parts' => $success + $failure,
        ]);
    }
}


