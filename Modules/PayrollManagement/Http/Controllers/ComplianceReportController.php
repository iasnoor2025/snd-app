<?php

namespace Modules\PayrollManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\PayrollManagement\Services\ComplianceReportService;

class ComplianceReportController extends Controller
{
    public function index(Request $request, ComplianceReportService $service)
    {
        $filters = $request->only(['month', 'year', 'employee_id']);
        $report = $service->generateReport($filters);
        return response()->json($report);
    }
}
