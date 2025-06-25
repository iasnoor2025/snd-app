<?php

namespace Modules\MobileBridge\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\MobileBridge\Services\ResponsiveLayoutService;

class LayoutConfigController extends Controller
{
    protected ResponsiveLayoutService $layoutService;

    public function __construct(ResponsiveLayoutService $layoutService)
    {
        $this->layoutService = $layoutService;
    }

    /**
     * Get layout configuration based on device and screen size
     */
    public function getConfig(Request $request): JsonResponse
    {
        // Check if layout needs to be recomputed
        if (!$this->layoutService->shouldRecomputeLayout($request)) {
            return response()->json([
                'message' => 'Layout configuration is up to date',
                'cached' => true,
            ]);
        }

        // Get layout configuration
        $config = $this->layoutService->getLayoutConfig();

        return response()->json($config);
    }

    /**
     * Optimize an image for the current device
     */
    public function optimizeImage(Request $request): JsonResponse
    {
        $request->validate([
            'src' => 'required|string',
            'width' => 'nullable|integer|min:1',
            'quality' => 'nullable|integer|between:1,100',
            'format' => 'nullable|string|in:webp,jpeg,png',
        ]);

        $options = array_filter([
            'width' => $request->input('width'),
            'quality' => $request->input('quality'),
            'format' => $request->input('format'),
        ]);

        $optimizedUrl = $this->layoutService->optimizeImage(
            $request->input('src'),
            $options
        );

        return response()->json([
            'url' => $optimizedUrl,
        ]);
    }

    /**
     * Generate responsive image srcset
     */
    public function generateSrcset(Request $request): JsonResponse
    {
        $request->validate([
            'src' => 'required|string',
            'quality' => 'nullable|integer|between:1,100',
            'format' => 'nullable|string|in:webp,jpeg,png',
        ]);

        $options = array_filter([
            'quality' => $request->input('quality'),
            'format' => $request->input('format'),
        ]);

        $srcset = $this->layoutService->generateImageSrcset(
            $request->input('src'),
            $options
        );

        return response()->json([
            'srcset' => $srcset,
        ]);
    }

    /**
     * Get gesture configuration for an element
     */
    public function getGestureConfig(Request $request): JsonResponse
    {
        $request->validate([
            'elementType' => 'required|string|in:carousel,modal,menu',
        ]);

        $config = $this->layoutService->getGestureOptions(
            $request->input('elementType')
        );

        return response()->json($config);
    }

    /**
     * Get navigation type based on device and screen size
     */
    public function getNavigationType(Request $request): JsonResponse
    {
        $type = $this->layoutService->getNavigationType();

        return response()->json([
            'type' => $type,
        ]);
    }
} 