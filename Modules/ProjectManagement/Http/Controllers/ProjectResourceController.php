<?php

namespace Modules\ProjectManagement\Http\Controllers;

use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectManpower;
use Modules\ProjectManagement\Domain\Models\ProjectEquipment;
use Modules\ProjectManagement\Domain\Models\ProjectMaterial;
use Modules\ProjectManagement\Domain\Models\ProjectFuel;
use Modules\ProjectManagement\Domain\Models\ProjectExpense;
use Modules\ProjectManagement\Services\ProjectResourceService;
use Modules\ProjectManagement\Http\Requests\ManpowerRequest;
use Modules\ProjectManagement\Http\Requests\EquipmentRequest;
use Modules\ProjectManagement\Http\Requests\MaterialRequest;
use Modules\ProjectManagement\Http\Requests\FuelRequest;
use Modules\ProjectManagement\Http\Requests\ExpenseRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\EquipmentResource;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Modules\ProjectManagement\Actions\ProjectResources\DeleteManpower;
use Modules\ProjectManagement\Actions\ProjectResources\CreateManpower;
use Modules\ProjectManagement\Actions\ProjectResources\UpdateManpower;

class ProjectResourceController extends Controller
{
    protected $resourceService;

    public function __construct(ProjectResourceService $resourceService)
    {
        $this->resourceService = $resourceService;
    }

