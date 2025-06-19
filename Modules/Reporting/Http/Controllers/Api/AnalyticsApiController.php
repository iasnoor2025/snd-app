<?php

namespace Modules\Reporting\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class AnalyticsApiController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $data = ['revenue' => 485000, 'projects' => 18, 'utilization' => 89.3];
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function equipmentAnalytics(Request $request): JsonResponse
    {
        $data = ['total' => 150, 'active' => 98, 'rate' => 65.3];
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function projectAnalytics(Request $request): JsonResponse
    {
        $data = ['total' => 28, 'active' => 18, 'completion' => 85.7];
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function customerAnalytics(Request $request): JsonResponse
    {
        $data = ['total' => 156, 'active' => 89, 'retention' => 92.1];
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function financialAnalytics(Request $request): JsonResponse
    {
        $data = ['revenue' => 485000, 'expenses' => 320000, 'profit' => 165000];
        return response()->json(['success' => true, 'data' => $data]);
    }
}
