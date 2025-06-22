<?php

namespace Modules\Settings\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Controllers\Controller;
use Modules\Settings\Services\ReportSettingsService;

class ReportSettingsApiController extends Controller
{
    public function __construct(
        private ReportSettingsService $reportSettingsService
    ) {}

    /**
     * Get report settings
     */
    public function index(): JsonResponse
    {
        try {
            $settings = $this->reportSettingsService->getSettings();
            
            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve report settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update report settings
     */
    public function update(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'default_format' => 'string|in:pdf,excel,csv',
                'auto_generate_reports' => 'boolean',
                'report_retention_days' => 'integer|min:1|max:365',
                'email_reports' => 'boolean',
                'include_charts' => 'boolean',
                'report_templates' => 'array',
                'scheduled_reports' => 'array'
            ]);

            $settings = $this->reportSettingsService->updateSettings($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Report settings updated successfully',
                'data' => $settings
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update report settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 