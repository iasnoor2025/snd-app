<?php
namespace Modules\ProjectManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectManpower;
use Modules\ProjectManagement\Domain\Models\ProjectEquipment;
use Modules\ProjectManagement\Domain\Models\ProjectMaterial;
use Modules\ProjectManagement\Domain\Models\ProjectFuel;
use Modules\ProjectManagement\Domain\Models\ProjectExpense;
use Modules\ProjectManagement\Services\ProjectResourceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Modules\ProjectManagement\Actions\ProjectResources\CreateManpower;
use Modules\ProjectManagement\Actions\ProjectResources\UpdateManpower;
use Modules\ProjectManagement\Actions\ProjectResources\DeleteManpower;
use Modules\ProjectManagement\Actions\ProjectResources\CreateEquipment;
use Modules\ProjectManagement\Actions\ProjectResources\UpdateEquipment;
use Modules\ProjectManagement\Actions\ProjectResources\DeleteEquipment;
use Modules\ProjectManagement\Actions\ProjectResources\CreateMaterial;
use Modules\ProjectManagement\Actions\ProjectResources\UpdateMaterial;
use Modules\ProjectManagement\Actions\ProjectResources\DeleteMaterial;
use Modules\ProjectManagement\Actions\ProjectResources\CreateFuel;
use Modules\ProjectManagement\Actions\ProjectResources\UpdateFuel;
use Modules\ProjectManagement\Actions\ProjectResources\DeleteFuel;
use Modules\ProjectManagement\Actions\ProjectResources\CreateExpense;
use Modules\ProjectManagement\Actions\ProjectResources\UpdateExpense;
use Modules\ProjectManagement\Actions\ProjectResources\DeleteExpense;

class ProjectResourcesApiController extends Controller
{
    protected $resourceService;

    public function __construct(ProjectResourceService $resourceService)
    {
        $this->resourceService = $resourceService;
    }

