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
}


