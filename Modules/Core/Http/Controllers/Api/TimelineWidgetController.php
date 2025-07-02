<?php

namespace Modules\Core\Http\Controllers\Api;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;

class TimelineWidgetController extends Controller
{
    /**
     * Get timeline events for dashboard widget.
     */
    public function index(Request $request)
    {
        // Example: return mock timeline, replace with real query as needed
        $timeline = [
            [
                'id' => 1,
                'event' => 'Employee Onboarded',
                'date' => now()->subDays(2)->toDateString(),
            ],
            [
                'id' => 2,
                'event' => 'Rental Completed',
                'date' => now()->subDays(1)->toDateString(),
            ],
        ];
        return response()->json([
            'data' => $timeline,
            'count' => count($timeline),
        ]);
    }
}