    /**
     * Display the resources for a project.
     */
    public function index(Request $request, Project $project)
    {
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

        // Get the requested type and page
        $type = $request->input('type', 'manpower');
        $page = $request->input('page', 1);

        // Get the paginated data for each resource type
        $manpower = $project->manpower()->with('employee')->paginate(10, ['*'], 'manpower_page', $page);
        // Fix worker_name for each manpower entry
        $manpower->getCollection()->transform(function ($item) {
            if ($item->employee_id && $item->employee) {
                $item->worker_name = $item->employee->full_name;
            }
            return $item;
        });
        $equipment = $project->equipment()->paginate(10, ['*'], 'equipment_page', $page);
        $materials = $project->materials()->paginate(10, ['*'], 'materials_page', $page);
        $fuel = $project->fuel()->paginate(10, ['*'], 'fuel_page', $page);
        $expenses = $project->expenses()->paginate(10, ['*'], 'expenses_page', $page);
        $tasks = $project->tasks()->paginate(10, ['*'], 'tasks_page', $page);

        if ($request->wantsJson()) {
            return response()->json([
                'data' => [
                    'project' => [
                        'id' => $project->id,
                        'name' => $project->name,
                    ],
                    'manpower' => $manpower,
                    'equipment' => $equipment,
                    'materials' => $materials,
                    'fuel' => $fuel,
                    'expenses' => $expenses,
                    'tasks' => $tasks,
                    'assignableUsers' => $assignableUsers,
                ]
            ]);
        }

        return Inertia::render('Projects/Resources', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],
            'manpower' => $manpower,
            'equipment' => $equipment,
            'materials' => $materials,
            'fuel' => $fuel,
            'expenses' => $expenses,
            'tasks' => $tasks,
            'assignableUsers' => $assignableUsers,
            'type' => $type,
            'page' => $page,
        ]);
    }

    /**
     * Store a new manpower resource.
     */
    public function storeManpower(Request $request, Project $project, CreateManpower $action = null)
    {
        if (!$action) {
            $action = app(CreateManpower::class);
        }

        try {
            $validator = Validator::make($request->all(), [
                'employee_id' => 'nullable|integer',
                'worker_name' => 'nullable|string|max:255',
                'job_title' => 'required|string|max:255',
                'start_date' => 'required|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'daily_rate' => 'required|numeric|min:0',
                'total_days' => 'required|numeric|min:0',
                'notes' => 'nullable|string',
            ]);

            // Add a custom validation to ensure either employee_id or worker_name is provided
            $validator->after(function ($validator) use ($request) {
                if (empty($request->employee_id) && empty($request->worker_name)) {
                    $validator->errors()->add('worker_info',
'Either an employee or a worker name must be provided.');
                }
            });

            if ($validator->fails()) {
                if ($request->wantsJson()) {
                        return response()->json([
                        'success' => false,
                        'message' => 'Validation failed',
                        'errors' => $validator->errors()
                    ], 422);
                }

                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            $manpower = $action->execute($project, $validator->validated());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Manpower resource created successfully',
                    'data' => $manpower
                ], 201);
            }

            return redirect()->back()->with('success', 'Manpower resource created successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to create manpower resource: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create manpower resource',
                    'error' => $e->getMessage()
                ], 500);
            }

            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create manpower resource: ' . $e->getMessage()]);
        }
    }

    /**
     * Store a new equipment resource.
     */
    public function storeEquipment(Request $request, Project $project)
    {
        try {
            $validated = $request->validate([
                'equipment_id' => 'required|exists:equipment,id',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'usage_hours' => 'required|numeric|min:0',
                'hourly_rate' => 'required|numeric|min:0',
                'maintenance_cost' => 'nullable|numeric|min:0',
            ]);

            // Calculate total cost
            $totalCost = ($validated['usage_hours'] * $validated['hourly_rate']) + ($validated['maintenance_cost'] ?? 0);

            // Create the equipment resource
            $equipment = $project->equipment()->create([
                'equipment_id' => $validated['equipment_id'],
                'project_id' => $project->id,
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'usage_hours' => $validated['usage_hours'],
                'hourly_rate' => $validated['hourly_rate'],
                'maintenance_cost' => $validated['maintenance_cost'] ?? 0,
                'total_cost' => $totalCost,
                'notes' => $request->input('notes', ''),
                'date_used' => $validated['start_date'],
                'name' => $request->input('name') ?: 'Equipment',
                'unit' => 'hours',
                'quantity' => $validated['usage_hours'] ?? 0,
                'unit_price' => $validated['hourly_rate'] ?? 0,
                'type' => 'equipment',
                'category' => 'equipment',
                'amount' => $totalCost,
                'description' => $request->input('description', ''),
                'equipment_cost' => $totalCost,
                'unit_cost' => $validated['hourly_rate'] ?? 0,
                'status' => 'active',
                'worker_name' => $request->input('operator_name', ''),
            ]);

            Cache::forget('project_' . $project->id . '_equipment');

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Equipment resource created successfully',
                    'data' => $equipment
                ], 201);
            }

            return redirect()->route('projects.resources', $project)
                ->with('success', 'Equipment resource created successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to save equipment resource: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to save equipment resource',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new material resource.
     */
    public function storeMaterial(MaterialRequest $request, Project $project)
    {
        try {
            $material = $this->resourceService->storeMaterial($project, $request->validated());

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Material resource created successfully',
                    'resource' => $material
                ], 201);
            }

            return redirect()->route('projects.show', $project)
                ->with('success', 'Material resource added successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to save material resource: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Failed to save material resource',
                    'error' => $e->getMessage()
                ], 422);
            }

            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to save material resource: ' . $e->getMessage()]);
        }
    }

    /**
     * Store a new fuel resource.
     */
    public function storeFuel(FuelRequest $request, Project $project)
    {
        try {
            $fuel = $this->resourceService->storeFuel($project, $request->validated());

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Fuel resource created successfully',
                    'resource' => $fuel
                ], 201);
            }

            return redirect()->route('projects.show', $project)
                ->with('success', 'Fuel resource added successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to save fuel resource: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Failed to save fuel resource',
                    'error' => $e->getMessage()
                ], 422);
            }

            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to save fuel resource: ' . $e->getMessage()]);
        }
    }

    /**
     * Store a new expense resource.
     */
    public function storeExpense(ExpenseRequest $request, Project $project)
    {
        try {
            $expense = $this->resourceService->storeExpense($project, $request->validated());

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Expense resource created successfully',
                    'resource' => $expense
                ], 201);
            }

            return redirect()->route('projects.show', $project)
                ->with('success', 'Expense resource added successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to save expense resource: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Failed to save expense resource',
                    'error' => $e->getMessage()
                ], 422);
            }

            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to save expense resource: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified manpower resource.
     */
    public function updateManpower(Request $request, Project $project, ProjectManpower $manpower, UpdateManpower $action = null)
    {
        if (!$action) {
            $action = app(UpdateManpower::class);
        }

        try {
            $validator = Validator::make($request->all(), [
                'employee_id' => 'nullable',
                'worker_name' => 'nullable|string|max:255',
                'job_title' => 'required|string|max:255',
                'start_date' => 'required|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'daily_rate' => 'required|numeric|min:0',
                'total_days' => 'required|numeric|min:0',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $manpower = $action->execute($manpower, $validator->validated());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Manpower resource updated successfully',
                    'data' => $manpower
                ]);
            }

            return redirect()->back()->with('success', 'Manpower resource updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update manpower resource: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update manpower resource',
                    'error' => $e->getMessage()
                ], 500);
            }

            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update manpower resource: ' . $e->getMessage()]);
        }
    }

    /**
     * Update an equipment resource.
     */
    public function updateEquipment(Request $request, Project $project, ProjectEquipment $equipment)
    {
        try {
            $validated = $request->validate([
                'equipment_id' => 'required|exists:equipment,id',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'usage_hours' => 'required|numeric|min:0',
                'hourly_rate' => 'required|numeric|min:0',
                'maintenance_cost' => 'nullable|numeric|min:0',
            ]);

            // Calculate total cost
            $totalCost = ($validated['usage_hours'] * $validated['hourly_rate']) + ($validated['maintenance_cost'] ?? 0);

            // Update the equipment resource
            $equipment->update([
                'equipment_id' => $validated['equipment_id'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'usage_hours' => $validated['usage_hours'],
                'hourly_rate' => $validated['hourly_rate'],
                'maintenance_cost' => $validated['maintenance_cost'] ?? 0,
                'total_cost' => $totalCost,
            ]);

            // Clear cache without using tags
            Cache::forget('project_' . $project->id . '_equipment');

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Equipment resource updated successfully',
                    'data' => $equipment->load('equipment')
                ]);
            }

            return redirect()->back()->with('success', 'Equipment resource updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update equipment resource: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Failed to update equipment resource',
                    'error' => $e->getMessage()
                ], 422);
            }

            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update equipment resource: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified material resource.
     */
    public function updateMaterial(MaterialRequest $request, Project $project, ProjectMaterial $material)
    {
        try {
            $material = $this->resourceService->updateMaterial($material, $request->validated());

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Material resource updated successfully',
                    'resource' => $material
                ]);
            }

            return redirect()->back()->with('success', 'Material resource updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update material resource: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Failed to update material resource',
                    'error' => $e->getMessage()
                ], 422);
            }

            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update material resource: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified fuel resource.
     */
    public function updateFuel(FuelRequest $request, Project $project, ProjectFuel $fuel)
    {
        try {
            $fuel = $this->resourceService->updateFuel($fuel, $request->validated());

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Fuel resource updated successfully',
                    'resource' => $fuel
                ]);
            }

            return redirect()->back()->with('success', 'Fuel resource updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update fuel resource: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Failed to update fuel resource',
                    'error' => $e->getMessage()
                ], 422);
            }

            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update fuel resource: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified expense resource.
     */
    public function updateExpense(ExpenseRequest $request, Project $project, ProjectExpense $expense)
    {
        try {
            $expense = $this->resourceService->updateExpense($expense, $request->validated());

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Expense resource updated successfully',
                    'resource' => $expense
                ]);
            }

            return redirect()->back()->with('success', 'Expense resource updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update expense resource: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Failed to update expense resource',
                    'error' => $e->getMessage()
                ], 422);
            }

            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update expense resource: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete an equipment resource.
     */
    public function destroyEquipment(Request $request, Project $project, ProjectEquipment $equipment)
    {
        try {
            $this->resourceService->deleteResource($equipment);

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Equipment resource deleted successfully.'
                ]);
            }

            return back()->with('success', 'Equipment resource deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete equipment resource: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Failed to delete equipment resource',
                    'error' => $e->getMessage()
                ], 422);
            }

            return back()->withErrors(['error' => 'Failed to delete equipment resource: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified material resource.
     */
    public function destroyMaterial(Request $request, Project $project, ProjectMaterial $material)
    {
        try {
            $this->resourceService->deleteResource($material);

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Material resource deleted successfully.'
                ]);
            }

            return back()->with('success', 'Material resource deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete material resource: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Failed to delete material resource',
                    'error' => $e->getMessage()
                ], 422);
            }

            return back()->withErrors(['error' => 'Failed to delete material resource: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified fuel resource.
     */
    public function destroyFuel(Request $request, Project $project, ProjectFuel $fuel)
    {
        try {
            $this->resourceService->deleteResource($fuel);

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Fuel resource deleted successfully.'
                ]);
            }

            return back()->with('success', 'Fuel resource deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete fuel resource: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Failed to delete fuel resource',
                    'error' => $e->getMessage()
                ], 422);
            }

            return back()->withErrors(['error' => 'Failed to delete fuel resource: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified expense resource.
     */
    public function destroyExpense(Request $request, Project $project, ProjectExpense $expense)
    {
        try {
            $this->resourceService->deleteResource($expense);

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Expense resource deleted successfully.'
                ]);
            }

            return back()->with('success', 'Expense resource deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete expense resource: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Failed to delete expense resource',
                    'error' => $e->getMessage()
                ], 422);
            }

            return back()->withErrors(['error' => 'Failed to delete expense resource: ' . $e->getMessage()]);
        }
    }

    /**
     * Generic method to handle resource deletion from the main Resources component
     */
    public function destroy(Request $request, Project $project, $resource)
    {
        // Get type from request input instead of query parameter
        $type = $request->input('type');

        if (!$type) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Resource type is required for deletion.'
                ], 400);
            }

            return redirect()->back()->with('error', 'Resource type is required for deletion.');
        }

        try {
            // Find the resource based on type and ID
            $resourceModel = null;

            switch ($type) {
                case 'manpower':
                    $resourceModel = ProjectManpower::findOrFail($resource);
                    break;
                case 'equipment':
                    $resourceModel = ProjectEquipment::findOrFail($resource);
                    break;
                case 'material':
                    $resourceModel = ProjectMaterial::findOrFail($resource);
                    break;
                case 'fuel':
                    $resourceModel = ProjectFuel::findOrFail($resource);
                    break;
                case 'expense':
                    $resourceModel = ProjectExpense::findOrFail($resource);
                    break;
                default:
                    if ($request->wantsJson()) {
                        return response()->json([
                            'message' => 'Invalid resource type.'
                        ], 400);
                    }
                    return redirect()->back()->with('error', 'Invalid resource type.');
            }

            $this->resourceService->deleteResource($resourceModel);

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => ucfirst($type) . ' resource deleted successfully.'
                ]);
            }

            return redirect()->back()->with('success', ucfirst($type) . ' resource deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Error deleting resource', [
                'type' => $type,
                'resource_id' => $resource,
                'error' => $e->getMessage()
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Failed to delete resource: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'Failed to delete resource: ' . $e->getMessage());
        }
    }
}


