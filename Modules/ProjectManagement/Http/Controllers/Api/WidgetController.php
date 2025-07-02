<?php

namespace Modules\ProjectManagement\Http\Controllers\Api;

use Illuminate\Routing\Controller;
use Modules\ProjectManagement\Domain\Models\Project;

class WidgetController extends Controller
{
    /**
     * Get all projects for dashboard widget.
     */
    public function all()
    {
        $projects = Project::select('id', 'name', 'status', 'start_date', 'end_date')
            ->get();

        return response()->json([
            'data' => $projects,
            'count' => $projects->count(),
        ]);
    }
}
