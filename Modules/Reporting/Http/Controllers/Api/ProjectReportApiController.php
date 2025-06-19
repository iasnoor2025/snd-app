<?php

namespace Modules\Reporting\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class ProjectReportApiController extends Controller
{
    public function show(Request $request, $project): JsonResponse
    {
        $data = ['id' => $project, 'name' => 'Project Report', 'status' => 'active'];
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function financials(Request $request, $project): JsonResponse
    {
        $data = ['budget' => 2500000, 'spent' => 1712500];
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function utilization(Request $request, $project): JsonResponse
    {
        $data = ['utilization' => 89.3, 'equipment_count' => 15];
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function timesheets(Request $request, $project): JsonResponse
    {
        $data = ['total_hours' => 1850, 'employees' => 25];
        return response()->json(['success' => true, 'data' => $data]);
    }
}