    /**
     * Get all resources for a project
     */
    public function index(Request $request, Project $project)
    {
        try {
            $project->load([
                'manpower.employee',
                'equipment.equipment',
                'materials',
                'fuel.equipment',
                'expenses',
                'tasks.assignedTo',
            ]);

            // Get assignable users (all users or those with specific role)
            $assignableUsers = \Modules\Core\Domain\Models\User::select('id', 'name')->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'project' => [
                        'id' => $project->id,
                        'name' => $project->name,
                    ],
                    'manpower' => $project->manpower,
                    'equipment' => $project->equipment,
                    'materials' => $project->materials,
                    'fuel' => $project->fuel,
                    'expenses' => $project->expenses,
                    'tasks' => $project->tasks,
                    'assignableUsers' => $assignableUsers,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve project resources: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve project resources',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new manpower resource
     */
    public function storeManpower(Request $request, Project $project, CreateManpower $action)
    {
        try {
            $validator = Validator::make($request->all(), [
                'employee_id' => 'nullable',
                'worker_name' => 'nullable|string|max:255',
                'start_date' => 'required|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'total_days' => 'required|integer|min:1',
                'daily_rate' => 'required|numeric|min:0',
                'notes' => 'nullable|string',
                'job_title' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $manpower = $action->execute($project, $validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Manpower resource created successfully',
                'data' => $manpower
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to save manpower resource: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to save manpower resource',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing manpower resource
     */
    public function updateManpower(Request $request, Project $project, ProjectManpower $manpower, UpdateManpower $action)
    {
        try {
            $validator = Validator::make($request->all(), [
                'employee_id' => 'nullable',
                'worker_name' => 'nullable|string|max:255',
                'start_date' => 'required|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'total_days' => 'required|integer|min:1',
                'daily_rate' => 'required|numeric|min:0',
                'notes' => 'nullable|string',
                'job_title' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $manpower = $action->execute($manpower, $validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Manpower resource updated successfully',
                'data' => $manpower
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update manpower resource: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update manpower resource',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a manpower resource
     */
    public function destroyManpower(Request $request, Project $project, $manpowerId, DeleteManpower $action)
    {
        $manpower = \Modules\ProjectManagement\Domain\Models\ProjectManpower::where('id', $manpowerId)
            ->where('project_id', $project->id)
            ->first();
        if (!$manpower) {
            \Log::warning('Manpower not found or does not belong to project', [
                'project_id' => $project->id,
                'manpower_id' => $manpowerId,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Manpower resource not found or does not belong to this project.'
            ], 404);
        }
        try {
            $action->execute($manpower);
            return response()->json([
                'success' => true,
                'message' => 'Manpower resource deleted successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to delete manpower resource: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete manpower resource',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new equipment resource
     */
    public function storeEquipment(Request $request, Project $project, CreateEquipment $action)
    {
        try {
            // Log the incoming request data for debugging
            Log::info('Equipment creation request data:', [
                'all' => $request->all(),
                'json' => $request->json()->all(),
                'form' => $request->input(),
                'headers' => $request->headers->all()
            ]);

            // Get data from either JSON or form data
            $data = $request->json()->all() ?: $request->all();

            $validator = Validator::make($data, [
                'equipment_id' => 'required|exists:equipment,id',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'usage_hours' => 'required|numeric|min:0',
                'hourly_rate' => 'required|numeric|min:0',
                'maintenance_cost' => 'nullable|numeric|min:0',
                'notes' => 'nullable|string',
                'quantity' => 'nullable|numeric|min:0',
                'unit' => 'nullable|string|max:50',
                'unit_price' => 'nullable|numeric|min:0',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed:', [
                    'errors' => $validator->errors()->toArray(),
                    'request_data' => $data,
                    'content_type' => $request->header('Content-Type')
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                    'request_data' => $data,
                    'content_type' => $request->header('Content-Type')
                ], 422);
            }

            $equipment = $action->execute($project, $validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Equipment resource created successfully',
                'data' => $equipment
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to save equipment resource: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to save equipment resource',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing equipment resource
     */
    public function updateEquipment(Request $request, Project $project, ProjectEquipment $equipment, UpdateEquipment $action)
    {
        try {
            $validator = Validator::make($request->all(), [
                'equipment_id' => 'required|exists:equipment,id',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'usage_hours' => 'required|numeric|min:0',
                'hourly_rate' => 'required|numeric|min:0',
                'maintenance_cost' => 'nullable|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $equipment = $action->execute($equipment, $validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Equipment resource updated successfully',
                'data' => $equipment
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update equipment resource: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update equipment resource',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an equipment resource
     */
    public function destroyEquipment(Request $request, Project $project, ProjectEquipment $equipment, DeleteEquipment $action)
    {
        try {
            $action->execute($equipment);

            return response()->json([
                'success' => true,
                'message' => 'Equipment resource deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete equipment resource: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete equipment resource',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new material resource
     */
    public function storeMaterial(Request $request, Project $project, CreateMaterial $action)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'quantity' => 'required|numeric|min:0',
                'unit' => 'required|string|max:50',
                'unit_price' => 'required|numeric|min:0',
                'purchase_date' => 'required|date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $material = $action->execute($project, $validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Material resource created successfully',
                'data' => $material
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to save material resource: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to save material resource',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing material resource
     */
    public function updateMaterial(Request $request, Project $project, ProjectMaterial $material, UpdateMaterial $action)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'quantity' => 'required|numeric|min:0',
                'unit' => 'required|string|max:50',
                'unit_price' => 'required|numeric|min:0',
                'purchase_date' => 'required|date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $material = $action->execute($material, $validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Material resource updated successfully',
                'data' => $material
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update material resource: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update material resource',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a material resource
     */
    public function destroyMaterial(Request $request, Project $project, ProjectMaterial $material, DeleteMaterial $action)
    {
        try {
            $action->execute($material);

            return response()->json([
                'success' => true,
                'message' => 'Material resource deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete material resource: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete material resource',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new fuel resource
     */
    public function storeFuel(Request $request, Project $project, CreateFuel $action)
    {
        try {
            $validator = Validator::make($request->all(), [
                'equipment_id' => 'required|exists:equipment,id',
                'fuel_type' => 'required|in:diesel,petrol',
                'quantity' => 'required|numeric|min:0',
                'unit' => 'required|string|max:50',
                'unit_price' => 'required|numeric|min:0',
                'date' => 'required|date',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $fuel = $action->execute($project, $validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Fuel resource created successfully',
                'data' => $fuel
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to save fuel resource: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to save fuel resource',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing fuel resource
     */
    public function updateFuel(Request $request, Project $project, ProjectFuel $fuel, UpdateFuel $action)
    {
        try {
            $validator = Validator::make($request->all(), [
                'equipment_id' => 'required|exists:equipment,id',
                'fuel_type' => 'required|in:diesel,petrol',
                'quantity' => 'required|numeric|min:0',
                'unit' => 'required|string|max:50',
                'unit_price' => 'required|numeric|min:0',
                'date' => 'required|date',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $fuel = $action->execute($fuel, $validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Fuel resource updated successfully',
                'data' => $fuel
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update fuel resource: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update fuel resource',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a fuel resource
     */
    public function destroyFuel(Request $request, Project $project, ProjectFuel $fuel, DeleteFuel $action)
    {
        try {
            $action->execute($fuel);

            return response()->json([
                'success' => true,
                'message' => 'Fuel resource deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete fuel resource: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete fuel resource',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new expense resource
     */
    public function storeExpense(Request $request, Project $project, CreateExpense $action)
    {
        try {
            $validator = Validator::make($request->all(), [
                'description' => 'required|string',
                'amount' => 'required|numeric|min:0',
                'date' => 'required|date',
                'category' => 'nullable|string|max:100',
                'receipt_number' => 'nullable|string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $expense = $action->execute($project, $validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Expense resource created successfully',
                'data' => $expense
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to save expense resource: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to save expense resource',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing expense resource
     */
    public function updateExpense(Request $request, Project $project, ProjectExpense $expense, UpdateExpense $action)
    {
        try {
            $validator = Validator::make($request->all(), [
                'description' => 'required|string',
                'amount' => 'required|numeric|min:0',
                'date' => 'required|date',
                'category' => 'nullable|string|max:100',
                'receipt_number' => 'nullable|string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $expense = $action->execute($expense, $validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Expense resource updated successfully',
                'data' => $expense
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update expense resource: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update expense resource',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an expense resource
     */
    public function destroyExpense(Request $request, Project $project, ProjectExpense $expense, DeleteExpense $action)
    {
        try {
            $action->execute($expense);

            return response()->json([
                'success' => true,
                'message' => 'Expense resource deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete expense resource: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete expense resource',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a generic resource
     */
    public function destroyResource(Request $request, Project $project, $type, $resourceId)
    {
        try {
            switch ($type) {
                case 'manpower':
                    $resource = ProjectManpower::findOrFail($resourceId);
                    app(DeleteManpower::class)->execute($resource);
                    break;
                case 'equipment':
                    $resource = ProjectEquipment::findOrFail($resourceId);
                    app(DeleteEquipment::class)->execute($resource);
                    break;
                case 'material':
                    $resource = ProjectMaterial::findOrFail($resourceId);
                    app(DeleteMaterial::class)->execute($resource);
                    break;
                case 'fuel':
                    $resource = ProjectFuel::findOrFail($resourceId);
                    app(DeleteFuel::class)->execute($resource);
                    break;
                case 'expense':
                    $resource = ProjectExpense::findOrFail($resourceId);
                    app(DeleteExpense::class)->execute($resource);
                    break;
                default:
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid resource type specified'
                    ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => ucfirst($type) . ' resource deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to delete {$type} resource: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => "Failed to delete {$type} resource",
                'error' => $e->getMessage()
            ], 500);
        }
    }
}


