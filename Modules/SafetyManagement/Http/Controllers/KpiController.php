<?php

namespace Modules\SafetyManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class KpiController extends Controller
{
    public function index(Request $request)
    {
        // Aggregate and return KPIs (stub)
        return response()->json([
            'incident_rate' => 0,
            'overdue_actions' => 0,
            'training_compliance' => 0,
        ]);
    }
}
