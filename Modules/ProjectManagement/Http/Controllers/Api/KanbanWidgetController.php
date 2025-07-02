<?php

namespace Modules\ProjectManagement\Http\Controllers\Api;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;

class KanbanWidgetController extends Controller
{
    /**
     * Get kanban board data for dashboard widget.
     */
    public function index(Request $request)
    {
        // Example: return mock kanban, replace with real query as needed
        $kanban = [
            'todo' => [
                ['id' => 1, 'task' => 'Prepare contract'],
            ],
            'in_progress' => [
                ['id' => 2, 'task' => 'Deliver equipment'],
            ],
            'done' => [
                ['id' => 3, 'task' => 'Invoice sent'],
            ],
        ];
        return response()->json($kanban);
    }
}
