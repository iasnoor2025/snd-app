<?php

namespace Modules\Reporting\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\Reporting\Services\ReportExportService;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ReportExportController extends Controller
{
    protected ReportExportService $reportService;

    public function __construct(ReportExportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Generate a report
     */
    public function generate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string|in:financial,inventory,employee,project,equipment,rental',
            'data' => 'required|array',
            'options' => 'nullable|array',
            'options.template' => 'nullable|string',
            'options.paper' => 'nullable|string|in:a4,letter,legal',
            'options.orientation' => 'nullable|string|in:portrait,landscape',
            'options.watermark' => 'nullable|string',
            'options.show_watermark' => 'nullable|boolean',
            'options.include_header' => 'nullable|boolean',
            'options.include_footer' => 'nullable|boolean',
            'options.include_page_numbers' => 'nullable|boolean',
            'options.include_timestamp' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $path = $this->reportService->generateReport(
                $request->input('type'),
                $request->input('data'),
                $request->input('options', [])
            );

            $downloadUrl = Storage::temporaryUrl(
                $path,
                now()->addHours(24),
                ['Content-Type' => 'application/pdf']
            );

            return response()->json([
                'message' => 'Report generated successfully',
                'download_url' => $downloadUrl,
                'expires_at' => now()->addHours(24)->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate report',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate multiple reports in batch
     */
    public function generateBatch(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string|in:financial,inventory,employee,project,equipment,rental',
            'items' => 'required|array',
            'items.*' => 'required|array',
            'options' => 'nullable|array',
            'options.combine' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $paths = $this->reportService->generateBatchReports(
                $request->input('type'),
                $request->input('items'),
                $request->input('options', [])
            );

            $downloads = [];
            foreach ($paths as $path) {
                $downloads[] = [
                    'url' => Storage::temporaryUrl(
                        $path,
                        now()->addHours(24),
                        ['Content-Type' => 'application/pdf']
                    ),
                    'expires_at' => now()->addHours(24)->toIso8601String(),
                ];
            }

            return response()->json([
                'message' => 'Reports generated successfully',
                'downloads' => $downloads,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate reports',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Schedule a report for generation
     */
    public function schedule(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string|in:financial,inventory,employee,project,equipment,rental',
            'data' => 'required|array',
            'options' => 'nullable|array',
            'schedule_at' => 'nullable|date',
            'notify_email' => 'nullable|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $scheduledAt = $request->input('schedule_at')
                ? Carbon::parse($request->input('schedule_at'))
                : null;

            $this->reportService->scheduleReport(
                $request->input('type'),
                $request->input('data'),
                $request->input('options', []),
                $scheduledAt,
                $request->input('notify_email')
            );

            return response()->json([
                'message' => 'Report scheduled successfully',
                'scheduled_at' => $scheduledAt?->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to schedule report',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
} 