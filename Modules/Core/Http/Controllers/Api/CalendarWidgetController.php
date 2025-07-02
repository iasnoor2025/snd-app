<?php

namespace Modules\Core\Http\Controllers\Api;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;

class CalendarWidgetController extends Controller
{
    /**
     * Get upcoming calendar events for dashboard widget.
     */
    public function events(Request $request)
    {
        // Example: return mock events, replace with real query as needed
        $events = [
            [
                'id' => 1,
                'title' => 'Project Kickoff',
                'date' => now()->addDays(1)->toDateString(),
            ],
            [
                'id' => 2,
                'title' => 'Equipment Maintenance',
                'date' => now()->addDays(3)->toDateString(),
            ],
        ];
        return response()->json([
            'data' => $events,
            'count' => count($events),
        ]);
    }
}
