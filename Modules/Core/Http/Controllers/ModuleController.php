<?php

namespace Modules\Core\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Modules\Core\Services\ModuleService;
use Modules\Core\ViewModels\ModuleViewModel;

class ModuleController extends Controller
{
    public function __construct(
        private readonly ModuleService $moduleService
    ) {}

    /**
     * Display a listing of the modules.
     */
    public function index(): View
    {
        $modules = $this->moduleService->getAllModules();
        $viewModel = new ModuleViewModel($modules);

        return view('core::modules.index', [
            'modules' => $viewModel->toArray()
        ]);
    }

    /**
     * Display the specified module.
     */
    public function show(string $name): View
    {
        $module = $this->moduleService->getModule($name);
        $viewModel = new ModuleViewModel($module);

        return view('core::modules.show', [
            'module' => $viewModel->toArray()
        ]);
    }

    /**
     * Initialize the specified module.
     */
    public function initialize(string $name): JsonResponse
    {
        try {
            $this->moduleService->initializeModule($name);
            return response()->json([
                'message' => 'Module initialized successfully',
                'status' => 'success'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Configure the specified module.
     */
    public function configure(Request $request, string $name): JsonResponse
    {
        try {
            $config = $request->validate([
                'settings' => 'required|array',
                'settings.*' => 'required|string'
            ]);

            $this->moduleService->configureModule($name, $config['settings']);
            return response()->json([
                'message' => 'Module configured successfully',
                'status' => 'success'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Get the status of the specified module.
     */
    public function status(string $name): JsonResponse
    {
        try {
            $status = $this->moduleService->getModuleStatus($name);
            return response()->json([
                'status' => $status,
                'message' => 'Module status retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Refresh modules status and return updated data.
     */
    public function refreshStatus(): JsonResponse
    {
        try {
            // Read the current modules_statuses.json file
            $statusesPath = public_path('modules_statuses.json');
            $statuses = [];

            if (file_exists($statusesPath)) {
                $statuses = json_decode(file_get_contents($statusesPath), true) ?? [];
            }

            // Update the modules status based on the service
            $modules = $this->moduleService->getAllModules();
            $updatedStatuses = [];

            foreach ($modules as $module) {
                $moduleName = $module['name'];
                $updatedStatuses[$moduleName] = $module['status'] === 'active';
            }

            // Write back to the file
            file_put_contents($statusesPath, json_encode($updatedStatuses, JSON_PRETTY_PRINT));

            return response()->json([
                'status' => 'success',
                'message' => 'Modules status refreshed successfully',
                'data' => $updatedStatuses
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Toggle module status.
     */
    public function toggleStatus(string $name): JsonResponse
    {
        try {
            $currentStatus = $this->moduleService->getModuleStatus($name);
            $newStatus = $currentStatus === 'active' ? 'inactive' : 'active';

            $this->moduleService->updateModuleStatus($name, $newStatus);

            // Update the modules_statuses.json file
            $statusesPath = public_path('modules_statuses.json');
            $statuses = [];

            if (file_exists($statusesPath)) {
                $statuses = json_decode(file_get_contents($statusesPath), true) ?? [];
            }

            $statuses[$name] = $newStatus === 'active';
            file_put_contents($statusesPath, json_encode($statuses, JSON_PRETTY_PRINT));

            return response()->json([
                'status' => 'success',
                'message' => "Module {$name} {$newStatus} successfully",
                'data' => [
                    'module' => $name,
                    'status' => $newStatus,
                    'enabled' => $newStatus === 'active'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'status' => 'error'
            ], 500);
        }
    }
}


