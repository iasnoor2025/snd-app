<?php

namespace Modules\Reporting\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class ReportBuilderApiController extends Controller
{
    public function templates(Request $request): JsonResponse
    {
        $data = [['id' => 1, 'name' => 'Equipment Template'], ['id' => 2, 'name' => 'Financial Template']];
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function getTemplate(Request $request, $template): JsonResponse
    {
        $data = ['id' => $template, 'name' => 'Template', 'fields' => ['field1', 'field2']];
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function generateReport(Request $request): JsonResponse
    {
        return response()->json(['success' => true, 'report_id' => uniqid()]);
    }

    public function saveCustomReport(Request $request): JsonResponse
    {
        return response()->json(['success' => true, 'message' => 'Report saved']);
    }

    public function getCustomReports(Request $request): JsonResponse
    {
        $data = [['id' => 1, 'name' => 'My Report']];
        return response()->json(['success' => true, 'data' => $data]);
    }
}
